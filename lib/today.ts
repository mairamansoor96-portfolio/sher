// Pure date and schedule logic. Runs in the browser, because a static export
// is built once but visited every day.

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** The calendar date ("YYYY-MM-DD") that `now` falls on in `timeZone`. */
export function dateKeyInZone(now: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function dayNumber(dateKey: string): number {
  const [y, m, d] = dateKey.split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / MS_PER_DAY);
}

/** Whole calendar days from `launchKey` to `todayKey` (negative before launch). */
export function daysSince(launchKey: string, todayKey: string): number {
  return dayNumber(todayKey) - dayNumber(launchKey);
}

/** schedule[daysSinceLaunch % schedule.length], wrapping safely before launch. */
export function scheduledId(
  schedule: readonly string[],
  launchKey: string,
  todayKey: string,
): string | null {
  if (schedule.length === 0) return null;
  const n = daysSince(launchKey, todayKey);
  return schedule[((n % schedule.length) + schedule.length) % schedule.length];
}
