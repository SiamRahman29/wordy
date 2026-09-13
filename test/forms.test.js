import { test } from "node:test";
import assert from "node:assert/strict";
import { inflect, isForm, baseForms, matchCase } from "../src/forms.js";
import { scales } from "../src/lookup.js";

const FORMS = { verb: ["s", "past", "participle", "ing"], noun: ["s"] };

test("inflects regular verbs", () => {
  const cases = [
    ["hate", "hated", "hating", "hates"],
    ["push", "pushed", "pushing", "pushes"],
    ["worry", "worried", "worrying", "worries"],
    ["annoy", "annoyed", "annoying", "annoys"],
    ["stun", "stunned", "stunning", "stuns"],
    ["char", "charred", "charring", "chars"],
    ["abhor", "abhorred", "abhorring", "abhors"],
    ["wonder", "wondered", "wondering", "wonders"],
    ["lie", "lied", "lying", "lies"],
    ["decree", "decreed", "decreeing", "decrees"],
    ["singe", "singed", "singeing", "singes"],
    ["critique", "critiqued", "critiquing", "critiques"],
    ["pore over", "pored over", "poring over", "pores over"],
  ];
  for (const [base, past, ing, s] of cases) {
    assert.equal(inflect(base, "verb", "past"), past);
    assert.equal(inflect(base, "verb", "participle"), past);
    assert.equal(inflect(base, "verb", "ing"), ing);
    assert.equal(inflect(base, "verb", "s"), s);
  }
});

test("inflects irregular verbs", () => {
  assert.equal(inflect("break", "verb", "past"), "broke");
  assert.equal(inflect("break", "verb", "participle"), "broken");
  assert.equal(inflect("run", "verb", "ing"), "running");
  assert.equal(inflect("forbid", "verb", "ing"), "forbidding");
});

test("pluralizes nouns", () => {
  assert.equal(inflect("problem", "noun", "s"), "problems");
  assert.equal(inflect("crisis", "noun", "s"), "crises");
  assert.equal(inflect("city", "noun", "s"), "cities");
  assert.equal(inflect("stench", "noun", "s"), "stenches");
  assert.equal(inflect("unease", "noun", "s"), "unease"); // uncountable
  assert.equal(inflect("happiness", "noun", "s"), "happiness");
  assert.equal(inflect("fear", "noun", "past"), null);
});

test("every form of every scale word is recognized again", () => {
  for (const scale of scales) {
    for (const word of scale.words) {
      for (const form of FORMS[scale.pos]) {
        const inflected = inflect(word, scale.pos, form);
        const readings = baseForms(inflected);
        assert.ok(
          readings.some(([base, f]) => base === word && isForm(inflected, base, scale.pos, f)),
          `${inflected} (${form} of ${scale.pos} "${word}") isn't recognized`,
        );
      }
    }
  }
});

test("rejects readings that don't reproduce the input", () => {
  assert.equal(isForm("taped", "tap", "verb", "past"), false);
  assert.equal(isForm("hated", "hat", "verb", "past"), false);
  assert.equal(isForm("breaked", "break", "verb", "past"), false);
});

test("accepts alternate spellings", () => {
  assert.ok(isForm("worshiped", "worship", "verb", "past"));
  assert.ok(isForm("worshipped", "worship", "verb", "past"));
  assert.ok(isForm("quarrelled", "quarrel", "verb", "past"));
  assert.ok(isForm("burnt", "burn", "verb", "past"));
});

test("matches capitalization", () => {
  assert.equal(matchCase("detested", "Hated"), "Detested");
  assert.equal(matchCase("detested", "HATED"), "DETESTED");
  assert.equal(matchCase("detested", "hated"), "detested");
});
