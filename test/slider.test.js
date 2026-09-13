import { test } from "node:test";
import assert from "node:assert/strict";
import { stopPercents, nearestStop } from "../src/slider.js";

test("the looked-up word sits in the middle", () => {
  for (let count = 1; count <= 8; count++) {
    for (let origin = 0; origin < count; origin++) {
      assert.equal(stopPercents(count, origin)[origin], 50);
    }
  }
});

test("stops increase left to right and stay on the track", () => {
  const percents = stopPercents(7, 2);
  for (let i = 1; i < percents.length; i++) assert.ok(percents[i] > percents[i - 1]);
  assert.ok(percents[0] > 0 && percents.at(-1) < 100);
  assert.equal(percents[0], 100 - percents.at(-1)); // both ends reach the same edge
});

test("snaps to the nearest stop", () => {
  const percents = stopPercents(5, 2); // [7, 28.5, 50, 71.5, 93]
  assert.equal(nearestStop(percents, 0), 0);
  assert.equal(nearestStop(percents, 45), 2);
  assert.equal(nearestStop(percents, 80), 3);
  assert.equal(nearestStop(percents, 100), 4);
});
