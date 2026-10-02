import { test } from "node:test";
import assert from "node:assert/strict";
import { addDays, dateKeyInZone, daysSince, scheduledId } from "./today.ts";

const schedule = ["a", "b", "c", "d", "e"];

test("day changes at midnight Asia/Karachi (UTC+5), not UTC", () => {
  // 18:59 UTC = 23:59 PKT, still 1 Oct in Pakistan
  assert.equal(dateKeyInZone(new Date("2026-10-01T18:59:00Z"), "Asia/Karachi"), "2026-10-01");
  // 19:00 UTC = 00:00 PKT, now 2 Oct in Pakistan while UTC is still 1 Oct
  assert.equal(dateKeyInZone(new Date("2026-10-01T19:00:00Z"), "Asia/Karachi"), "2026-10-02");
});

test("daysSince counts calendar days across months and years", () => {
  assert.equal(daysSince("2026-10-01", "2026-10-01"), 0);
  assert.equal(daysSince("2026-10-01", "2026-11-01"), 31);
  assert.equal(daysSince("2026-10-01", "2027-10-01"), 365);
  assert.equal(daysSince("2026-10-01", "2026-09-30"), -1);
});

test("scheduledId is schedule[daysSinceLaunch % length]", () => {
  assert.equal(scheduledId(schedule, "2026-10-01", "2026-10-01"), "a");
  assert.equal(scheduledId(schedule, "2026-10-01", "2026-10-02"), "b");
  assert.equal(scheduledId(schedule, "2026-10-01", "2026-10-06"), "a");
  assert.equal(scheduledId(schedule, "2026-10-01", "2026-09-30"), "e");
  assert.equal(scheduledId([], "2026-10-01", "2026-10-01"), null);
});

test("addDays crosses month and year ends", () => {
  assert.equal(addDays("2026-10-01", -1), "2026-09-30");
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(addDays("2028-02-28", 1), "2028-02-29");
});
