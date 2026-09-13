# wordy

A browser extension for finding **weaker and stronger** versions of nouns and verbs.

Select a word on the page (or type one) and open the popup: the word sits in the middle of a slider. Weaker
words (*mind*, *dislike*) are on the left and stronger ones (*despise*, *detest*, *loathe*,
*abhor*) are on the right. Drag the slider, or press <kbd>↑</kbd>/<kbd>↓</kbd>, then click
the word or press <kbd>Enter</kbd> to copy it.

- Works offline from a hand-curated set of intensity scales (`src/scales.js`).
- Opens with the word you've selected on the page, including selections inside text
  fields and embedded frames.
- Keeps the form you used: *hated* gives *detested*, *broken* gives *shattered*,
  *problems* gives *crises*, and *Hated* gives *Detested*.
- Words with several meanings show a tab per meaning (e.g. *fear* as a verb and as a noun).
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

Each entry in `src/scales.js` is `[partOfSpeech, sense, "weakest, …, strongest"]`:

```js
["verb", "feel aversion", "mind, dislike, hate, despise, detest, loathe, abhor"],
```

Keep a scale to one meaning. A word can appear in several scales if it has several senses.
Run `npm test` afterwards. It checks that every scale is well formed, and that every word
can be inflected and then recognized again.

New irregular verbs (like *swim → swam, swum*) go in `IRREGULAR_VERBS` in `src/forms.js`.
Nouns that sound wrong in the plural (like *unease*) go in `UNCOUNTABLE`.

## Roadmap

- **AI-ranked scales for words that aren't in the list.** Right now unknown words fall back
  to unranked Datamuse synonyms. The plan is to ask an LLM for an ordered weakest→strongest
  scale instead and display it on the same slider. Still to decide: whether users bring their
  own API key or go through a small proxy, caching results so each word costs one call, and
  how to show that an AI scale is less reliable than a curated one.

## Development

No build step or dependencies. The popup is plain HTML, CSS and ES modules.

```sh
npm test          # node --test (Node 18+)
npm run icons     # re-render icons/*.png from icons/icon.svg (needs rsvg-convert)
```

Reload the extension from the extensions page after editing.
