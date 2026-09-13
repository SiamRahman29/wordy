import { lookup, hasScale } from "../src/lookup.js";
import { stopPercents, nearestStop } from "../src/slider.js";
import { fetchSynonyms } from "../src/datamuse.js";
import { describeForm, matchCase } from "../src/forms.js";
import { readSelectedWord } from "../src/selection.js";

const EXAMPLES = ["hate", "walk", "anger", "problem", "good", "big"];
const SYNONYM_DELAY_MS = 350;

const $ = (id) => document.getElementById(id);
const els = {
  query: $("query"),
  empty: $("empty"),
  examples: $("examples"),
  result: $("result"),
  senses: $("senses"),
  pick: $("pick"),
  pickWord: $("pick-word"),
  pickMeta: $("pick-meta"),
  slider: $("slider"),
  stops: $("stops"),
  thumb: $("thumb"),
  ladder: $("ladder"),
  note: $("note"),
  fallback: $("fallback"),
  fallbackTitle: $("fallback-title"),
  fallbackStatus: $("fallback-status"),
  synonyms: $("synonyms"),
};

// `typed` is the raw input, used to match its capitalization.
let state = { result: null, typed: "", sense: 0, position: 0 };
let percents = [];
let synonymTimer = null;
let synonymRequest = null;
let copiedTimer = null;

const currentScale = () => state.result?.matches[state.sense];
const display = (word) => matchCase(word, state.typed);

// ── Actions ────────────────────────────────────────────────────────────────

function search(text) {
  const result = lookup(text);
  state = { result, typed: text.trim(), sense: 0, position: result?.matches[0]?.position ?? 0 };
  cancelSynonyms();

  els.empty.hidden = Boolean(result);
  els.result.hidden = !result?.matches.length;
  els.fallback.hidden = true;

  if (result?.matches.length) renderScale();
  else if (result) synonymTimer = setTimeout(() => showSynonyms(result.query), SYNONYM_DELAY_MS);
}

function lookUp(word) {
  els.query.value = word;
  els.query.focus();
  search(word);
}

function setSense(index) {
  state.sense = index;
  state.position = currentScale().position;
  renderScale();
}

function setPosition(index) {
  const scale = currentScale();
  if (!scale) return;
  const position = Math.max(0, Math.min(scale.words.length - 1, index));
  if (position === state.position) return;
  state.position = position;
  renderScale();
}

async function copyCurrent() {
  const scale = currentScale();
  if (!scale) return;
  const word = display(scale.forms[state.position]);
  let message = `Copied “${word}”`;
  try {
    await navigator.clipboard.writeText(word);
  } catch {
    message = "Couldn't copy — select the word instead";
  }
  els.pickMeta.textContent = message;
  els.pick.classList.add("copied");
  clearTimeout(copiedTimer);
  copiedTimer = setTimeout(renderScale, 1400);
}

// ── Rendering ──────────────────────────────────────────────────────────────

function renderExamples() {
  els.examples.replaceChildren(
    ...EXAMPLES.map((word) => chip(word, () => lookUp(word))),
  );
}

function renderScale() {
  clearTimeout(copiedTimer);
  els.pick.classList.remove("copied");

  const { result, sense, position } = state;
  const scale = currentScale();
  const offset = position - scale.position;
  const word = display(scale.forms[position]);

  // Meanings: tabs when the word belongs to several scales, a label otherwise.
  els.senses.hidden = false;
  els.senses.classList.toggle("single", result.matches.length === 1);
  els.senses.replaceChildren(
    ...result.matches.map((match, i) => {
      const tab = document.createElement("button");
      tab.type = "button";
      tab.setAttribute("role", "tab");
      tab.className = "sense";
      tab.setAttribute("aria-selected", String(i === sense));
      tab.innerHTML = `<b></b> <span></span>`;
      tab.querySelector("b").textContent = match.pos;
      tab.querySelector("span").textContent = match.sense;
      tab.addEventListener("click", () => setSense(i));
      return tab;
    }),
  );

  // The chosen word.
  els.pickWord.textContent = word;
  els.pickMeta.textContent = describeOffset(offset);
  els.pick.dataset.side = side(offset);
  els.pick.title = `Copy “${word}”`;

  // Slider.
  percents = stopPercents(scale.words.length, scale.position);
  els.slider.classList.toggle("no-weaker", scale.position === 0);
  els.slider.classList.toggle("no-stronger", scale.position === scale.words.length - 1);
  els.stops.replaceChildren(
    ...percents.map((percent, i) => {
      const stop = document.createElement("span");
      stop.className = "stop";
      if (i === scale.position) stop.classList.add("origin");
      stop.style.left = `${percent}%`;
      return stop;
    }),
  );
  els.thumb.style.left = `${percents[position]}%`;
  els.thumb.dataset.side = side(offset);
  els.slider.setAttribute("aria-valuemin", "0");
  els.slider.setAttribute("aria-valuemax", String(scale.words.length - 1));
  els.slider.setAttribute("aria-valuenow", String(position));
  els.slider.setAttribute("aria-valuetext", `${word}, ${describeOffset(offset)}`);

  // Every word in the scale, weakest first.
  els.ladder.replaceChildren(
    ...scale.forms.map((w, i) => {
      const item = document.createElement("li");
      const button = chip(display(w), () => setPosition(i));
      if (i === scale.position) button.classList.add("origin");
      if (i === position) {
        button.classList.add("selected");
        button.setAttribute("aria-current", "true");
      }
      item.append(button);
      return item;
    }),
  );

  els.note.hidden = scale.form === "base";
  els.note.textContent = `“${result.query}” is the ${describeForm(scale.form, scale.pos)} of “${scale.base}”, so every word is shown that way.`;
}

async function showSynonyms(word) {
  els.fallback.hidden = false;
  els.fallbackTitle.textContent = `“${word}” isn't in wordy's scales yet.`;
  els.fallbackStatus.textContent = "Looking for similar words…";
  els.synonyms.replaceChildren();

  const request = new AbortController();
  synonymRequest = request;
  let words;
  try {
    words = await fetchSynonyms(word, { signal: request.signal });
  } catch (error) {
    if (request.signal.aborted) return;
    console.error("wordy: synonym lookup failed", error);
    els.fallbackStatus.textContent = "Couldn't reach the synonym service. Check your connection.";
    return;
  }
  if (request.signal.aborted) return;

  if (!words.length) {
    els.fallbackStatus.textContent = "No similar nouns, verbs or adjectives found. Check the spelling?";
    return;
  }
  const ranked = words.map((w) => ({ word: w, scaled: hasScale(w) }));
  ranked.sort((a, b) => b.scaled - a.scaled);
  els.fallbackStatus.textContent = ranked[0].scaled
    ? "Similar words, not ranked by strength. The ones with a dot have a scale:"
    : "Similar words, not ranked by strength:";
  els.synonyms.replaceChildren(
    ...ranked.map(({ word: w, scaled }) => {
      const button = chip(w, () => lookUp(w));
      if (scaled) {
        button.classList.add("has-scale");
        button.title = `See weaker and stronger words for “${w}”`;
      }
      return button;
    }),
  );
}

function cancelSynonyms() {
  clearTimeout(synonymTimer);
  synonymRequest?.abort();
  synonymRequest = null;
}

function chip(text, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "chip";
  button.textContent = text;
  button.addEventListener("click", onClick);
  return button;
}

function describeOffset(offset) {
  if (offset === 0) return "your word";
  const steps = Math.abs(offset);
  return `${steps} step${steps === 1 ? "" : "s"} ${offset < 0 ? "weaker" : "stronger"}`;
}

function side(offset) {
  return offset < 0 ? "weaker" : offset > 0 ? "stronger" : "origin";
}

// ── Events ─────────────────────────────────────────────────────────────────

els.query.addEventListener("input", () => search(els.query.value));

els.query.addEventListener("keydown", (event) => {
  if (!currentScale()) return;
  if (event.key === "ArrowUp") setPosition(state.position + 1);
  else if (event.key === "ArrowDown") setPosition(state.position - 1);
  else if (event.key === "Enter") copyCurrent();
  else return;
  event.preventDefault();
});

els.slider.addEventListener("keydown", (event) => {
  const last = currentScale().words.length - 1;
  const moves = {
    ArrowRight: state.position + 1,
    ArrowUp: state.position + 1,
    ArrowLeft: state.position - 1,
    ArrowDown: state.position - 1,
    Home: 0,
    End: last,
  };
  if (event.key in moves) setPosition(moves[event.key]);
  else if (event.key === "Enter" || event.key === " ") copyCurrent();
  else return;
  event.preventDefault();
});

function slideTo(event) {
  const rect = els.slider.getBoundingClientRect();
  const percent = ((event.clientX - rect.left) / rect.width) * 100;
  setPosition(nearestStop(percents, percent));
}

els.slider.addEventListener("pointerdown", (event) => {
  els.slider.setPointerCapture(event.pointerId);
  els.slider.classList.add("dragging");
  slideTo(event);
});
els.slider.addEventListener("pointermove", (event) => {
  if (els.slider.hasPointerCapture(event.pointerId)) slideTo(event);
});
els.slider.addEventListener("pointerup", () => els.slider.classList.remove("dragging"));
els.slider.addEventListener("pointercancel", () => els.slider.classList.remove("dragging"));

els.pick.addEventListener("click", copyCurrent);

async function prefillFromSelection() {
  let word = "";
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id !== undefined) word = await readSelectedWord(tab.id);
  } catch (error) {
    // Expected on pages extensions can't read, like the browser's own pages.
    console.debug("wordy: couldn't read the page selection:", error.message);
  }
  if (!word || els.query.value) return; // don't clobber what the user typed
  els.query.value = word;
  els.query.select();
  search(word);
}

renderExamples();
if (globalThis.chrome?.scripting) prefillFromSelection();
