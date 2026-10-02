import type { Moment } from "./types";

/** Every moment, in the order the Moments grid shows them. */
export const MOMENTS: { key: Moment; label: string }[] = [
  { key: "missing-someone", label: "Missing someone" },
  { key: "heartbreak", label: "Heartbreak" },
  { key: "longing", label: "Longing" },
  { key: "hope", label: "Hope" },
  { key: "rain", label: "Rain" },
  { key: "night", label: "Night" },
  { key: "eid", label: "Eid" },
  { key: "friendship", label: "Friendship" },
  { key: "pride", label: "Pride" },
  { key: "life-is-short", label: "Life is short" },
  { key: "humour", label: "Humour" },
];

export const MOMENT_KEYS = new Set<string>(MOMENTS.map((m) => m.key));

/** The first sentence of a meaning, for one-line previews in lists. */
export function firstSentence(text: string): string {
  return text.match(/^.*?[.?!](?=\s|$)/)?.[0] ?? text;
}
