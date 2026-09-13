// Word forms: recognizing an inflected word ("hated" is the past tense of
// "hate") and producing the same form of another word ("detest" -> "detested").
//
// Forms: "base", "s" (third-person verb or plural noun), "past", "participle"
// (past participle, only distinct from "past" for irregular verbs) and "ing".

// Irregular verbs that appear in the scales: base -> [past, past participle].
const IRREGULAR_VERBS = {
  bear: ["bore", "borne"], beat: ["beat", "beaten"], bite: ["bit", "bitten"],
  break: ["broke", "broken"], cut: ["cut", "cut"], drink: ["drank", "drunk"],
  eat: ["ate", "eaten"], fall: ["fell", "fallen"], fight: ["fought", "fought"],
  flee: ["fled", "fled"], fling: ["flung", "flung"], forbid: ["forbade", "forbidden"],
  forgive: ["forgave", "forgiven"], freeze: ["froze", "frozen"], grow: ["grew", "grown"],
  hide: ["hid", "hidden"], hit: ["hit", "hit"], hold: ["held", "held"],
  hurt: ["hurt", "hurt"], know: ["knew", "known"], leave: ["left", "left"],
  mislead: ["misled", "misled"], misspend: ["misspent", "misspent"],
  read: ["read", "read"], rebuild: ["rebuilt", "rebuilt"], rise: ["rose", "risen"],
  run: ["ran", "run"], say: ["said", "said"], shake: ["shook", "shaken"],
  shine: ["shone", "shone"], show: ["showed", "shown"], shrink: ["shrank", "shrunk"],
  slay: ["slew", "slain"], sleep: ["slept", "slept"], spend: ["spent", "spent"],
  spin: ["spun", "spun"], spit: ["spat", "spat"], steal: ["stole", "stolen"],
  sting: ["stung", "stung"], stink: ["stank", "stunk"], stride: ["strode", "stridden"],
  strike: ["struck", "struck"], strive: ["strove", "striven"], swear: ["swore", "sworn"],
  swell: ["swelled", "swollen"], take: ["took", "taken"], tear: ["tore", "torn"],
  think: ["thought", "thought"], throw: ["threw", "thrown"], thrust: ["thrust", "thrust"],
  understand: ["understood", "understood"], upset: ["upset", "upset"],
  weep: ["wept", "wept"], wet: ["wet", "wet"], withdraw: ["withdrew", "withdrawn"],
};

// Accepted when reading input, but never produced.
const ALTERNATE_PAST = {
  burnt: "burn", leapt: "leap", smelt: "smell", strived: "strive", shined: "shine",
  slayed: "slay", wetted: "wet",
};

// Multi-syllable verbs whose final consonant doubles ("abhorred").
const DOUBLE_FINAL = new Set([
  "abhor", "admit", "control", "excel", "extol", "forbid", "prefer", "regret", "repel",
  "upset", "worship",
]);

// Irregular noun plurals.
const IRREGULAR_PLURALS = { crisis: "crises", nemesis: "nemeses" };

// Nouns that read badly in the plural ("uneases"); they stay singular.
const UNCOUNTABLE = new Set([
  "abundance", "acclaim", "admiration", "adoration", "adulation", "affluence",
  "amazement", "anger", "anguish", "arrogance", "astonishment", "attention",
  "awareness", "awe", "bewilderment", "bliss", "bloodshed", "boredom",
  "bravery", "brilliance", "brutality", "burnout", "calm", "carnage", "chaos",
  "clout", "clutter", "cold", "competence", "confusion", "contempt",
  "contentment", "courage", "cruelty", "curiosity", "damage", "dearth",
  "dehydration", "desolation", "despair", "destitution", "destruction",
  "devastation", "devotion", "dirt", "disarray", "disbelief", "disdain",
  "disgrace", "disgust", "disregard", "distaste", "distress", "distrust",
  "dominance", "dread", "drizzle", "drudgery", "elation", "enjoyment",
  "euphoria", "evidence", "exasperation", "excitement", "exhaustion",
  "exhilaration", "expertise", "faith", "fame", "familiarity", "fascination",
  "fatigue", "feedback", "filth", "fury", "grief", "grime", "growth", "guilt",
  "hatred", "heroism", "hubris", "hunger", "hush", "hysteria", "hysterics",
  "immortality", "influence", "isolation", "knowledge", "labor", "likelihood",
  "liking", "loathing", "magnificence", "mastery", "misery", "notice",
  "opulence", "pandemonium", "panic", "peace", "perplexity", "pilfering",
  "pique", "plenty", "poverty", "power", "praise", "pride", "progress", "proof",
  "prosperity", "puzzlement", "quiet", "radiance", "rancor", "recognition",
  "regard", "reliance", "remorse", "renown", "repugnance", "respect",
  "retribution", "reverence", "revulsion", "satisfaction", "savagery",
  "scarcity", "scorn", "serenity", "shame", "skepticism", "snow", "solitude",
  "spite", "splendor", "stardom", "starvation", "stress", "suffering",
  "supremacy", "sway", "tedium", "thirst", "thrift", "toil", "tranquility",
  "trust", "unease", "unrest", "valor", "veneration", "violence", "wealth",
  "work",
]);

const VOWELS = /[aeiou]+/g;
const syllables = (word) => (word.match(VOWELS) || []).length;

function doublesFinal(word) {
  if (DOUBLE_FINAL.has(word)) return true;
  // One syllable ending consonant-vowel-consonant: "stun", "grab", "char".
  return syllables(word) === 1 && /(^|[^aeiou])[aeiou][b-df-hj-np-tvz]$/.test(word);
}

function addEd(word) {
  if (word.endsWith("e")) return word + "d";
  if (/[^aeiou]y$/.test(word)) return word.slice(0, -1) + "ied";
  if (doublesFinal(word)) return word + word.at(-1) + "ed";
  return word + "ed";
}

function addIng(word) {
  if (word === "singe") return "singeing";
  if (word.endsWith("ie")) return word.slice(0, -2) + "ying";
  if (/[eoy]e$/.test(word)) return word + "ing";
  if (word.endsWith("e")) return word.slice(0, -1) + "ing";
  if (doublesFinal(word)) return word + word.at(-1) + "ing";
  return word + "ing";
}

function addS(word, pos) {
  if (pos === "noun") {
    if (UNCOUNTABLE.has(word) || word.endsWith("ness")) return word;
    if (IRREGULAR_PLURALS[word]) return IRREGULAR_PLURALS[word];
  }
  if (/(s|x|z|ch|sh)$/.test(word)) return word + "es";
  if (/[^aeiou]y$/.test(word)) return word.slice(0, -1) + "ies";
  if (pos === "verb" && /[^aeiou]o$/.test(word)) return word + "es";
  return word + "s";
}

function inflectWord(word, pos, form) {
  if (form === "base") return word;
  if (form === "s") return addS(word, pos);
  if (pos !== "verb") return null;
  if (form === "ing") return addIng(word);
  const irregular = IRREGULAR_VERBS[word];
  if (irregular) return form === "past" ? irregular[0] : irregular[1];
  return addEd(word);
}

/**
 * The given form of a base word, or null if the part of speech doesn't have
 * that form. Verbs inflect their first word ("pore over" -> "pored over"),
 * nouns their last.
 */
export function inflect(word, pos, form) {
  const words = word.split(" ");
  const i = pos === "verb" ? 0 : words.length - 1;
  const inflected = inflectWord(words[i], pos, form);
  if (inflected === null) return null;
  words[i] = inflected;
  return words.join(" ");
}

/** Whether `input` is the `form` of `base` (allowing a few alternate spellings). */
export function isForm(input, base, pos, form) {
  if (inflect(base, pos, form) === input) return true;
  if (pos !== "verb" || (form !== "past" && form !== "ing")) return false;

  const words = input.split(" ");
  const baseWords = base.split(" ");
  if (words.slice(1).join(" ") !== baseWords.slice(1).join(" ")) return false;
  const [word] = words;
  const [head] = baseWords;
  if (form === "past" && ALTERNATE_PAST[word] === head) return true;

  // Both "worshiped" and "worshipped", "quarreled" and "quarrelled".
  if (syllables(head) > 1 && /[aeiou][b-df-hj-np-tvz]$/.test(head)) {
    const suffix = form === "past" ? "ed" : "ing";
    return word === head + suffix || word === head + head.at(-1) + suffix;
  }
  return false;
}

const REVERSE_IRREGULAR = {};
for (const [base, [past, participle]] of Object.entries(IRREGULAR_VERBS)) {
  REVERSE_IRREGULAR[participle] = [base, "participle"];
  REVERSE_IRREGULAR[past] = [base, "past"];
}
for (const [past, base] of Object.entries(ALTERNATE_PAST)) REVERSE_IRREGULAR[past] = [base, "past"];
const REVERSE_PLURALS = Object.fromEntries(
  Object.entries(IRREGULAR_PLURALS).map(([singular, plural]) => [plural, singular]),
);

function wordCandidates(word) {
  const found = [[word, "base"]];
  const strip = (n, add = "") => word.slice(0, word.length - n) + add;
  if (REVERSE_IRREGULAR[word]) found.push(REVERSE_IRREGULAR[word]);
  if (REVERSE_PLURALS[word]) found.push([REVERSE_PLURALS[word], "s"]);
  if (word.endsWith("s")) found.push([strip(1), "s"], [strip(2), "s"], [strip(3, "y"), "s"]);
  if (word.endsWith("ed")) {
    for (const base of [strip(1), strip(2), strip(3), strip(3, "y")]) found.push([base, "past"]);
  }
  if (word.endsWith("ing")) {
    for (const base of [strip(3), strip(3, "e"), strip(4), strip(4, "ie")]) found.push([base, "ing"]);
  }
  return found;
}

/**
 * Possible [base, form] readings of `input`, most likely first. These are
 * guesses; confirm one with `isForm` once the part of speech is known.
 */
export function baseForms(input) {
  const words = input.split(" ");
  const readings = wordCandidates(words[0]).map(([base, form]) => [
    [base, ...words.slice(1)].join(" "), form,
  ]);
  if (words.length > 1) {
    const last = words.length - 1;
    for (const [base, form] of wordCandidates(words[last]).slice(1)) {
      readings.push([[...words.slice(0, last), base].join(" "), form]);
    }
  }
  return readings.filter(([base]) => base.length > 1);
}

/** Give `word` the capitalization of `sample` ("Hated" -> "Detested"). */
export function matchCase(word, sample) {
  if (sample.length > 1 && sample === sample.toUpperCase() && sample !== sample.toLowerCase()) {
    return word.toUpperCase();
  }
  if (sample[0] && sample[0] !== sample[0].toLowerCase()) {
    return word[0].toUpperCase() + word.slice(1);
  }
  return word;
}

export function describeForm(form, pos) {
  return {
    s: pos === "noun" ? "plural" : "-s form",
    past: "past tense",
    participle: "past participle",
    ing: "-ing form",
  }[form];
}
