import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_OPTIONS, getSize, parseOptions, POSTER_SIZES } from "./options.ts";

test("the four sizes from the spec", () => {
  assert.deepEqual(
    POSTER_SIZES.map((s) => `${s.width}x${s.height}`),
    ["1080x1920", "1080x1080", "1080x1350", "1170x2532"],
  );
  assert.equal(getSize("nope").id, "story");
});

test("parseOptions keeps known values and drops the rest", () => {
  assert.deepEqual(parseOptions(null, ["plain"]), DEFAULT_OPTIONS);
  assert.deepEqual(
    parseOptions(JSON.stringify({ size: "square", style: "gold", roman: true, meaning: "yes" }), ["plain"]),
    { size: "square", style: "plain", roman: true, meaning: false },
  );
});
