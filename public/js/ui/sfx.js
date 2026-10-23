// public/js/ui/sfx.js — tiny WebAudio effects (no audio files, works offline).
//
// The sound preference lives in localStorage so it applies immediately after a
// reload (the server profile is the source of truth and re-syncs on connect).
(function() {
  var STORAGE_KEY = 'gamenest.sound';
  var ctx = null;
  var lastPlayed = 0;

  function readEnabled() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw === null ? true : raw === '1';
    } catch (e) {
      return true;
    }
  }

  var state = { enabled: readEnabled() };

  function context() {
    if (ctx) return ctx;
    var Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    try { ctx = new Ctor(); } catch (e) { ctx = null; }
    return ctx;
  }

  // Browsers start an AudioContext suspended until the page has seen a real
  // gesture. Without this the first effect triggered by a server message (an
  // opponent joining, a turn starting) would be swallowed silently.
  function unlock() {
    var audio = context();
    if (audio && audio.state === 'suspended') {
      try { audio.resume(); } catch (e) { /* unsupported */ }
    }
  }
  ['pointerdown', 'touchstart', 'keydown'].forEach(function(ev) {
    document.addEventListener(ev, unlock, { passive: true });
  });
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden) unlock();
  });

  // note: [frequency, start offset (s), duration (s), gain, waveform?]
  var RECIPES = {
    // Room / lobby events
    turn: [[660, 0, 0.09, 0.05], [880, 0.1, 0.12, 0.05]],
    join: [[520, 0, 0.07, 0.04], [780, 0.08, 0.09, 0.04]],
    leave: [[520, 0, 0.09, 0.035], [330, 0.09, 0.12, 0.035]],
    win: [[660, 0, 0.1, 0.06], [880, 0.11, 0.1, 0.06], [1180, 0.22, 0.16, 0.06]],
    lose: [[440, 0, 0.12, 0.05], [330, 0.13, 0.18, 0.05]],
    error: [[220, 0, 0.14, 0.05]],
    click: [[880, 0, 0.04, 0.03]],

    // In-game feedback
    deal: [[520, 0, 0.04, 0.026], [520, 0.075, 0.04, 0.026], [520, 0.15, 0.05, 0.03]],
    place: [[520, 0, 0.05, 0.03, 'triangle'], [300, 0.015, 0.05, 0.018]],
    capture: [[200, 0, 0.08, 0.05, 'square'], [140, 0.055, 0.13, 0.045]],
    card: [[980, 0, 0.045, 0.022, 'triangle'], [620, 0.035, 0.07, 0.02]],
    draw: [[420, 0, 0.05, 0.025], [660, 0.055, 0.08, 0.028]],
    tile: [[760, 0, 0.035, 0.022, 'triangle']],
    dice: [[320, 0, 0.03, 0.028, 'square'], [430, 0.05, 0.03, 0.026, 'square'], [300, 0.1, 0.03, 0.022, 'square']],
    coin: [[1320, 0, 0.06, 0.032], [1760, 0.07, 0.11, 0.026]],
    hit: [[120, 0, 0.14, 0.06, 'sawtooth'], [80, 0.04, 0.18, 0.045]],
    miss: [[460, 0, 0.07, 0.028], [300, 0.06, 0.12, 0.022]],
    boom: [[95, 0, 0.3, 0.075, 'sawtooth'], [60, 0.05, 0.35, 0.06, 'square']],
    correct: [[660, 0, 0.07, 0.035], [990, 0.08, 0.1, 0.035]],
    wrong: [[300, 0, 0.08, 0.04, 'square'], [220, 0.08, 0.11, 0.035]],
    tap: [[340, 0, 0.03, 0.018, 'triangle']],
  };

  // These matter more than a move tick when two state updates land together.
  var IMPORTANT = { turn: 1, win: 1, lose: 1, error: 1, deal: 1, boom: 1 };

  function play(name) {
    if (!state.enabled) return false;
    var recipe = RECIPES[name];
    if (!recipe) return false;
    var audio = context();
    if (!audio) return false;
    // Never stack effects: a burst of state updates would turn into noise.
    var now = Date.now();
    if (now - lastPlayed < 120 && !IMPORTANT[name]) return false;
    lastPlayed = now;
    try {
      if (audio.state === 'suspended') audio.resume();
      var base = audio.currentTime;
      recipe.forEach(function(note) {
        var osc = audio.createOscillator();
        var gain = audio.createGain();
        osc.type = note[4] || 'sine';
        osc.frequency.value = note[0];
        var start = base + note[1];
        var end = start + note[2];
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(note[3], start + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, end);
        osc.connect(gain);
        gain.connect(audio.destination);
        osc.start(start);
        osc.stop(end + 0.02);
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  function vibrate(pattern) {
    try {
      if (navigator.vibrate) navigator.vibrate(pattern);
    } catch (e) { /* unsupported */ }
  }

  window._sfx = {
    get enabled() { return state.enabled; },
    set enabled(value) {
      state.enabled = !!value;
      try { localStorage.setItem(STORAGE_KEY, state.enabled ? '1' : '0'); } catch (e) {}
    },
    play: play,
    vibrate: vibrate,
    unlock: unlock,
    has: function(name) { return !!RECIPES[name]; },
  };
})();
