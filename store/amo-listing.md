# Firefox Add-ons (AMO) submission

Everything https://addons.mozilla.org/developers/ asks for, in the order the
**Submit a New Add-on** flow asks for it. The images and the privacy policy are the same
ones used for the Chrome Web Store (see `listing.md`).

- Package: `npm run package` → `dist/wordy-<version>.zip`
- Check it first: `npx web-ext lint --source-dir <unzipped package>`

## 1. Distribution

**On this site** (a public listing on addons.mozilla.org).

## 2. Upload version

Upload `dist/wordy-0.1.0.zip`.

**Compatible platforms:** Firefox only. Leave Firefox for Android unticked until the popup
has been tried on Android.

## 3. Source code

**Do you need to submit source code?** No. Nothing is minified, bundled or generated:
the package holds the same files as the repository.

## 4. Describe add-on

**Name:** wordy (taken from the manifest)

**Add-on URL:** `wordy`. If that slug is taken, use `wordy-word-intensity`.

**Summary** (250 characters max)

```
Find weaker and stronger versions of a word. Select a word, click wordy and slide between gentler and stronger alternatives for nouns, verbs, adjectives and adverbs. Works offline for nearly 500 hand-ranked scales.
```

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

wordy is open source: https://github.com/SiamRahman29/wordy
```

The Chrome description's keyboard-shortcut tip is left out on purpose: the manifest
declares no `commands`, so wordy doesn't appear in Firefox's **Manage Extension Shortcuts**.

**Experimental:** No.

**Requires payment, non-free services or software, or additional hardware:** No.
(Datamuse is a free API with no key.)

**Categories:** Language Support. Add Other as the second category if it asks for two.

**Support email:** optional. Leave it blank to send people to the issues page instead.

**Support website:** https://github.com/SiamRahman29/wordy/issues

**License:** MIT License (matches `LICENSE`).

**This add-on has a privacy policy:** tick it and paste the text of `PRIVACY.md`. AMO wants
the text itself, not a link.

**Notes to reviewer**

```
No build step: the package contains the source exactly as it is in https://github.com/SiamRahman29/wordy.

To test: select a word such as "hate" or "big" on any web page, then click the wordy toolbar icon. The popup opens with that word on a slider of weaker and stronger alternatives. A word that isn't in the built-in scales (for example "serendipity") is looked up on the Datamuse API.

Permissions: activeTab and scripting are used together, only when the popup opens, to run one function in the current tab that returns the selected text. Nothing else on the page is read or changed.

Data collection: the looked-up word (which can come from the page selection) is sent to api.datamuse.com when it isn't in the built-in scales, hence "websiteContent" in data_collection_permissions. Nothing else leaves the device and nothing is stored.
```

## 5. After submitting: edit the listing

Open the add-on under **Manage My Submissions** → **Edit Product Page**.

**Icon:** AMO uses the manifest icons, so leave it as is, or upload
`store/images/out/store-icon.png`.

**Screenshots** (1280×800, in this order, with captions):

1. `store/images/out/1-slider.png`: Slide from weaker to stronger words
2. `store/images/out/2-meanings.png`: A tab for each meaning
3. `store/images/out/3-forms.png`: Keeps the form you used
4. `store/images/out/4-dark.png`: Follows your dark theme

**Homepage:** https://github.com/SiamRahman29/wordy

**Tags:** writing, words, synonyms, thesaurus

The promo tile from the Chrome listing isn't used on AMO.

## Releasing an update

1. Bump `"version"` in `manifest.json` (and `package.json` to match).
2. Run `npm run package`.
3. On AMO: **Manage My Submissions** → wordy → **Upload New Version**.
