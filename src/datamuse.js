// Fallback for words that aren't in any scale: fetch plain synonyms from the
// free Datamuse API (https://www.datamuse.com/api/). These are not ranked by
// intensity.

const API = "https://api.datamuse.com/words";
const WANTED_TAGS = new Set(["n", "v"]);

async function query(params, signal) {
  const url = `${API}?${new URLSearchParams({ ...params, md: "p", max: "40" })}`;
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Datamuse responded with ${response.status}`);
  return response.json();
}

export async function fetchSynonyms(word, { signal } = {}) {
  let results = await query({ rel_syn: word }, signal);
  if (results.length < 5) results = results.concat(await query({ ml: word }, signal));

  const seen = new Set([word]);
  const synonyms = [];
  for (const { word: candidate, tags = [] } of results) {
    if (seen.has(candidate) || !tags.some((tag) => WANTED_TAGS.has(tag))) continue;
    seen.add(candidate);
    synonyms.push(candidate);
  }
  return synonyms.slice(0, 18);
}
