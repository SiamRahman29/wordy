# Chrome Web Store submission

Everything the developer dashboard asks for, in the order its tabs ask for it.

- Package: `npm run package` → `dist/wordy-<version>.zip`
- Images: `npm run store-images` → `store/images/out/`

## Package

Upload `dist/wordy-0.1.0.zip`.

## Store listing

**Description**

```
wordy finds weaker and stronger versions of a word.

Select a word on any page and click the wordy icon. Your word sits in the middle of a slider: gentler words on the left, stronger ones on the right. Drag the slider (or press ↑/↓), then click the word or press Enter to copy it.

  dislike ← hate → despise, detest, loathe, abhor
  large ← big → huge, enormous, gigantic, colossal
  issue ← problem → crisis

• Nearly 500 hand-ranked scales of nouns, verbs, adjectives and adverbs.
• Keeps the form you used: "hated" gives "detested", "problems" gives "crises", "Happier" gives "More thrilled".
• Words with several meanings get a tab for each, like "fear" as a verb and as a noun.
• Works offline for every word in its scales. For other words it shows similar words from the free Datamuse API.
• Reads your selection only when you open it, and only on that tab. No account, no tracking, nothing stored.
• Follows your light or dark theme.

Tip: give wordy a keyboard shortcut from chrome://extensions/shortcuts to open it without the mouse.

wordy is open source: https://github.com/SiamRahman29/wordy
```

**Category:** Tools (the dashboard may list it under Productivity)

**Language:** English

**Store icon** (128×128): `store/images/out/store-icon.png`. This is the toolbar icon shrunk to 96×96 with 16px of transparent padding, as the store guidelines ask. Use this rather than `icons/icon128.png`, which fills the full 128px.

**Screenshots** (1280×800, in this order):

1. `store/images/out/1-slider.png`
2. `store/images/out/2-meanings.png`
3. `store/images/out/3-forms.png`
4. `store/images/out/4-dark.png`

**Small promo tile** (440×280): `store/images/out/promo-small.png`

**Marquee promo tile:** optional, skip.

**Homepage URL:** https://github.com/SiamRahman29/wordy

**Support URL:** https://github.com/SiamRahman29/wordy/issues

## Privacy practices

**Single purpose**

```
wordy shows weaker and stronger alternatives for a word the user selects or types, so they can pick the right intensity and copy it.
```

**activeTab justification**

```
When the user clicks the wordy toolbar icon, activeTab gives temporary access to that tab so wordy can read the word they have selected and prefill the search box. It gives no access to any other tab, or to this tab after the user navigates away.
```

**scripting justification**

```
Used with activeTab to run a small function in the current tab (and its frames) that returns the user's selected text, including selections inside text fields. It runs only when the user opens the popup, reads only the selection, and does not change the page.
```

**Host permissions:** none requested.

**Remote code:** No, I am not using remote code. (All JavaScript ships in the package. The Datamuse API returns JSON data, not code.)

**Data usage.** Tick **Website content**, since the word the user selected can be sent to the Datamuse API when it isn't in the built-in scales. Leave every other category unticked.

Tick all three certifications:

- I do not sell or transfer user data to third parties, outside of the approved use cases
- I do not use or transfer user data for purposes that are unrelated to my item's single purpose
- I do not use or transfer user data to determine creditworthiness or for lending purposes

**Privacy policy URL:** https://github.com/SiamRahman29/wordy/blob/main/PRIVACY.md

## Distribution

- **Payments:** free
- **Visibility:** Public (or Unlisted to test from a link first)
- **Regions:** all regions

## Account (one-time)

- Pay the $5 registration fee if you haven't.
- Verify the contact email under **Account**. You can't publish until it's verified.

## Test instructions (optional tab)

No login or setup needed. Select a word such as "hate" or "big" on any web page, then click the wordy icon.

## Releasing an update

1. Bump `"version"` in `manifest.json` (and `package.json` to match).
2. Run `npm run package`.
3. In the dashboard: **Package → Upload new package**, then **Submit for review**.
