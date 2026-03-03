/**
 * Preprocesses raw chapter content into structured lines with markdown-like formatting.
 * Designed to handle "wall-of-text" content (few newlines, many characters) safely
 * without catastrophic regex backtracking.
 */

/** Split a long text into sentences safely (no regex backtracking risk) */
function splitSentences(text: string): string[] {
  const results: string[] = [];
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if ((ch === '.' || ch === '!' || ch === '?') && i + 1 < text.length) {
      const next = text[i + 1];
      // Check if next char is a space followed by uppercase (sentence boundary)
      if (next === ' ' && i + 2 < text.length && text[i + 2] >= 'A' && text[i + 2] <= 'Z') {
        results.push(text.slice(start, i + 1).trim());
        start = i + 2;
      }
      // Also handle quote then space then uppercase
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
  if (line.length > 200) return null; // Headings are never this long

  // Numbered main heading: "1. Economic Development in Pakistan"
  const numMain = line.match(/^(\d+)\.\s+([A-Z].{5,120})$/);
  if (numMain) return `**${line}**`;

  // Lettered sub-heading: "a. First Five Year Plan (1955-60)"
  const letSub = line.match(/^([a-i])\.\s+([A-Z].{5,120})$/);
  if (letSub) return `**${line}**`;

  // Roman numeral: "i. Mining"
  const romSub = line.match(/^(i{1,3}|iv|vi{0,3}|ix|x)\.\s+([A-Z].{2,120})$/);
  if (romSub) return `**${line}**`;

  // Lettered with paren: "a) Primary Sector"
  const letParen = line.match(/^([a-z])\)\s+([A-Z].{3,120})$/);
  if (letParen) return `**${line}**`;

  // Roman with paren: "i) Use of Chemical Fertilizer"
  const romParen = line.match(/^(i{1,3}|iv|vi{0,3}|ix|x)\)\s+([A-Z].{3,120})$/);
  if (romParen) return `**${line}**`;

  // Label lines: "Learning Outcomes:" etc.
  const labelMatch = line.match(/^(Learning Outcomes|Objectives|Summary|Conclusion|Introduction):\s*$/i);
  if (labelMatch) return `**${labelMatch[1]}:**`;

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
  // Numbered: "1. "
  const numMatch = line.match(/^(\d+\.\s+)/);
  if (numMatch) {
    return findHeadingBreak(line, numMatch[1].length);
  }

  // Lettered: "a. " or "a) "
  const letMatch = line.match(/^([a-i][.)]\s+)/);
  if (letMatch) {
    return findHeadingBreak(line, letMatch[1].length);
  }

  // Roman: "i. " or "ii) "
  const romMatch = line.match(/^((?:i{1,3}|iv|vi{0,3}|ix|x)[.)]\s+)/);
  if (romMatch) {
    return findHeadingBreak(line, romMatch[1].length);
  }

  return null;
}

function findHeadingBreak(line: string, prefixLen: number): [string, string] | null {
  // Look for a sentence boundary within the first 150 chars that looks like heading → body transition
  const searchEnd = Math.min(line.length, 150);
  // Look for patterns like "Plan (1955-60) At the time" — transition words after a space
  const transitionWords = [
    'At the ', 'The ', 'In ', 'This ', 'It ', 'After ', 'During ', 'As ',
    'However', 'There ', 'Under ', 'These ', 'To ', 'For the ', 'Pakistan ',
    'One ', 'Although ', 'With ', 'About ', 'Most ', 'Almost ', 'No ', 'An ',
    'Like ', 'Improved ', 'Today ', 'They ',
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

export function preprocessContent(raw: string): string {
  // If content already has markdown formatting with enough lines, return as-is
  const lineCount = raw.split("\n").length;
  if (raw.includes("**") && lineCount > 30) return raw;
  if (lineCount > 50) return raw;

  // Phase 1: Split the text into manageable lines
  // First split by existing newlines
  const rawLines = raw.split("\n");
  const expandedLines: string[] = [];

  for (const rawLine of rawLines) {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      expandedLines.push("");
      continue;
    }

    // If line is short enough, keep as-is
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

    // Group sentences: check if any sentence starts with a heading pattern
    for (const sentence of sentences) {
      expandedLines.push(sentence);
    }
  }

  // Phase 2: Detect headings and format them
  const formatted: string[] = [];
  for (const line of expandedLines) {
    const trimmed = line.trim();
    if (!trimmed) {
      formatted.push("");
      continue;
    }
    if (trimmed.startsWith("**")) {
      formatted.push(trimmed);
      continue;
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
