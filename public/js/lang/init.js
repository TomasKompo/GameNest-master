// public/js/lang/init.js — language runtime (loaded after the language packs).
//
// Czech is the default language of the app; English is the fallback. Strings are
// looked up as: active language -> Czech -> English -> key, so a partially
// translated pack degrades gracefully instead of showing raw keys.
(function() {
  if (!window.__LANG) window.__LANG = {};
  var DEFAULT_LANG = 'cs';
  var FALLBACK_ORDER = ['cs', 'en'];
  window.__LANG_NAMES = { cs: 'Čeština', en: 'English' };

  function readStored() {
    try {
      var value = localStorage.getItem('lang');
      return (value && window.__LANG[value]) ? value : null;
    } catch (e) {
      return null;
    }
  }

  function browserLang() {
    try {
      var list = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''];
      for (var i = 0; i < list.length; i++) {
        var tag = String(list[i] || '').toLowerCase();
        // Czech and Slovak visitors both get the Czech pack.
        if (tag.indexOf('cs') === 0 || tag.indexOf('sk') === 0) return 'cs';
        if (tag.indexOf('en') === 0) return 'en';
      }
    } catch (e) { /* no navigator (tests) */ }
    return null;
  }

  if (!window.__ACTIVE_LANG || !window.__LANG[window.__ACTIVE_LANG]) {
    window.__ACTIVE_LANG = readStored() || browserLang() || DEFAULT_LANG;
  }
  if (!window.__LANG[window.__ACTIVE_LANG]) window.__ACTIVE_LANG = DEFAULT_LANG;

  function pack(lang) {
    return window.__LANG[lang] || null;
  }

  window._t = function(key) {
    var active = window.__ACTIVE_LANG || DEFAULT_LANG;
    var first = pack(active);
    if (first && first[key] !== undefined) return first[key];
    for (var i = 0; i < FALLBACK_ORDER.length; i++) {
      var fallback = pack(FALLBACK_ORDER[i]);
      if (fallback && fallback[key] !== undefined) return fallback[key];
    }
    return key;
  };

  window._tf = function(key) {
    var args = Array.prototype.slice.call(arguments, 1);
    var i = 0;
    return String(window._t(key)).replace(/%s/g, function() {
      var value = args[i++];
      return value === undefined ? '%s' : value;
    });
  };

  // Czech plurals: 1 -> key_1, 2-4 -> key_2, 0 and 5+ -> key.
  // Falls back to the base key whenever a plural form is missing.
  window._tn = function(count, key) {
    var n = Math.abs(Number(count) || 0);
    var suffix = n === 1 ? '_1' : (n >= 2 && n <= 4 ? '_2' : '');
    var value = window._t(key + suffix);
    if (value === key + suffix) value = window._t(key);
    return value;
  };

  // Game content (board squares, party cards…) ships as Chinese/English pairs in
  // the game modules; Czech translations live in content-cs.js keyed by English.
  window._loc = function(zh, en) {
    var lang = window.__ACTIVE_LANG || DEFAULT_LANG;
    if (lang === 'cs' && en) {
      var map = window.__LANG_CS_CONTENT;
      if (map && map[en]) return map[en];
    }
    if ((lang === 'en' || lang === 'cs') && en) return en;
    return zh || en || '';
  };

  window._setLang = function(lang, options) {
    if (!window.__LANG[lang]) return false;
    window.__ACTIVE_LANG = lang;
    try { localStorage.setItem('lang', lang); } catch (e) { /* private mode */ }
    if (!(options && options.silent)) return true;
    return true;
  };

  window._switchLang = function(lang) {
    if (!window.__LANG[lang] || lang === window.__ACTIVE_LANG) return;
    window._setLang(lang);
    window.location.reload();
  };

  // Applies data-i18n attributes to static markup. English text is written
  // directly into the HTML (so the page never flashes raw keys); this keeps the
  // other languages in sync.
  window._applyI18n = function(root) {
    var scope = root || document;
    // Keep the document language in sync for screen readers and hyphenation.
    if (scope === document && document.documentElement) {
      document.documentElement.lang = window.__ACTIVE_LANG || DEFAULT_LANG;
    }
    var nodes = scope.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].textContent = window._t(nodes[i].getAttribute('data-i18n'));
    }
    nodes = scope.querySelectorAll('[data-i18n-html]');
    for (var j = 0; j < nodes.length; j++) {
      nodes[j].innerHTML = window._t(nodes[j].getAttribute('data-i18n-html'));
    }
    nodes = scope.querySelectorAll('[data-i18n-placeholder]');
    for (var k = 0; k < nodes.length; k++) {
      nodes[k].placeholder = window._t(nodes[k].getAttribute('data-i18n-placeholder'));
    }
    nodes = scope.querySelectorAll('[data-i18n-title]');
    for (var l = 0; l < nodes.length; l++) {
      var label = window._t(nodes[l].getAttribute('data-i18n-title'));
      nodes[l].title = label;
      if (!nodes[l].getAttribute('aria-label')) nodes[l].setAttribute('aria-label', label);
    }
  };
})();
