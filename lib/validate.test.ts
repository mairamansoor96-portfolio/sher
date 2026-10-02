import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validate } from "./validate.ts";
import type { Poet, Sher } from "./types";

const load = <T,>(f: string): T => JSON.parse(readFileSync(new URL(`../data/${f}`, import.meta.url), "utf8"));
const seed = () => ({
  shers: load<Sher[]>("shers.json"),
  poets: load<Poet[]>("poets.json"),
  schedule: load<string[]>("schedule.json"),
});
const has = (list: string[], text: string) => list.some((e) => e.includes(text));

test("the seed data has no errors", () => {
  const { errors, warnings } = validate(seed());
  assert.deepEqual(errors, []);
  assert.ok(has(warnings, "is not verified")); // all seeds are drafts
});

test("an unfilled template is rejected", () => {
  const d = seed();
  d.shers[0].meaningEn = "TODO: plain English meaning";
  assert.ok(has(validate(d).errors, "TODO placeholders"));
});

test("copyright: only public-domain poets; Iqbal only from Bang-e-Dara", () => {
  const d = seed();
  d.poets.push({ key: "faiz", nameEn: "Faiz Ahmad Faiz", nameUr: "فیض", years: "1911-1984", bioEn: "x" });
  d.poets.push({ key: "iqbal", nameEn: "Muhammad Iqbal", nameUr: "اقبال", years: "1877-1938", bioEn: "x" });
  d.shers[0].poet = "iqbal";
  d.shers[0].source.work = "Bal-e-Jibril";
  const { errors } = validate(d);
  assert.ok(has(errors, `poet "faiz": not on the public-domain list`));
  assert.ok(has(errors, "Iqbal only for couplets published before 1929"));
  d.shers[0].source.work = "Bang-e-Dara";
  assert.ok(!has(validate(d).errors, "Iqbal only"));
});

test("verified needs a printed edition; page is a warning", () => {
  const d = seed();
  d.shers[0].status = "verified";
  assert.ok(has(validate(d).errors, "source.edition is empty"));
  d.shers[0].source.edition = "Editor, Publisher, Year";
  const r = validate(d);
  assert.ok(!has(r.errors, "source.edition"));
  assert.ok(has(r.warnings, "verified without source.page"));
});

test("glossary words must match the lines exactly", () => {
  const d = seed();
  d.shers[0].glossary[0].word = "خواہشات";
  assert.ok(has(validate(d).errors, `glossary word "خواہشات" not found`));
});

test("after launch: scheduled couplets must be verified and past days fixed", () => {
  const d = seed();
  // Nothing verified yet: production has only shown the empty state.
  assert.deepEqual(validate({ ...d, launched: true }).errors, []);
  d.shers[0].status = "verified";
  d.shers[0].source.edition = "Editor, Publisher, Year";
  assert.ok(has(validate({ ...d, launched: true }).errors, "is not verified"));
  for (const s of d.shers) {
    s.status = "verified";
    s.source.edition = "Editor, Publisher, Year";
    s.source.page = "1";
  }
  const previous = [...d.schedule];
  assert.deepEqual(validate({ ...d, launched: true, previousSchedule: previous }).errors, []);
  const appended = { ...d, schedule: [...d.schedule], launched: true, previousSchedule: previous };
  assert.deepEqual(validate(appended).errors, []);
  const swapped = [previous[1], previous[0], ...previous.slice(2)];
  assert.ok(has(validate({ ...d, schedule: swapped, launched: true, previousSchedule: previous }).errors, "changed after launch"));
});

test("schedule: no unknown or repeated ids", () => {
  const d = seed();
  d.schedule.push("no-such-sher", d.schedule[0]);
  const { errors } = validate(d);
  assert.ok(has(errors, `unknown sher id "no-such-sher"`));
  assert.ok(has(errors, "is already scheduled"));
});

test("moments need three verified couplets before launch", () => {
  const d = seed();
  d.shers[3].status = "verified"; // dagh: humour, missing-someone
  d.shers[3].source.edition = "Editor, Publisher, Year";
  assert.ok(has(validate(d).warnings, `moment "humour": 1 verified couplet(s)`));
});
