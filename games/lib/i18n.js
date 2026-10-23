// Shared helper for bilingual state narratives (server-side).
//
// Game modules pass a Chinese and an English variant. Czech is the app default,
// so it resolves through games/lib/content-cs.js: the English text is the hub
// and falls back to English when no Czech variant is defined yet.
const contentCs = require('./content-cs');

exports.pick = function (state, zh, en) {
  const lang = state && state._lang;
  if (lang === 'cs') return contentCs.translate(en || zh);
  return lang === 'en' ? (en || zh) : zh;
};
