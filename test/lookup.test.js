import { test } from "node:test";
import assert from "node:assert/strict";
import { SCALES } from "../src/scales.js";
import { lookup, scales, normalize } from "../src/lookup.js";

const wordsAround = (input, pos) => {
  const match = lookup(input).matches.find((m) => !pos || m.pos === pos);
  return {
    weaker: match.words.slice(0, match.position),
    stronger: match.words.slice(match.position + 1),
  };
};

test("every scale is well-formed", () => {
  for (const [pos, sense, words] of SCALES) {
    assert.ok(["noun", "verb"].includes(pos), `bad part of speech: ${pos}`);
    assert.ok(sense, "missing sense");
    assert.equal(words, words.toLowerCase(), `not lowercase: ${sense}`);
  }
  for (const scale of scales) {
    assert.ok(scale.words.length >= 3, `too short: ${scale.sense}`);
    assert.equal(new Set(scale.words).size, scale.words.length, `duplicate in: ${scale.sense}`);
    assert.ok(scale.words.every(Boolean), `empty word in: ${scale.sense}`);
  }
});

test("senses are unique within a part of speech", () => {
  const keys = scales.map((s) => `${s.pos}:${s.sense}`);
  assert.equal(new Set(keys).size, keys.length);
});

test("finds weaker and stronger words", () => {
  const { weaker, stronger } = wordsAround("hate");
  assert.ok(weaker.includes("dislike"));
  assert.ok(stronger.includes("detest"));
});

test("is case- and whitespace-insensitive", () => {
  assert.equal(normalize("  Hate  "), "hate");
  assert.equal(lookup("  HATE ").matches[0].base, "hate");
  assert.equal(lookup("pore   over").matches[0].base, "pore over");
});

test("returns every sense of a word", () => {
  const pos = lookup("worry").matches.map((m) => m.pos).sort();
  assert.deepEqual(pos, ["noun", "verb", "verb", "verb"]);
});

test("reduces inflected forms to a base form", () => {
  const cases = {
    hated: "hate", hates: "hate", hating: "hate", running: "run", ran: "run",
    worried: "worry", worries: "worry", pushed: "push", grabbing: "grab",
    crises: "crisis", problems: "problem", lying: "lie", shouted: "shout",
    stared: "stare", "poring over": "pore over", fled: "flee", hidden: "hide",
    torn: "tear", preferred: "prefer", leapt: "leap", "get-togethers": "get-together",
  };
  for (const [input, base] of Object.entries(cases)) {
    assert.equal(lookup(input).matches[0]?.base, base, input);
  }
});

test("verb inflections only match verb scales", () => {
  const pos = new Set(lookup("worried").matches.map((m) => m.pos));
  assert.deepEqual([...pos], ["verb"]);
});

test("shows every word in the typed form", () => {
  const [hated] = lookup("hated").matches;
  assert.equal(hated.form, "past");
  assert.deepEqual(hated.forms, ["minded", "disliked", "hated", "despised", "detested", "loathed", "abhorred"]);

  const broken = lookup("broken").matches.find((m) => m.sense === "break");
  assert.deepEqual(broken.forms, ["chipped", "cracked", "broken", "shattered", "smashed", "pulverized"]);

  const problems = lookup("problems").matches[0];
  assert.deepEqual(problems.forms, ["hiccups", "snags", "issues", "problems", "crises"]);
});

test("finds both a noun and the verb it comes from", () => {
  const found = lookup("loathing").matches.map((m) => `${m.pos}:${m.base}:${m.form}`);
  assert.deepEqual(found, ["noun:loathing:base", "verb:loathe:ing"]);
});

test("unknown words return no matches", () => {
  assert.deepEqual(lookup("xylophone").matches, []);
  assert.equal(lookup("   "), null);
});
