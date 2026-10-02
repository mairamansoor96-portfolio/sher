import { test } from "node:test";
import assert from "node:assert/strict";
import { isSaved, parseBayaz, restore, toggle } from "./bayaz.ts";

const t = (iso: string) => new Date(iso);

test("toggle saves newest first, and toggling again removes", () => {
  let list = toggle([], "a", t("2026-10-01T10:00:00Z"));
  list = toggle(list, "b", t("2026-10-02T10:00:00Z"));
  assert.deepEqual(list.map((e) => e.id), ["b", "a"]);
  list = toggle(list, "a", t("2026-10-03T10:00:00Z"));
  assert.deepEqual(list.map((e) => e.id), ["b"]);
  assert.equal(isSaved(list, "a"), false);
});

test("restore puts an entry back where it was", () => {
  const list = [
    { id: "c", savedAt: "2026-10-03T00:00:00.000Z" },
    { id: "a", savedAt: "2026-10-01T00:00:00.000Z" },
  ];
  const back = restore(list, { id: "b", savedAt: "2026-10-02T00:00:00.000Z" });
  assert.deepEqual(back.map((e) => e.id), ["c", "b", "a"]);
  assert.equal(restore(back, back[1]).length, 3); // no duplicate
});

test("parseBayaz tolerates missing, corrupt and odd data", () => {
  assert.deepEqual(parseBayaz(null), []);
  assert.deepEqual(parseBayaz('{"id":"x"}'), []);
  assert.throws(() => parseBayaz("not json")); // the store falls back to []
  const parsed = parseBayaz(
    JSON.stringify([
      { id: "a", savedAt: "2026-10-01T00:00:00Z", extra: 1 },
      { id: "b", savedAt: "2026-10-02T00:00:00Z" },
      { id: "a", savedAt: "2026-10-05T00:00:00Z" },
      { id: 3, savedAt: "x" },
      null,
    ]),
  );
  assert.deepEqual(parsed, [
    { id: "b", savedAt: "2026-10-02T00:00:00Z" },
    { id: "a", savedAt: "2026-10-01T00:00:00Z" },
  ]);
});
