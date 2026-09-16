import { test } from "node:test";
import assert from "node:assert/strict";
import { FORMS, inflect, isForm, baseForms, matchCase } from "../src/forms.js";
import { scales } from "../src/lookup.js";

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

test("compares adjectives", () => {
  const cases = [
    ["big", "bigger", "biggest"],
    ["nice", "nicer", "nicest"],
    ["happy", "happier", "happiest"],
    ["unhappy", "unhappier", "unhappiest"],
    ["unsure", "more unsure", "most unsure"],
    ["dry", "drier", "driest"],
    ["narrow", "narrower", "narrowest"],
    ["good", "better", "best"],
    ["enormous", "more enormous", "most enormous"],
    ["tired", "more tired", "most tired"],
    ["boring", "more boring", "most boring"],
    ["wrong", "more wrong", "most wrong"],
    ["well-known", "more well-known", "most well-known"],
  ];
  for (const [base, er, est] of cases) {
    assert.equal(inflect(base, "adjective", "er"), er);
    assert.equal(inflect(base, "adjective", "est"), est);
  }
  assert.equal(inflect("big", "adjective", "s"), null);
  assert.equal(inflect("fear", "noun", "er"), null);
});

test("compares adverbs", () => {
  const cases = [
    ["slowly", "more slowly", "most slowly"],
    ["quickly", "more quickly", "most quickly"],
    ["calmly", "more calmly", "most slowly" /* wait, most calmly */],
    ["fast", "faster", "fastest"],
    ["early", "earlier", "earliest"],
    ["hard", "harder", "hardest"],
    ["late", "later", "latest"],
    ["soon", "sooner", "soonest"],
    ["well", "better", "best"],
    ["badly", "worse", "worst"],
    ["far", "further", "furthest"],
  ];
  for (const [base, er, est] of [
    ["slowly", "more slowly", "most slowly"],
    ["quickly", "more quickly", "most quickly"],
    ["calmly", "more calmly", "most calmly"],
    ["fast", "faster", "fastest"],
    ["early", "earlier", "earliest"],
    ["hard", "harder", "hardest"],
    ["late", "later", "latest"],
    ["soon", "sooner", "soonest"],
    ["well", "better", "best"],
    ["badly", "worse", "worst"],
    ["far", "further", "furthest"],
  ]) {
    assert.equal(inflect(base, "adverb", "er"), er);
    assert.equal(inflect(base, "adverb", "est"), est);
  }
  assert.equal(inflect("slowly", "adverb", "s"), null);
  assert.equal(inflect("slowly", "adverb", "past"), null);
});

test("accepts more/most for any adjective", () => {
  assert.ok(isForm("quieter", "quiet", "adjective", "er"));
  assert.ok(isForm("more quiet", "quiet", "adjective", "er"));
  assert.ok(isForm("most quiet", "quiet", "adjective", "est"));
  assert.equal(isForm("more quiet", "quiet", "adjective", "est"), false);
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
