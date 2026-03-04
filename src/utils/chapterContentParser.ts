/**
 * Preprocesses raw chapter content into structured lines with markdown-like formatting.
 * Handles "wall-of-text" content (few newlines, many characters) safely
 * without catastrophic regex backtracking.
 */

// Common learning-outcome / bullet-start verbs (lowercase)
const BULLET_VERBS = [
  'discuss', 'describe', 'explain', 'define', 'identify', 'comprehend',
  'analyse', 'analyze', 'narrate', 'point out', 'enumerate', 'evaluate',
  'compare', 'differentiate', 'distinguish', 'list', 'state', 'mention',
  'highlight', 'outline', 'summarize', 'understand', 'know', 'recall',
  'recognize', 'classify', 'illustrate', 'interpret', 'apply', 'assess',
  'examine', 'explore', 'elaborate',
];

/** Split a long text into sentences safely (no regex backtracking risk) */
function splitSentences(text: string): string[] {
  const results: string[] = [];
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if ((ch === '.' || ch === '!' || ch === '?') && i + 1 < text.length) {
      const next = text[i + 1];
      if (next === ' ' && i + 2 < text.length) {
        const afterSpace = text[i + 2];
        // Sentence boundary: uppercase letter
        if (afterSpace >= 'A' && afterSpace <= 'Z') {
          results.push(text.slice(start, i + 1).trim());
          start = i + 2;
          continue;
        }
        // Sentence boundary: digit followed by ". " (numbered heading like "1. ")
        if (afterSpace >= '0' && afterSpace <= '9') {
          const lookAhead = text.slice(i + 2, i + 8);
          if (/^\d+\.\s/.test(lookAhead)) {
            results.push(text.slice(start, i + 1).trim());
            start = i + 2;
            continue;
          }
        }
        // Sentence boundary: lowercase letter followed by ". " then uppercase (lettered sub-heading like "a. First Five Year Plan")
        if (afterSpace >= 'a' && afterSpace <= 'i' && i + 3 < text.length && text[i + 3] === '.' && i + 4 < text.length && text[i + 4] === ' ' && i + 5 < text.length && text[i + 5] >= 'A' && text[i + 5] <= 'Z') {
          results.push(text.slice(start, i + 1).trim());
          start = i + 2;
          continue;
        }
        // Sentence boundary: roman numeral patterns followed by ". " then uppercase (e.g. "i. Mining", "ii. Agriculture")
        if ((afterSpace === 'i' || afterSpace === 'v' || afterSpace === 'x') && i + 3 < text.length) {
          const romanRest = text.slice(i + 2, i + 12);
          if (/^(?:i{1,3}|iv|vi{0,3}|ix|x)\.\s[A-Z]/.test(romanRest)) {
            results.push(text.slice(start, i + 1).trim());
            start = i + 2;
            continue;
          }
        }
        // Sentence boundary: lowercase verb that starts a bullet item
        const restAfterDot = text.slice(i + 2);
        for (const verb of BULLET_VERBS) {
          if (restAfterDot.startsWith(verb + ' ') || restAfterDot.startsWith(verb + ',')) {
            results.push(text.slice(start, i + 1).trim());
            start = i + 2;
            break;
          }
        }
      }
      // Handle quote then space then uppercase
      if ((next === '"' || next === "'") && i + 2 < text.length && text[i + 2] === ' ' && i + 3 < text.length && text[i + 3] >= 'A' && text[i + 3] <= 'Z') {
        results.push(text.slice(start, i + 2).trim());
        start = i + 3;
      }
    }
  }
  const remainder = text.slice(start).trim();
  if (remainder) results.push(remainder);
  return results;
}

/** Detect if a short string is a heading pattern. Returns formatted heading or null. */
function detectHeading(line: string): string | null {
  if (line.length > 200) return null;

  // Numbered main heading: "1. Economic Development in Pakistan"
  if (/^(\d+)\.\s+([A-Z].{5,120})$/.test(line)) return `**${line}**`;

  // Lettered sub-heading: "a. First Five Year Plan (1955-60)"
  if (/^([a-i])\.\s+([A-Z].{5,120})$/.test(line)) return `**${line}**`;

  // Roman numeral: "i. Mining"
  if (/^(i{1,3}|iv|vi{0,3}|ix|x)\.\s+([A-Z].{2,120})$/.test(line)) return `**${line}**`;

  // Lettered with paren: "a) Primary Sector"
  if (/^([a-z])\)\s+([A-Z].{3,120})$/.test(line)) return `**${line}**`;

  // Roman with paren: "i) Use of Chemical Fertilizer"
  if (/^(i{1,3}|iv|vi{0,3}|ix|x)\)\s+([A-Z].{3,120})$/.test(line)) return `**${line}**`;

  // Label lines: "Learning Outcomes:" etc.
  if (/^(Learning Outcomes|Objectives|Summary|Conclusion|Introduction):\s*$/i.test(line)) {
    return `**${line.replace(/:\s*$/, '')}:**`;
  }

  return null;
}

/**
 * Try to split a line that starts with a heading pattern followed by body text.
 * E.g. "1. Economic Development in Pakistan At the time of independence..."
 * Returns [heading, body] or null.
 */
function trySplitHeadingBody(line: string): [string, string] | null {
  if (line.length < 10 || line.length > 5000) return null;

  // Only process lines starting with heading-like patterns
  const numMatch = line.match(/^(\d+\.\s+)/);
  if (numMatch) return findHeadingBreak(line, numMatch[1].length);

  const letMatch = line.match(/^([a-i][.)]\s+)/);
  if (letMatch) return findHeadingBreak(line, letMatch[1].length);

  const romMatch = line.match(/^((?:i{1,3}|iv|vi{0,3}|ix|x)[.)]\s+)/);
  if (romMatch) return findHeadingBreak(line, romMatch[1].length);

  return null;
}

function findHeadingBreak(line: string, prefixLen: number): [string, string] | null {
  const searchEnd = Math.min(line.length, 150);
  const transitionWords = [
    'At the ', 'The ', 'In ', 'This ', 'It ', 'After ', 'During ', 'As ',
    'However', 'There ', 'Under ', 'These ', 'To ', 'For the ', 'Pakistan ',
    'One ', 'Although ', 'With ', 'About ', 'Most ', 'Almost ', 'No ', 'An ',
    'Like ', 'Improved ', 'Today ', 'They ', 'According ', 'Since ', 'Before ',
    'Between ', 'From ', 'Some ', 'Many ', 'Several ', 'All ', 'Various ',
  ];

  for (let i = prefixLen + 5; i < searchEnd; i++) {
    if (line[i] === ' ') {
      const rest = line.slice(i + 1);
      for (const tw of transitionWords) {
        if (rest.startsWith(tw)) {
          const heading = line.slice(0, i).trim();
          if (heading.length > 5 && heading.length < 150) {
            return [`**${heading}**`, line.slice(i + 1)];
          }
        }
      }
    }
  }
  return null;
}

/**
 * Detect if a line is a "label:" pattern followed by content.
 * E.g. "Learning Outcomes: The study of this chapter..."
 * Returns [label, rest] or null.
 */
function splitLabelContent(line: string): [string, string] | null {
  const match = line.match(/^(Learning Outcomes|Objectives|Summary|Conclusion|Introduction):\s+(.+)/i);
  if (match) return [match[1], match[2]];
  return null;
}

/**
 * Check if a sentence looks like a learning outcome / bullet item
 * (starts with a lowercase verb from our list)
 */
function isBulletItem(sentence: string): boolean {
  const lower = sentence.toLowerCase();
  return BULLET_VERBS.some(v => lower.startsWith(v + ' ') || lower.startsWith(v + ','));
}

export function preprocessContent(raw: string): string {
  // If content already has markdown formatting with enough lines, return as-is
  const lineCount = raw.split("\n").length;
  if (raw.includes("**") && lineCount > 30) return raw;
  if (lineCount > 50) return raw;

  // Phase 1: Split the text into manageable lines
  const rawLines = raw.split("\n");
  const expandedLines: string[] = [];

  for (const rawLine of rawLines) {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      expandedLines.push("");
      continue;
    }

    if (trimmed.length < 300) {
      expandedLines.push(trimmed);
      continue;
    }

    // Long line: split by sentences first
    const sentences = splitSentences(trimmed);
    if (sentences.length <= 1) {
      expandedLines.push(trimmed);
      continue;
    }

    for (const sentence of sentences) {
      expandedLines.push(sentence);
    }
  }

  // Phase 2: Detect labels, headings, bullet items, and format them
  const formatted: string[] = [];
  let inBulletSection = false; // Track if we're in a learning outcomes / bullet section

  for (let idx = 0; idx < expandedLines.length; idx++) {
    const line = expandedLines[idx];
    const trimmed = line.trim();
    if (!trimmed) {
      formatted.push("");
      inBulletSection = false;
      continue;
    }
    if (trimmed.startsWith("**")) {
      formatted.push(trimmed);
      continue;
    }

    // Check for "Label: content" pattern (e.g. "Learning Outcomes: The study...")
    const labelSplit = splitLabelContent(trimmed);
    if (labelSplit) {
      formatted.push(`**${labelSplit[0]}:**`);
      formatted.push("");
      // The rest after the label - try to process it
      const restSentences = splitSentences(labelSplit[1]);
      // Check if first sentence is intro text like "The study of this chapter..."
      for (const s of restSentences) {
        if (isBulletItem(s)) {
          formatted.push(`- ${s.charAt(0).toUpperCase()}${s.slice(1)}`);
          inBulletSection = true;
        } else {
          formatted.push(s);
          // If this looks like intro text before bullets, set flag
          if (s.toLowerCase().includes('enable the students to') || s.toLowerCase().includes('will be able to')) {
            inBulletSection = true;
          }
        }
      }
      continue;
    }

    // If we're in a bullet section and the line starts with a verb, make it a bullet
    if (inBulletSection && isBulletItem(trimmed)) {
      formatted.push(`- ${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}`);
      continue;
    }

    // Stop bullet section when we hit a numbered heading
    if (/^\d+\.\s+[A-Z]/.test(trimmed)) {
      inBulletSection = false;
    }

    // Try pure heading detection (entire line is a heading)
    const heading = detectHeading(trimmed);
    if (heading) {
      formatted.push(heading);
      continue;
    }

    // Try splitting heading + body
    const split = trySplitHeadingBody(trimmed);
    if (split) {
      formatted.push(split[0]);
      formatted.push(split[1]);
      inBulletSection = false;
      continue;
    }

    formatted.push(trimmed);
  }

  // Phase 3: Group plain sentences into paragraphs (every 3-4 sentences)
  const result: string[] = [];
  let paragraphBuffer: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length > 0) {
      result.push(paragraphBuffer.join(" "));
      paragraphBuffer = [];
    }
  };

  for (const line of formatted) {
    if (!line) {
      flushParagraph();
      result.push("");
      continue;
    }
    if (line.startsWith("**") || line.startsWith("- ")) {
      flushParagraph();
      result.push(line);
      continue;
    }
    // Check if it's a list item pattern
    if (/^(\([a-z]\)|[a-z]\)|[ivx]+[.)]\s|[a-i]\.\s|\d+-\s)/.test(line)) {
      flushParagraph();
      result.push(line);
      continue;
    }

    paragraphBuffer.push(line);
    if (paragraphBuffer.length >= 4) {
      flushParagraph();
    }
  }
  flushParagraph();

  return result.join("\n");
}
