# wordy

A browser extension for finding **weaker and stronger** versions of nouns, verbs,
adjectives and adverbs.

Select a word on the page (or type one) and open the popup: the word sits in the middle of a slider. Weaker
words (*mind*, *dislike*) are on the left and stronger ones (*despise*, *detest*, *loathe*,
*abhor*) are on the right. Drag the slider, or press <kbd>↑</kbd>/<kbd>↓</kbd>, then click
the word or press <kbd>Enter</kbd> to copy it.

- Works offline from a hand-curated set of intensity scales (`src/scales.js`).
- Opens with the word you've selected on the page, including selections inside text
  fields and embedded frames.
- Keeps the form you used: *hated* gives *detested*, *broken* gives *shattered*,
  *problems* gives *crises*, *happier* gives *more thrilled*, and *Hated* gives *Detested*.
- Words with several meanings show a tab per meaning (e.g. *fear* as a verb and as a noun,
  or *scared* as an adjective and as the past tense of *scare*).
- For words that aren't in any scale, it shows similar words from the free
  [Datamuse API](https://www.datamuse.com/api/). These are not ranked by strength. The ones
  marked with a dot have their own scale.

## Install (unpacked)

**Chrome / Edge / Brave:** open `chrome://extensions`, enable *Developer mode*, click
*Load unpacked* and pick this folder.

**Firefox:** open `about:debugging#/runtime/this-firefox`, click *Load Temporary Add-on…*
and pick `manifest.json`.

Pin the extension to the toolbar, then click it (or give it a shortcut from the browser's
extension-shortcuts page) to open the popup.

## Permissions

- `activeTab` + `scripting`: when you open the popup, wordy reads the selected text in the
  current tab. It can't see any page you haven't opened it on, and it reads nothing else.
- Datamuse is only contacted for words that aren't in the scales.

## Adding words

Each entry in `src/scales.js` is `[partOfSpeech, sense, "weakest, …, strongest"]`, where the
part of speech is `noun`, `verb`, `adjective` or `adverb`:

```js
["verb", "feel aversion", "mind, dislike, hate, despise, detest, loathe, abhor"],
["adjective", "big", "sizable, large, big, huge, enormous, gigantic, colossal"],
["adverb", "quickly", "briskly, quickly, swiftly, rapidly, hastily, furiously"],
```

Keep a scale to one meaning. A word can appear in several scales if it has several senses.
Run `npm test` afterwards. It checks that every scale is well formed, and that every word
can be inflected and then recognized again.

New irregular verbs (like *swim → swam, swum*) go in `IRREGULAR_VERBS` in `src/forms.js`.
Nouns that sound wrong in the plural (like *unease*) go in `UNCOUNTABLE`. Adjectives
and adverbs with irregular comparatives (like *bad → worse, worst* or *badly → worse, worst*)
go in `IRREGULAR_COMPARATIVES`, and short ones that only take *more*/*most* (like *wrong*)
go in `ONLY_MORE`.

## Roadmap

- **Grow the curated scales as far as they'll go.** Most nouns, verbs, adjectives and adverbs
  that have a strength scale should get a hand-ranked one. Curated scales work offline,
  cost nothing and can be reviewed. Any word that falls through to the Datamuse fallback
  is a candidate for a new scale.
- **AI-ranked scales, only for what's left.** Once the curated list stops growing, unknown
  words could get an LLM-ordered weakest→strongest scale on the same slider instead of
  unranked synonyms. Still to decide: whether users bring their own API key or go through a
  small proxy, caching results so each word costs one call, and how to show that an AI
  scale is less reliable than a curated one.

## Development

No build step or dependencies. The popup is plain HTML, CSS and ES modules.

```sh
npm test          # node --test (Node 18+)
npm run icons     # re-render icons/*.png from icons/icon.svg (needs rsvg-convert)
```

Reload the extension from the extensions page after editing.
