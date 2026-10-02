import { test } from "node:test";
import assert from "node:assert/strict";
import { balance, SAFETY } from "./balance.ts";

test("fits: keeps the base size and shares the wider line's width", () => {
  assert.deepEqual(balance([300, 280], 1000), { scale: 1, width: 300, stretch: true });
  assert.deepEqual(balance([280, 300], 1000), { scale: 1, width: 300, stretch: true });
});

test("too wide: shrinks both lines together until the wider fits", () => {
  const b = balance([800, 700], 400);
  const room = 400 * (1 - SAFETY);
  assert.equal(b.scale, room / 800);
  assert.equal(b.width, room);
  assert.equal(b.stretch, true);
});

test("never enlarges beyond the base size", () => {
  assert.equal(balance([10, 10], 1000).scale, 1);
});

test("more than 40% extra space: keep the shorter line natural", () => {
  assert.equal(balance([140, 100], 1000).stretch, true); // exactly 40%
  assert.equal(balance([141, 100], 1000).stretch, false);
  assert.equal(balance([141, 100], 50).stretch, false); // independent of scale
});

test("degenerate input is harmless", () => {
  assert.deepEqual(balance([0, 0], 300), { scale: 1, width: 0, stretch: false });
  assert.equal(balance([300, 200], 0).scale, 1);
});
