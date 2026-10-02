// The bayaz: couplets saved on this device, newest first. Pure functions;
// the localStorage wiring is in bayaz-store.ts.

export interface BayazEntry {
  id: string;
  savedAt: string; // ISO timestamp
}

export function parseBayaz(raw: string | null): BayazEntry[] {
  const value: unknown = raw ? JSON.parse(raw) : [];
  if (!Array.isArray(value)) return [];
  const entries: BayazEntry[] = [];
  const seen = new Set<string>();
  for (const e of value) {
    if (typeof e?.id !== "string" || typeof e?.savedAt !== "string" || seen.has(e.id)) continue;
    seen.add(e.id);
    entries.push({ id: e.id, savedAt: e.savedAt });
  }
  return entries.sort(newestFirst);
}

const newestFirst = (a: BayazEntry, b: BayazEntry) => b.savedAt.localeCompare(a.savedAt);

export function isSaved(list: readonly BayazEntry[], id: string): boolean {
  return list.some((e) => e.id === id);
}

/** Saves the couplet at `now`, or removes it if it is already saved. */
export function toggle(list: readonly BayazEntry[], id: string, now: Date): BayazEntry[] {
  return isSaved(list, id)
    ? list.filter((e) => e.id !== id)
    : [{ id, savedAt: now.toISOString() }, ...list];
}

/** Puts a removed entry back in its original place (undo). */
export function restore(list: readonly BayazEntry[], entry: BayazEntry): BayazEntry[] {
  if (isSaved(list, entry.id)) return [...list];
  return [...list, entry].sort(newestFirst);
}
