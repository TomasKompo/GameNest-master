// games/lib/content-cs.js — Czech in-game narratives.
//
// Game modules build log lines by composing bilingual strings (`pick(state, zh, en)`).
// The English text is the hub: it is translated with a small exact-match table
// plus a list of patterns for the templated sentences. Anything not covered
// falls back to English, so Czech players never see Chinese logs.
//
// Hand-maintained on purpose: these strings are short, punctuated with game
// symbols and full of numbers, which machine translation mangles.

'use strict';

// Exact matches: 'English' -> 'Česky'
const EXACT = {
  '(timeout)': '(vypršel čas)',
  '🎲 Guaranteed 6 activated!': '🎲 Záruka šestky! Automaticky padla šestka',
  'Next...': 'Další…',
  'Next shooter...': 'Další střelec…',
  '👻 Ghost card! Everyone except the player takes a shot': '👻 Karta duch! Všichni kromě hráče, který ji zahrál, si dají panáka',
  '↑ too high': '↑ moc vysoko',
  '↓ too low': '↓ moc nízko',
  'drew the ghost card 🃏': 'si vytáhl černého Petra 🃏',
};

// Pattern matches for templated sentences, tried in order.
// [ /regex/, 'Czech with $1, $2 …' ]
const PATTERNS = [
  [/^(.+) rolled (\d+)$/, '$1 hodil $2'],
  [/^(.+) rolled 3 sixes in a row, turn forfeited$/, '$1 hodil třikrát za sebou šestku, kolo propadá'],
  [/^(.+) has no valid moves, skipping$/, '$1 nemá platný tah, přeskakuje se'],
  [/^(.+) launched plane #(\d+)$/, '$1 vypustil letadlo č. $2'],
  [/^(.+)'s plane #(\d+) reached home!$/, 'Letadlo č. $2 hráče $1 dorazilo domů!'],
  [/^(.+) rolled too high, bouncing back$/, '$1 hodil příliš mnoho, odráží se zpět'],
  [/^✈ (.+) flew across the board!$/, '✈ $1 přeletěl přes celou desku!'],
  [/^(.+) jumped \+4 on same color$/, '$1 skočil +4 na stejnou barvu'],
  [/^(.+) caught (.+)'s plane!$/, '$1 sestřelil letadlo hráče $2!'],
  [/^Player (\d+)$/, 'Hráč $1'],
  [/^P(\d+) guessed (\d+) 💥 Bomb! -1 life \((\d+) ❤️ left\)$/,
    'P$1 tipnul $2 💥 Bomba! −1 život (zbývá $3 ❤️)'],
  [/^P(\d+) guessed (\d+) (↑ moc vysoko|↓ moc nízko) → only (\d+) left, next player will hit!$/,
    'P$1 tipnul $2 $3 → zbývá jediné číslo $4, na řadě je další hráč!'],
  [/^P(\d+) guessed (\d+) (↑ moc vysoko|↓ moc nízko) → range (\d+)~(\d+)$/,
    'P$1 tipnul $2 $3 → rozsah $4–$5'],
  [/^P(\d+) discarded pair: (.*)$/, 'P$1 vyhodil pár: $2'],
  [/^P(\d+) drew a card from P(\d+)$/, 'P$1 si lízl kartu od hráče P$2'],
  [/^P(\d+) hand is empty!$/, 'P$1 má prázdnou ruku!'],
  [/^Challenge failed! They were all (.*) \(or wild\)$/, 'Zpochybnění nevyšlo! Byly tam samé $1 (nebo divoká karta)'],
  [/^Challenge successful! They played (.*), not (.*)$/, 'Zpochybnění vyšlo! Zahráli $1, ne $2'],
  [/^(.+) is waiting$/, '$1 čeká'],
];

/**
 * Translates one narrative string. `text` may already contain the Chinese text
 * when no English variant exists — in that case we return it untouched.
 */
function translate(text) {
  if (typeof text !== 'string' || !text) return text;
  if (EXACT[text] !== undefined) return EXACT[text];
  for (const [pattern, replacement] of PATTERNS) {
    if (pattern.test(text)) return text.replace(pattern, replacement);
  }
  return text;
}

module.exports = { translate, EXACT, PATTERNS };
