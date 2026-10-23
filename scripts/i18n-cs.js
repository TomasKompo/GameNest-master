#!/usr/bin/env node
/**
 * i18n-cs.js — generates the Czech language packs from the English ones.
 *
 * Everything Czech in the app is generated from its English counterpart, so the
 * two languages can never drift apart:
 *
 *   public/js/lang/en.js          -> public/js/lang/cs.js            (UI strings)
 *   public/js/lang/catalog-en.js  -> public/js/lang/catalog-cs.js    (lobby catalog)
 *   lang/server-en.js             -> lang/server-cs.js               (server errors)
 *   public/js/tutorials.js        -> public/js/tutorials-cs.js       (rules overlay)
 *   games/drawguess-words.js      -> games/drawguess-words-cs.js     (draw & guess words)
 *   games/*.js renderers          -> public/js/lang/content-cs.js    (board/card text)
 *
 * Translations are machine produced (Google's public translate endpoint, batched
 * and throttled) and cached in scripts/i18n-cs-cache.json, so re-running only
 * fetches strings that are new or changed. Hand corrections belong in
 * scripts/i18n-cs-overrides.json, keyed by the English source string; they are
 * applied on every run and therefore survive regeneration.
 *
 * Usage: node scripts/i18n-cs.js [--force] [--offline] [--only=ui,catalog,server,tutorials,words,content]
 *   --force    re-translate everything, ignoring the cache
 *   --offline  never touch the network; untranslated strings stay English
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const CACHE_FILE = path.join(__dirname, 'i18n-cs-cache.json');
const OVERRIDE_FILE = path.join(__dirname, 'i18n-cs-overrides.json');
// The chrome-extension endpoint accepts several `q` params per call (one
// translation each) and is far less aggressive about rate limiting than the
// public `translate_a/single` one.
const ENDPOINT = 'https://clients5.google.com/translate_a/t';
const BATCH_SIZE = 24;
const MIN_GAP_MS = 220;

const argv = process.argv.slice(2);
const FORCE = argv.includes('--force');
const OFFLINE = argv.includes('--offline');
const ONLY = (argv.find((a) => a.startsWith('--only=')) || '').replace('--only=', '')
  .split(',').map((s) => s.trim()).filter(Boolean);
function wants(target) {
  return ONLY.length === 0 || ONLY.includes(target);
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function log(...args) {
  console.log('[i18n-cs]', ...args);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return fallback;
  }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

/** Runs a browser language-pack file in a sandbox and returns window.__LANG. */
function loadBrowserPack(file) {
  const sandbox = { window: {}, console, localStorage: { getItem: () => null, setItem: () => {} } };
  sandbox.window.window = sandbox.window;
  sandbox.window.localStorage = sandbox.localStorage;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
  return sandbox.window.__LANG;
}

/** A string is worth translating when it actually contains words. */
function needsTranslation(value) {
  if (typeof value !== 'string') return false;
  if (value.trim().length < 2) return false;
  return /[A-Za-z]{2}/.test(value);
}

// ---------------------------------------------------------------------------
// translation (batched, cached, retried)
// ---------------------------------------------------------------------------

const cache = readJson(CACHE_FILE, {});
const overrides = readJson(OVERRIDE_FILE, {});
let fetched = 0;
let failures = 0;
let lastRequestAt = 0;

function persistCache() {
  writeJson(CACHE_FILE, cache);
}

async function requestBatch(texts) {
  const url = ENDPOINT + '?client=dict-chrome-ex&sl=en&tl=cs&' +
    texts.map((t) => 'q=' + encodeURIComponent(t)).join('&');
  const wait = lastRequestAt + MIN_GAP_MS - Date.now();
  if (wait > 0) await sleep(wait);
  lastRequestAt = Date.now();
  // Without a timeout a throttled connection can hang the whole run.
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (GameNest i18n generator)' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) {
    const error = new Error('HTTP ' + res.status);
    error.status = res.status;
    throw error;
  }
  const json = await res.json();
  const out = Array.isArray(json) ? json : [json];
  if (out.length !== texts.length) {
    const error = new Error('unexpected batch size ' + out.length + '/' + texts.length);
    error.partial = out;
    throw error;
  }
  return out.map((value) => (typeof value === 'string' ? value : String(value == null ? '' : value)));
}

async function translateBatch(texts) {
  const missing = [];
  const results = new Map();
  for (const text of texts) {
    if (overrides[text] !== undefined) results.set(text, overrides[text]);
    else if (!FORCE && cache[text] !== undefined) results.set(text, cache[text]);
    else if (!needsTranslation(text)) results.set(text, text);
    else missing.push(text);
  }
  if (!missing.length) return results;

  const unresolved = [];
  const run = async (items) => {
    if (!items.length) return;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const out = await requestBatch(items);
        items.forEach((text, i) => {
          cache[text] = out[i];
          results.set(text, out[i]);
          fetched++;
        });
        if (fetched % 100 < items.length) persistCache();
        return;
      } catch (e) {
        const status = e && e.status;
        if (status === 429) {
          await sleep(5000 * (attempt + 1));
        } else if (items.length > 1) {
          // A single unsupported value must not poison the whole batch: retry
          // the strings one by one.
          for (const item of items) await run([item]);
          return;
        } else {
          await sleep(800 * (attempt + 1));
        }
      }
    }
    for (const item of items) {
      failures++;
      results.set(item, item);
      log('FAILED to translate:', item.slice(0, 70));
    }
    unresolved.push(...items);
  };

  for (let i = 0; i < missing.length; i += BATCH_SIZE) {
    await run(missing.slice(i, i + BATCH_SIZE));
  }
  if (unresolved.length) persistCache();
  return results;
}

/**
 * Translates a list of strings in batches, returning a Map of source -> Czech.
 * Batching keeps the number of HTTP calls (and the chance of a 429) low.
 */
async function translateList(texts) {
  const results = new Map();
  const missing = [];
  for (const text of texts) {
    if (typeof text !== 'string' || results.has(text)) continue;
    if (overrides[text] !== undefined) results.set(text, overrides[text]);
    else if (!FORCE && cache[text] !== undefined) results.set(text, cache[text]);
    else if (!needsTranslation(text)) results.set(text, text);
    else missing.push(text);
  }
  if (!missing.length) return results;

  const batches = [];
  for (let i = 0; i < missing.length; i += BATCH_SIZE) batches.push(missing.slice(i, i + BATCH_SIZE));

  let cursor = 0;
  const workers = [];
  const workerCount = Math.min(2, batches.length);
  for (let w = 0; w < workerCount; w++) {
    workers.push((async () => {
      while (cursor < batches.length) {
        const batch = batches[cursor++];
        const translated = await translateBatch(batch);
        for (const [text, value] of translated) results.set(text, value);
      }
    })());
  }
  await Promise.all(workers);
  persistCache();
  for (const text of missing) {
    if (!results.has(text) || results.get(text) === undefined) results.set(text, text);
  }
  return results;
}

// ---------------------------------------------------------------------------
// sources
// ---------------------------------------------------------------------------

function readEnglishUiPack() {
  return loadBrowserPack(path.join(ROOT, 'public/js/lang/en.js')).en;
}

function readEnglishCatalog() {
  return loadBrowserPack(path.join(ROOT, 'public/js/lang/catalog-en.js')).en.catalog;
}

function readEnglishTutorials() {
  const file = path.join(ROOT, 'public/js/tutorials.js');
  const sandbox = { window: {}, console };
  sandbox.window.window = sandbox.window;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
  return sandbox.window.__TUTORIALS_EN;
}

function readServerEnglish() {
  return require(path.join(ROOT, 'lang/server-en.js'));
}

function readDrawguessWords() {
  return require(path.join(ROOT, 'games/drawguess-words.js'));
}

/** English game-content strings (board squares, party cards, fruit names…). */
function collectContentStrings() {
  const files = [
    'games/monopoly.js',
    'games/truthdare.js',
    'public/js/renderers/monopoly.js',
    'public/js/renderers/suikabattle.js',
  ];
  const found = new Set();
  const pattern = /\b(?:nameEn|textEn|labelEn)\s*:\s*(['"])((?:\\.|(?!\1).)*)\1/g;
  for (const rel of files) {
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) continue;
    const source = fs.readFileSync(abs, 'utf8');
    let match;
    while ((match = pattern.exec(source)) !== null) {
      const raw = match[2].replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\');
      if (needsTranslation(raw)) found.add(raw);
    }
  }
  return Array.from(found);
}

// ---------------------------------------------------------------------------
// writers
// ---------------------------------------------------------------------------

function header(comment) {
  return '// ' + comment + '\n' +
    '// GENERATED by scripts/i18n-cs.js — do not edit by hand.\n' +
    '// Hand corrections go into scripts/i18n-cs-overrides.json and are re-applied on every run.\n';
}

function writeUiPack(pack) {
  const lines = [header('public/js/lang/cs.js — Czech UI strings.'), '(function() {',
    '  if (!window.__LANG) window.__LANG = {};', '  window.__LANG.cs = {'];
  for (const [key, value] of Object.entries(pack)) {
    lines.push('    ' + JSON.stringify(key) + ': ' + JSON.stringify(value) + ',');
  }
  lines.push('  };', '})();', '');
  fs.writeFileSync(path.join(ROOT, 'public/js/lang/cs.js'), lines.join('\n'));
}

function writeCatalogPack(catalog) {
  const lines = [header('public/js/lang/catalog-cs.js — Czech game catalog.'), '(function() {',
    '  if (!window.__LANG) window.__LANG = {};', '  if (!window.__LANG.cs) window.__LANG.cs = {};',
    '  window.__LANG.cs.catalog = {'];
  for (const [id, entry] of Object.entries(catalog)) {
    lines.push('    ' + JSON.stringify(id) + ': {');
    for (const [field, value] of Object.entries(entry)) {
      lines.push('      ' + JSON.stringify(field) + ': ' + JSON.stringify(value) + ',');
    }
    lines.push('    },');
  }
  lines.push('  };', '})();', '');
  fs.writeFileSync(path.join(ROOT, 'public/js/lang/catalog-cs.js'), lines.join('\n'));
}

function writeServerPack(pack) {
  const lines = [header('lang/server-cs.js — Czech server messages.'), 'module.exports = {'];
  for (const [key, value] of Object.entries(pack)) {
    lines.push('  ' + JSON.stringify(key) + ': ' + JSON.stringify(value) + ',');
  }
  lines.push('};', '');
  fs.writeFileSync(path.join(ROOT, 'lang/server-cs.js'), lines.join('\n'));
}

function writeTutorials(tutorials) {
  fs.writeFileSync(path.join(ROOT, 'public/js/tutorials-cs.js'),
    header('public/js/tutorials-cs.js — Czech rules text.') +
    'window.TUTORIALS_CS = ' + JSON.stringify(tutorials, null, 2) + ';\n');
}

function writeDrawguessWords(words) {
  fs.writeFileSync(path.join(ROOT, 'games/drawguess-words-cs.js'),
    header('games/drawguess-words-cs.js — Czech draw & guess words.') +
    'module.exports = ' + JSON.stringify(words, null, 2) + ';\n');
}

function writeContentMap(map) {
  const lines = [header('public/js/lang/content-cs.js — Czech board/card content, keyed by the English string.'),
    '(function() {', '  window.__LANG_CS_CONTENT = window.__LANG_CS_CONTENT || {};'];
  for (const [en, cs] of Object.entries(map)) {
    lines.push('  window.__LANG_CS_CONTENT[' + JSON.stringify(en) + '] = ' + JSON.stringify(cs) + ';');
  }
  lines.push('})();', '');
  fs.writeFileSync(path.join(ROOT, 'public/js/lang/content-cs.js'), lines.join('\n'));
}

// ---------------------------------------------------------------------------
// builders
// ---------------------------------------------------------------------------

function pick(map, text, fallback) {
  const value = map.get(text);
  return value === undefined || value === '' ? fallback : value;
}

/**
 * Explicit overrides can address a single field instead of a whole string:
 *   "key:some_key": "..."                 — one UI/server language key
 *   "catalog:<id>:<field>": "..."         — one catalog field
 *   "catalog:<id>:<field>:<index>": "..." — one item of a catalog array (e.g. a tag)
 * Field-level overrides win over string-level ones, which is how proper names
 * (UNO, Monopoly…) keep their real spelling in every language.
 */
function fieldOverride(id, field, index) {
  const keyed = 'catalog:' + id + ':' + field + (index === undefined ? '' : ':' + index);
  return overrides[keyed];
}

function keyOverride(key) {
  return overrides['key:' + key];
}

async function buildUiPack() {
  const en = readEnglishUiPack();
  const keys = Object.keys(en);
  const texts = keys.filter((key) => typeof en[key] === 'string');
  const map = await translateList(texts.map((key) => en[key]));
  const out = {};
  for (const key of keys) {
    const forced = keyOverride(key);
    out[key] = forced !== undefined ? forced
      : typeof en[key] === 'string' ? pick(map, en[key], en[key]) : en[key];
  }
  writeUiPack(out);
  log('wrote public/js/lang/cs.js (' + keys.length + ' keys)');
}

async function buildCatalogPack() {
  const en = readEnglishCatalog();
  const texts = [];
  for (const entry of Object.values(en)) {
    for (const value of Object.values(entry)) {
      if (Array.isArray(value)) texts.push(...value.filter((v) => typeof v === 'string'));
      else if (typeof value === 'string') texts.push(value);
    }
  }
  const map = await translateList(texts);
  const out = {};
  for (const [id, entry] of Object.entries(en)) {
    const translated = {};
    for (const [field, value] of Object.entries(entry)) {
      const forced = fieldOverride(id, field);
      if (Array.isArray(value)) {
        translated[field] = value.map((item, index) => {
          const forcedItem = fieldOverride(id, field, index);
          if (forcedItem !== undefined) return forcedItem;
          return typeof item === 'string' ? pick(map, item, item) : item;
        });
      } else if (forced !== undefined) {
        translated[field] = forced;
      } else {
        translated[field] = typeof value === 'string' ? pick(map, value, value) : value;
      }
    }
    out[id] = translated;
  }
  writeCatalogPack(out);
  log('wrote public/js/lang/catalog-cs.js (' + Object.keys(out).length + ' games)');
}

async function buildServerPack() {
  const en = readServerEnglish();
  const keys = Object.keys(en);
  const texts = keys.filter((key) => typeof en[key] === 'string');
  const map = await translateList(texts.map((key) => en[key]));
  const out = {};
  for (const key of keys) {
    const forced = keyOverride(key);
    out[key] = forced !== undefined ? forced
      : typeof en[key] === 'string' ? pick(map, en[key], en[key]) : en[key];
  }
  writeServerPack(out);
  log('wrote lang/server-cs.js (' + keys.length + ' keys)');
}

async function buildTutorials() {
  const en = readEnglishTutorials();
  if (!en) {
    log('SKIP tutorials: window.__TUTORIALS_EN not found');
    return;
  }
  const texts = [];
  for (const tutorial of Object.values(en)) {
    for (const section of (tutorial.sections || [])) {
      if (typeof section.h === 'string') texts.push(section.h);
      if (typeof section.p === 'string') texts.push(section.p);
    }
  }
  const map = await translateList(texts);
  const out = {};
  for (const [gameId, tutorial] of Object.entries(en)) {
    const sections = (tutorial.sections || []).map((section) => ({
      h: pick(map, section.h, section.h),
      p: pick(map, section.p, section.p),
    }));
    out[gameId] = Object.assign({}, tutorial, { sections });
  }
  writeTutorials(out);
  log('wrote public/js/tutorials-cs.js (' + Object.keys(out).length + ' tutorials)');
}

async function buildDrawguessWords() {
  const en = readDrawguessWords();
  const texts = [];
  for (const data of Object.values(en)) {
    if (typeof data.label === 'string') texts.push(data.label);
    const words = (data.wordsEn && data.wordsEn.length) ? data.wordsEn : data.words;
    texts.push(...words.filter((w) => typeof w === 'string'));
  }
  const map = await translateList(texts);
  const out = {};
  for (const [category, data] of Object.entries(en)) {
    const words = (data.wordsEn && data.wordsEn.length) ? data.wordsEn : data.words;
    out[category] = {
      label: pick(map, data.label, data.label),
      words: words.map((word) => pick(map, word, word)),
      wordsEn: words,
    };
  }
  writeDrawguessWords(out);
  log('wrote games/drawguess-words-cs.js (' + Object.keys(out).length + ' categories)');
}

async function buildContentMap() {
  const strings = collectContentStrings();
  const map = await translateList(strings);
  const ordered = {};
  for (const text of strings) ordered[text] = pick(map, text, text);
  writeContentMap(ordered);
  log('wrote public/js/lang/content-cs.js (' + strings.length + ' strings)');
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

async function main() {
  log('mode:', FORCE ? 'force' : 'cached', OFFLINE ? '(offline)' : '',
    ONLY.length ? '(only: ' + ONLY.join(',') + ')' : '');
  const t0 = Date.now();
  try {
    if (wants('ui')) await buildUiPack();
    if (wants('catalog')) await buildCatalogPack();
    if (wants('server')) await buildServerPack();
    if (wants('tutorials')) await buildTutorials();
    if (wants('words')) await buildDrawguessWords();
    if (wants('content')) await buildContentMap();
  } finally {
    persistCache();
  }
  log('done in', ((Date.now() - t0) / 1000).toFixed(1) + 's —',
    fetched, 'new translations,', failures, 'failures,', Object.keys(cache).length, 'cached');
  if (failures) process.exitCode = 1;
}

main().catch((e) => {
  persistCache();
  console.error('[i18n-cs] fatal:', e);
  process.exit(1);
});
