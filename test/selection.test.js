import { test } from "node:test";
import assert from "node:assert/strict";
import { wordFromSelection } from "../src/selection.js";

test("keeps a single selected word", () => {
  assert.equal(wordFromSelection("hate"), "hate");
  assert.equal(wordFromSelection("  Hated\n"), "Hated");
});

test("strips surrounding punctuation and quotes", () => {
  assert.equal(wordFromSelection("“hated,”"), "hated");
  assert.equal(wordFromSelection("(anger)."), "anger");
  assert.equal(wordFromSelection("don't"), "don't");
});

test("keeps short phrases", () => {
  assert.equal(wordFromSelection("pored  over"), "pored over");
});

test("ignores sentences and empty selections", () => {
  assert.equal(wordFromSelection("I really hate it when that happens"), "");
  assert.equal(wordFromSelection(""), "");
  assert.equal(wordFromSelection("  ... "), "");
});
