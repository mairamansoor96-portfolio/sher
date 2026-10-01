// Build-time content loading. Imported only from Server Components, so the
// JSON is read during `next build` and only visible couplets reach the browser.

import shersJson from "@/data/shers.json";
import poetsJson from "@/data/poets.json";
import scheduleJson from "@/data/schedule.json";
import type { Poet, Sher } from "./types";

const allShers = shersJson as Sher[];
const allPoets = poetsJson as Poet[];
const fullSchedule = scheduleJson as string[];

/** Drafts are visible only in development; production shows verified only. */
export const SHOW_DRAFTS = process.env.NODE_ENV === "development";

function validate() {
  const errors: string[] = [];
  const poetKeys = new Set(allPoets.map((p) => p.key));
  const ids = new Set<string>();

  for (const s of allShers) {
    if (ids.has(s.id)) errors.push(`${s.id}: duplicate id`);
    ids.add(s.id);
    if (!poetKeys.has(s.poet)) errors.push(`${s.id}: unknown poet "${s.poet}"`);
    if (s.lines.length !== 2) errors.push(`${s.id}: lines must have exactly 2 misras`);
    if (s.roman.length !== 2) errors.push(`${s.id}: roman must have exactly 2 lines`);
    for (const g of s.glossary) {
      if (!s.lines.some((line) => line.includes(g.word))) {
        errors.push(`${s.id}: glossary word "${g.word}" not found in lines`);
      }
    }
    if (s.attribution === "disputed" && !s.attributionNote) {
      errors.push(`${s.id}: disputed attribution needs an attributionNote`);
    }
  }
  for (const id of fullSchedule) {
    if (!ids.has(id)) errors.push(`schedule: unknown sher id "${id}"`);
  }
  if (errors.length) {
    throw new Error(`Invalid content in data/:\n  ${errors.join("\n  ")}`);
  }
}
validate();

export const shers: Sher[] = allShers.filter(
  (s) => SHOW_DRAFTS || s.status === "verified",
);

const visibleIds = new Set(shers.map((s) => s.id));

/**
 * The schedule, limited to couplets this build may show. Before launch every
 * scheduled couplet is verified, so this equals data/schedule.json in production.
 */
export const schedule: string[] = fullSchedule.filter((id) => visibleIds.has(id));

export const poets: Poet[] = allPoets;
