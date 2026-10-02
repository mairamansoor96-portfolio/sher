import { test } from "node:test";
import assert from "node:assert/strict";
import { findWord, segmentLine } from "./gloss.ts";

const g = (word: string) => ({ word, roman: word, meaning: word });

test("findWord prefers a whole word over a match inside another word", () => {
  assert.equal(findWord("قدم دم", "دم"), 4);
  assert.equal(findWord("قدم", "دم"), 1); // falls back to a partial match
  assert.equal(findWord("کوئی امید", "دم"), -1);
  assert.equal(findWord("کوئی امید", ""), -1);
});

test("segmentLine marks glossed words and keeps the line intact", () => {
  const line = "ہزاروں خواہشیں ایسی کہ ہر خواہش پہ دم نکلے";
  const segs = segmentLine(line, [g("دم"), g("خواہشیں")]);
  assert.equal(segs.map((s) => s.text).join(""), line);
  assert.deepEqual(
    segs.filter((s) => s.gloss).map((s) => s.text),
    ["خواہشیں", "دم"],
  );
});

test("segmentLine skips glosses absent from the line and overlapping ones", () => {
  const line = "دل ناداں تجھے ہوا کیا ہے";
  const segs = segmentLine(line, [g("دوا"), g("ناداں"), g("ناد")]);
  assert.equal(segs.map((s) => s.text).join(""), line);
  assert.deepEqual(segs.filter((s) => s.gloss).map((s) => s.text), ["ناداں"]);
});
