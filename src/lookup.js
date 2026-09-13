import { SCALES } from "./scales.js";
import { baseForms, inflect, isForm } from "./forms.js";

export const scales = SCALES.map(([pos, sense, words], id) => ({
  id,
  pos,
  sense,
  words: words.split(",").map((word) => word.trim()),
}));

// word -> [{ scale, position }]
const index = new Map();
for (const scale of scales) {
  scale.words.forEach((word, position) => {
    if (!index.has(word)) index.set(word, []);
    index.get(word).push({ scale, position });
  });
}

export function normalize(input) {
  return input.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Find the intensity scales containing `input`, in any of its forms.
 *
 * Returns { query, matches }. Each match is a scale plus:
 *   position - where the word sits in the scale
 *   base     - the word as it appears in the scale ("hate" for "hated")
 *   form     - how `query` is inflected ("past" for "hated")
 *   forms    - every word in the scale, inflected to match ("detested", …)
 */
export function lookup(input) {
  const query = normalize(input);
  if (!query) return null;

  const matches = [];
  const seen = new Set();
  for (const [base, form] of baseForms(query)) {
    for (const { scale, position } of index.get(base) ?? []) {
      if (seen.has(scale.id) || !isForm(query, base, scale.pos, form)) continue;
      seen.add(scale.id);
      const forms = scale.words.map((word) => inflect(word, scale.pos, form));
      forms[position] = query; // keep the writer's own spelling
      matches.push({ ...scale, position, base, form, forms });
    }
  }
  return { query, matches };
}

export function hasScale(word) {
  return Boolean(lookup(word)?.matches.length);
}
