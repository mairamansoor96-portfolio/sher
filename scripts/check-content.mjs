// Content readiness report (docs/CONTENT.md). Same rules as the build, plus
// launch-readiness warnings and a check that past schedule days never change.
//
//   npm run check:content

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { LAUNCH_DATE, TIME_ZONE } from "../lib/config.ts";
import { MOMENTS } from "../lib/moments.ts";
import { dateKeyInZone, daysSince } from "../lib/today.ts";
import { MIN_PER_MOMENT, validate } from "../lib/validate.ts";

const read = (f) => JSON.parse(readFileSync(new URL(`../data/${f}`, import.meta.url), "utf8"));
const shers = read("shers.json");
const poets = read("poets.json");
const schedule = read("schedule.json");

let previousSchedule;
try {
  previousSchedule = JSON.parse(execFileSync("git", ["show", "HEAD:data/schedule.json"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }));
} catch {
  previousSchedule = undefined; // not a git checkout, or a new file
}

const today = dateKeyInZone(new Date(), TIME_ZONE);
const launched = today >= LAUNCH_DATE;
const { errors, warnings } = validate({ shers, poets, schedule, launched, previousSchedule });

const verified = shers.filter((s) => s.status === "verified");
const tick = (ok) => (ok ? "✓" : "✗");

console.log("Sher content check\n");
console.log(`Couplets   ${shers.length} total: ${verified.length} verified, ${shers.length - verified.length} draft`);
for (const p of poets) {
  const all = shers.filter((s) => s.poet === p.key);
  if (all.length) console.log(`           ${p.nameEn}: ${all.filter((s) => s.status === "verified").length}/${all.length} verified`);
}
const dayNow = daysSince(LAUNCH_DATE, today);
console.log(
  `Schedule   ${schedule.length} days before it repeats; launch ${LAUNCH_DATE} (${
    launched ? `date passed, today is day ${dayNow}` : `in ${-dayNow} day(s)`
  })`,
);
console.log(`\nMoments (verified couplets; ${MIN_PER_MOMENT}+ needed, 0 = hidden)`);
for (const { key, label } of MOMENTS) {
  const n = verified.filter((s) => s.moments.includes(key)).length;
  const draft = shers.filter((s) => s.status !== "verified" && s.moments.includes(key)).length;
  const mark = n >= MIN_PER_MOMENT ? "✓" : n === 0 ? "–" : "!";
  console.log(`  ${mark} ${label.padEnd(16)} ${String(n).padStart(3)}${draft ? `  (+${draft} draft)` : ""}`);
}

if (errors.length) console.log(`\nErrors (${errors.length}), the build will fail:\n  ${errors.join("\n  ")}`);
if (warnings.length) console.log(`\nWarnings (${warnings.length}):\n  ${warnings.join("\n  ")}`);

const scheduledVerified = schedule.every((id) => verified.some((s) => s.id === id));
const momentsOk = MOMENTS.every(({ key }) => {
  const n = verified.filter((s) => s.moments.includes(key)).length;
  return n === 0 || n >= MIN_PER_MOMENT;
});
console.log("\nLaunch readiness");
console.log(`  ${tick(errors.length === 0)} no content errors`);
console.log(`  ${tick(verified.length > 0)} at least one verified couplet`);
console.log(`  ${tick(scheduledVerified)} every scheduled couplet is verified`);
console.log(`  ${tick(momentsOk)} every shown moment has at least ${MIN_PER_MOMENT} couplets`);
console.log(`  ${tick(verified.every((s) => s.source.edition))} every verified couplet names its printed edition`);
console.log("  (see docs/CONTENT.md for the manual checks)");

process.exit(errors.length ? 1 : 0);
