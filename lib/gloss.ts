// Splits an Urdu line into plain text and glossed words, so the Words layer
// can make each glossed word tappable without changing the line's text.

import type { Gloss } from "./types";

export interface Segment {
  text: string;
  gloss?: Gloss;
}

const BOUNDARY = /[\s،۔؟!.,]/;
const isBoundary = (ch: string | undefined) => ch === undefined || BOUNDARY.test(ch);

/**
 * Index of `word` in `line`, preferring a whole-word match (so دم is not found
 * inside قدم), else the first occurrence, else -1.
 */
export function findWord(line: string, word: string): number {
  if (!word) return -1;
  let first = -1;
  for (let i = line.indexOf(word); i !== -1; i = line.indexOf(word, i + 1)) {
    if (first === -1) first = i;
    if (isBoundary(line[i - 1]) && isBoundary(line[i + word.length])) return i;
  }
  return first;
}

/** The line as segments; joining every segment's text gives back the line. */
export function segmentLine(line: string, glossary: readonly Gloss[]): Segment[] {
  const hits = glossary
    .map((gloss) => ({ gloss, at: findWord(line, gloss.word) }))
    .filter((h) => h.at >= 0)
    .sort((a, b) => a.at - b.at);

  const segments: Segment[] = [];
  let pos = 0;
  for (const { gloss, at } of hits) {
    if (at < pos) continue; // overlaps an earlier glossed word
    if (at > pos) segments.push({ text: line.slice(pos, at) });
    segments.push({ text: gloss.word, gloss });
    pos = at + gloss.word.length;
  }
  if (pos < line.length) segments.push({ text: line.slice(pos) });
  return segments;
}
