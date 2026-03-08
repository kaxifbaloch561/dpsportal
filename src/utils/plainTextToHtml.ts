/**
 * Converts plain text chapter content into professionally formatted HTML.
 * Detects headings, sub-headings, bullet points, bold markers, tables,
 * learning outcomes, numbered lists, roman numerals, and more.
 * 
 * The output HTML uses semantic tags (h1, h2, h3, h4, p, ul, ol, table, blockquote)
 * so the chapter-html-content CSS renders it beautifully.
 */

const BULLET_VERBS = [
  'discuss', 'describe', 'explain', 'define', 'identify', 'comprehend',
  'analyse', 'analyze', 'narrate', 'point out', 'enumerate', 'evaluate',
  'compare', 'differentiate', 'distinguish', 'list', 'state', 'mention',
  'highlight', 'outline', 'summarize', 'understand', 'know', 'recall',
  'recognize', 'classify', 'illustrate', 'interpret', 'apply', 'assess',
  'examine', 'explore', 'elaborate',
];

/** Check if content is already HTML */
function isAlreadyHtml(content: string): boolean {
  return /<[a-z][\s\S]*>/i.test(content) && (
    content.includes("<p>") || content.includes("<h1") || content.includes("<h2") ||
    content.includes("<img") || content.includes("<ul") || content.includes("<ol")
  );
}

/** Safely split long text into sentences without regex backtracking */
function splitSentences(text: string): string[] {
  const results: string[] = [];
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if ((ch === '.' || ch === '!' || ch === '?') && i + 1 < text.length) {
      const next = text[i + 1];
      if (next === ' ' && i + 2 < text.length) {
        const after = text[i + 2];
        if (after >= 'A' && after <= 'Z') {
          results.push(text.slice(start, i + 1).trim());
          start = i + 2;
          continue;
        }
        if (after >= '0' && after <= '9') {
          const look = text.slice(i + 2, i + 8);
          if (/^\d+\.\s/.test(look)) {
            results.push(text.slice(start, i + 1).trim());
            start = i + 2;
            continue;
          }
        }
        if (after >= 'a' && after <= 'i' && i + 3 < text.length && text[i + 3] === '.' && i + 4 < text.length && text[i + 4] === ' ' && i + 5 < text.length && text[i + 5] >= 'A' && text[i + 5] <= 'Z') {
          results.push(text.slice(start, i + 1).trim());
          start = i + 2;
          continue;
        }
        if ((after === 'i' || after === 'v' || after === 'x') && i + 3 < text.length) {
          const romanRest = text.slice(i + 2, i + 12);
          if (/^(?:i{1,3}|iv|vi{0,3}|ix|x)\.\s[A-Z]/.test(romanRest)) {
            results.push(text.slice(start, i + 1).trim());
            start = i + 2;
            continue;
          }
        }
        if (after >= 'a' && after <= 'z' && i + 3 < text.length && text[i + 3] === ')' && i + 4 < text.length && text[i + 4] === ' ' && i + 5 < text.length && text[i + 5] >= 'A' && text[i + 5] <= 'Z') {
          results.push(text.slice(start, i + 1).trim());
          start = i + 2;
          continue;
        }
        const rest = text.slice(i + 2);
        for (const verb of BULLET_VERBS) {
          if (rest.startsWith(verb + ' ') || rest.startsWith(verb + ',')) {
            results.push(text.slice(start, i + 1).trim());
            start = i + 2;
            break;
          }
        }
      }
    }
  }
  const rem = text.slice(start).trim();
  if (rem) results.push(rem);
  return results;
}

/** Escape HTML entities */
function esc(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Convert **bold** markers to <strong> tags */
function processBold(text: string): string {
  return esc(text).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

/** Check if line is a bullet verb item */
function isBulletItem(line: string): boolean {
  const lower = line.toLowerCase();
  return BULLET_VERBS.some(v => lower.startsWith(v + ' ') || lower.startsWith(v + ','));
}

interface ParsedLine {
  type: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'bullet' | 'numbered' | 'roman-heading' | 'letter-heading' | 'label' | 'empty' | 'table-row';
  text: string;
  num?: string;
  raw?: string;
}

function classifyLine(trimmed: string): ParsedLine {
  if (!trimmed) return { type: 'empty', text: '' };

  // Chapter title: "Chapter N: ..."
  const chapterMatch = trimmed.match(/^Chapter\s+(\d+):\s*(.+)/i);
  if (chapterMatch) return { type: 'h1', text: chapterMatch[2], num: chapterMatch[1] };

  // Bold-wrapped lines
  const fullBold = trimmed.match(/^\*\*(.*?)\*\*$/);
  if (fullBold) {
    const inner = fullBold[1];
    // Numbered main: "1. Title"
    const numMain = inner.match(/^(\d+)\.\s+(.+)/);
    if (numMain) return { type: 'h2', text: numMain[2], num: numMain[1] };
    // Roman: "I. Title"
    const romanMain = inner.match(/^([IVX]+)\.\s+(.+)/);
    if (romanMain) return { type: 'h3', text: romanMain[2], num: romanMain[1] };
    // Lettered: "a. Title" or "a) Title"
    const letterMain = inner.match(/^([a-z])[.)]\s+(.+)/);
    if (letterMain) return { type: 'h4', text: letterMain[2], num: letterMain[1] };
    // Roman lowercase: "i. Title"
    const romanLower = inner.match(/^(i{1,3}|iv|vi{0,3}|ix|x)[.)]\s+(.+)/);
    if (romanLower) return { type: 'h4', text: romanLower[2], num: romanLower[1] };
    // Numbered paren: "1) Title"
    const numParen = inner.match(/^(\d+)\)\s+(.+)/);
    if (numParen) return { type: 'h4', text: numParen[2], num: numParen[1] };
    // Plain bold heading
    return { type: 'h3', text: inner };
  }

  // Plain numbered heading: "1. Economic Development" (title-cased, reasonable length)
  const plainNum = trimmed.match(/^(\d+)\.\s+([A-Z][A-Za-z\s,()'-]{8,120})$/);
  if (plainNum) return { type: 'h2', text: plainNum[2], num: plainNum[1] };

  // Plain lettered heading: "a. First Five Year Plan..."
  const plainLetter = trimmed.match(/^([a-i])\.\s+([A-Z][A-Za-z0-9\s,()'-]{5,150})$/);
  if (plainLetter && plainLetter[2].length < 150) return { type: 'h4', text: plainLetter[2], num: plainLetter[1] };

  // Plain lettered paren: "a) Primary Sector" or "b) Small Industry"
  const plainLetterParen = trimmed.match(/^([a-z])\)\s+([A-Z][A-Za-z0-9\s,()'-]{3,150})$/);
  if (plainLetterParen && plainLetterParen[2].length < 150) return { type: 'h4', text: plainLetterParen[2], num: plainLetterParen[1] + ')' };

  // Roman numeral heading: "I. Importance of Agriculture"
  const romanUpper = trimmed.match(/^([IVX]+)\.\s+([A-Z][A-Za-z\s,()'-]{3,120})$/);
  if (romanUpper) return { type: 'h3', text: romanUpper[2], num: romanUpper[1] };

  // Roman lowercase heading: "i. Mining"
  const romanLower = trimmed.match(/^(i{1,3}|iv|vi{0,3}|ix|x)\.\s+([A-Z][A-Za-z\s,()'-]{2,120})$/);
  if (romanLower) return { type: 'roman-heading', text: romanLower[2], num: romanLower[1] };

  // Roman lowercase paren heading: "i) Canals"
  const romanLowerParen = trimmed.match(/^(i{1,3}|iv|vi{0,3}|ix|x)\)\s+([A-Z][A-Za-z\s,()'-]{2,120})$/);
  if (romanLowerParen) return { type: 'roman-heading', text: romanLowerParen[2], num: romanLowerParen[1] + ')' };

  // Label lines: "Learning Outcomes:", "Sector Description Examples" etc.
  const labelMatch = trimmed.match(/^(Learning Outcomes|Objectives|Summary|Conclusion|Introduction|Importance|Constraints|Reforms):\s*$/i);
  if (labelMatch) return { type: 'label', text: labelMatch[1] };

  // Bullet items: "- text"
  if (trimmed.startsWith('- ')) return { type: 'bullet', text: trimmed.slice(2) };

  // Numbered dash: "1- text"
  const numDash = trimmed.match(/^(\d+)-\s+(.+)/);
  if (numDash) return { type: 'numbered', text: numDash[2], num: numDash[1] };

  // Table-like lines with pipes or tab-separated columns
  if (trimmed.includes('|') && trimmed.split('|').length >= 3) return { type: 'table-row', text: trimmed, raw: trimmed };

  return { type: 'p', text: trimmed };
}

/** Try to split a heading+body combined line */
function trySplitHeadingBody(line: string): [ParsedLine, string] | null {
  if (line.length < 10 || line.length > 5000) return null;

  const transitionWords = [
    'At the ', 'The ', 'In ', 'This ', 'It ', 'After ', 'During ', 'As ',
    'However', 'There ', 'Under ', 'These ', 'To ', 'For the ',
    'One ', 'Although ', 'With ', 'About ', 'Most ', 'Almost ',
    'Like ', 'Today ', 'They ', 'According ', 'Since ',
    'Due ', 'Despite ', 'Because ', 'While ', 'When ', 'But ', 'So ',
    'Such ', 'Each ', 'Every ', 'Both ', 'Pakistan ', 'Our ',
    'Here ', 'Those ', 'Other ', 'Another ', 'New ', 'More ', 'A ',
  ];
  const incompleteEndings = ['in', 'of', 'to', 'for', 'at', 'by', 'on', 'the', 'a', 'an', 'and', 'or', 'with', 'from', 'into', 'upon', 'about'];

  // Check numbered heading pattern
  const numMatch = line.match(/^(\d+)\.\s+/);
  const letMatch = !numMatch ? line.match(/^([a-i])[.)]\s+/) : null;
  const romMatch = !numMatch && !letMatch ? line.match(/^((?:i{1,3}|iv|vi{0,3}|ix|x)[.)]\s+)/) : null;
  const romUpperMatch = !numMatch && !letMatch && !romMatch ? line.match(/^([IVX]+)\.\s+/) : null;

  const prefix = numMatch || letMatch || romMatch || romUpperMatch;
  if (!prefix) return null;

  const prefixLen = prefix[0].length;
  const searchEnd = Math.min(line.length, 160);

  for (let i = prefixLen + 3; i < searchEnd; i++) {
    if (line[i] === ' ') {
      const rest = line.slice(i + 1);
      for (const tw of transitionWords) {
        if (rest.startsWith(tw)) {
          const heading = line.slice(0, i).trim();
          if (heading.length > 4 && heading.length < 160) {
            const lastWord = heading.split(' ').pop()?.toLowerCase() || '';
            if (incompleteEndings.includes(lastWord)) continue;
            const classified = classifyLine(heading);
            if (classified.type !== 'p') {
              return [classified, line.slice(i + 1)];
            }
          }
        }
      }
    }
  }
  return null;
}

/** Expand long lines into individual lines by splitting sentences */
function expandLines(raw: string): string[] {
  const rawLines = raw.split('\n');
  const result: string[] = [];

  for (const rawLine of rawLines) {
    const trimmed = rawLine.trim();
    if (!trimmed) { result.push(''); continue; }
    if (trimmed.length < 300) { result.push(trimmed); continue; }
    const sentences = splitSentences(trimmed);
    if (sentences.length <= 1) { result.push(trimmed); continue; }
    for (const s of sentences) result.push(s);
  }
  return result;
}

/** Detect and collect table rows (pipe-separated) */
function isTableRow(line: string): boolean {
  return line.includes('|') && line.split('|').filter(c => c.trim()).length >= 2;
}

function isSeparatorRow(line: string): boolean {
  return /^\|?[\s:]*-{2,}[\s:|]*-{2,}/.test(line);
}

function buildTable(rows: string[]): string {
  const parsed = rows
    .filter(r => !isSeparatorRow(r))
    .map(r => r.split('|').map(c => c.trim()).filter(Boolean));

  if (parsed.length === 0) return '';

  const headerRow = parsed[0];
  const bodyRows = parsed.slice(1);

  let html = '<table><thead><tr>';
  for (const cell of headerRow) {
    html += `<th>${processBold(cell)}</th>`;
  }
  html += '</tr></thead><tbody>';
  for (const row of bodyRows) {
    html += '<tr>';
    for (let i = 0; i < headerRow.length; i++) {
      html += `<td>${processBold(row[i] || '')}</td>`;
    }
    html += '</tr>';
  }
  html += '</tbody></table>';
  return html;
}

/** Main converter: plain text → professional HTML */
export function plainTextToHtml(raw: string): string {
  // Skip if already HTML
  if (isAlreadyHtml(raw)) return raw;

  const lines = expandLines(raw);
  const html: string[] = [];
  let inBulletSection = false;
  let bulletBuffer: string[] = [];
  let tableBuffer: string[] = [];
  let paragraphBuffer: string[] = [];

  const flushBullets = () => {
    if (bulletBuffer.length === 0) return;
    html.push('<ul>');
    for (const b of bulletBuffer) html.push(`<li>${processBold(b)}</li>`);
    html.push('</ul>');
    bulletBuffer = [];
  };

  const flushTable = () => {
    if (tableBuffer.length === 0) return;
    html.push(buildTable(tableBuffer));
    tableBuffer = [];
  };

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) return;
    const text = paragraphBuffer.join(' ');
    html.push(`<p>${processBold(text)}</p>`);
    paragraphBuffer = [];
  };

  for (let idx = 0; idx < lines.length; idx++) {
    const trimmed = lines[idx].trim();

    // Handle table rows
    if (trimmed && isTableRow(trimmed)) {
      flushBullets();
      flushParagraph();
      tableBuffer.push(trimmed);
      continue;
    }
    if (tableBuffer.length > 0) {
      flushTable();
    }

    // Empty line
    if (!trimmed) {
      flushBullets();
      flushParagraph();
      inBulletSection = false;
      continue;
    }

    // If in bullet section and line starts with a verb
    if (inBulletSection && isBulletItem(trimmed)) {
      flushParagraph();
      bulletBuffer.push(trimmed.charAt(0).toUpperCase() + trimmed.slice(1));
      continue;
    }

    // Try to split heading+body combined lines
    const split = trySplitHeadingBody(trimmed);
    if (split) {
      flushBullets();
      flushParagraph();
      inBulletSection = false;

      const [headingParsed, bodyText] = split;
      html.push(renderHeading(headingParsed));
      // Process body text
      paragraphBuffer.push(bodyText);
      continue;
    }

    const parsed = classifyLine(trimmed);

    switch (parsed.type) {
      case 'h1':
        flushBullets();
        flushParagraph();
        inBulletSection = false;
        html.push(`<h1>${esc(parsed.text)}</h1>`);
        break;

      case 'h2':
        flushBullets();
        flushParagraph();
        inBulletSection = false;
        html.push(`<h2>${parsed.num ? parsed.num + '. ' : ''}${esc(parsed.text)}</h2>`);
        break;

      case 'h3':
        flushBullets();
        flushParagraph();
        inBulletSection = false;
        html.push(`<h3>${parsed.num ? parsed.num + '. ' : ''}${esc(parsed.text)}</h3>`);
        break;

      case 'h4':
      case 'roman-heading':
      case 'letter-heading':
        flushBullets();
        flushParagraph();
        inBulletSection = false;
        html.push(`<h4>${parsed.num ? parsed.num + (parsed.num.endsWith(')') ? ' ' : '. ') : ''}${esc(parsed.text)}</h4>`);
        break;

      case 'label':
        flushBullets();
        flushParagraph();
        html.push(`<h3>${esc(parsed.text)}</h3>`);
        // Check if next content is learning outcomes
        if (parsed.text.toLowerCase().includes('learning outcomes') || parsed.text.toLowerCase().includes('objectives')) {
          inBulletSection = true;
        }
        break;

      case 'bullet':
        flushParagraph();
        bulletBuffer.push(parsed.text);
        break;

      case 'numbered':
        flushBullets();
        flushParagraph();
        html.push(`<p><strong>${parsed.num}.</strong> ${processBold(parsed.text)}</p>`);
        break;

      case 'empty':
        flushBullets();
        flushParagraph();
        break;

      case 'p':
      default:
        flushBullets();
        // Check if this looks like an intro line before bullets
        if (trimmed.toLowerCase().includes('enable the students to') || trimmed.toLowerCase().includes('will be able to')) {
          flushParagraph();
          html.push(`<p>${processBold(trimmed)}</p>`);
          inBulletSection = true;
        } else {
          paragraphBuffer.push(trimmed);
          // Group 3-4 sentences into paragraphs
          if (paragraphBuffer.length >= 4) {
            flushParagraph();
          }
        }
        break;
    }
  }

  // Flush remaining
  flushTable();
  flushBullets();
  flushParagraph();

  return html.join('\n');
}

function renderHeading(parsed: ParsedLine): string {
  switch (parsed.type) {
    case 'h1':
      return `<h1>${esc(parsed.text)}</h1>`;
    case 'h2':
      return `<h2>${parsed.num ? parsed.num + '. ' : ''}${esc(parsed.text)}</h2>`;
    case 'h3':
      return `<h3>${parsed.num ? parsed.num + '. ' : ''}${esc(parsed.text)}</h3>`;
    case 'h4':
    case 'roman-heading':
    case 'letter-heading':
      return `<h4>${parsed.num ? parsed.num + (parsed.num.endsWith(')') ? ' ' : '. ') : ''}${esc(parsed.text)}</h4>`;
    default:
      return `<p>${processBold(parsed.text)}</p>`;
  }
}
