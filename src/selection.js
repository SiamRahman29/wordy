// Prefill the popup with the word selected on the current page.

const MAX_WORDS = 3; // enough for "pore over", short enough to skip sentences
const MAX_LENGTH = 40;

/** The word or short phrase in a selection, without surrounding punctuation. */
export function wordFromSelection(text) {
  const cleaned = text
    .replace(/\s+/g, " ")
    .replace(/^[^\p{L}]+|[^\p{L}]+$/gu, "");
  if (!cleaned || cleaned.length > MAX_LENGTH) return "";
  if (cleaned.split(" ").length > MAX_WORDS) return "";
  return cleaned;
}

// Runs inside the page, so it must not reference anything outside itself.
function selectedText() {
  const field = document.activeElement;
  if (field && typeof field.selectionStart === "number" && typeof field.value === "string") {
    const text = field.value.slice(field.selectionStart, field.selectionEnd);
    if (text) return text;
  }
  return String(window.getSelection() ?? "");
}

async function selectionsIn(tabId, allFrames) {
  const results = await chrome.scripting.executeScript({
    target: { tabId, allFrames },
    func: selectedText,
  });
  return results.sort((a, b) => a.frameId - b.frameId).map(({ result }) => result ?? "");
}

/**
 * The word selected in the tab, or "" if there is none. Throws on pages
 * extensions can't script (browser settings pages, extension stores, …).
 */
export async function readSelectedWord(tabId) {
  let texts;
  try {
    texts = await selectionsIn(tabId, true);
  } catch {
    // Some frames may be off limits; the top frame alone may still work.
    texts = await selectionsIn(tabId, false);
  }
  for (const text of texts) {
    const word = wordFromSelection(text);
    if (word) return word;
  }
  return "";
}
