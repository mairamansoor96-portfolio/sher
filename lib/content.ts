// Build-time content loading. Imported only from Server Components, so the
// JSON is read during `next build` and only visible couplets reach the browser.

import shersJson from "@/data/shers.json";
import poetsJson from "@/data/poets.json";
import scheduleJson from "@/data/schedule.json";
import { LAUNCH_DATE, TIME_ZONE } from "./config";
import { MOMENTS } from "./moments";
import { dateKeyInZone } from "./today";
import { validate } from "./validate";
import type { Moment, Poet, Sher } from "./types";

const allShers = shersJson as Sher[];
const allPoets = poetsJson as Poet[];
const fullSchedule = scheduleJson as string[];

/** Drafts are visible only in development; production shows verified only. */
export const SHOW_DRAFTS = process.env.NODE_ENV === "development";

const result = validate({
  shers: allShers,
  poets: allPoets,
  schedule: fullSchedule,
  // After launch, production must never shift past days.
  launched: !SHOW_DRAFTS && dateKeyInZone(new Date(), TIME_ZONE) >= LAUNCH_DATE,
});
if (result.errors.length) {
  throw new Error(`Invalid content in data/ (see docs/CONTENT.md):\n  ${result.errors.join("\n  ")}`);
}
if (!SHOW_DRAFTS) result.warnings.forEach((w) => console.warn(`[content] ${w}`));

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

export function getSher(id: string): Sher | undefined {
  return shers.find((s) => s.id === id);
}

export function getPoet(key: string): Poet | undefined {
  return poets.find((p) => p.key === key);
}

export function shersForMoment(moment: Moment): Sher[] {
  return shers.filter((s) => s.moments.includes(moment));
}

/** Moments with at least one couplet; empty moments are hidden. */
export const moments = MOMENTS.filter((m) => shersForMoment(m.key).length > 0);

/**
 * A static export fails on a dynamic route with no pages, which is what
 * production looks like before anything is verified. Routes then generate
 * this one placeholder, which renders a 404.
 */
export const PLACEHOLDER_PARAM = "_none";
