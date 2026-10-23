// public/js/ui/profile-card.js — the shared profile editor.
//
// Used by the lobby and by the in-room profile drawer. It only renders and
// reports changes through `onChange(patch)`; the caller decides how to persist
// them (REST in the lobby, WebSocket in a room).
(function() {
  var EMOTES = ['😊','😂','🤣','😍','😎','🤩','😇','🤠','💀','👻','🎃','🤖','👾','🐱','🐶','🦊','🐼','🐸','🦄','🐙','🌈','⭐','🔥','❤️','🍕','🎸','⚽','🚀','🎯','💰','🧩','🎲','🃏','🏆','💣','🔮','🎨','🍀','🌻','🐉','🍄','💎','👑','💪','🎉','🦖','🦝','🐒','🐳'];
  var COLORS = ['#1a1a1a', '#c8a45c', '#d4695a', '#5a9e6f', '#5b7cbf', '#9b6bb8', '#e08a3c', '#4aa3a3'];

  function esc(value) {
    return String(value === undefined || value === null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function t(key) {
    return typeof window._t === 'function' ? window._t(key) : key;
  }

  function tf(key) {
    var args = Array.prototype.slice.call(arguments, 1);
    return typeof window._tf === 'function' ? window._tf.apply(null, [key].concat(args)) : t(key);
  }

  // Vibration only exists on touch hardware. Desktop browsers either have no
  // navigator.vibrate at all, or keep it as a silent no-op, so the toggle there
  // is just clutter — show it on coarse-pointer (phone/tablet) devices only.
  function hasHaptics() {
    if (!navigator.vibrate) return false;
    // A touchscreen laptop still reports a fine primary pointer, so this stays
    // hidden on PC even when the screen can be tapped.
    if (window.matchMedia) return window.matchMedia('(pointer: coarse)').matches;
    return 'ontouchstart' in window && navigator.maxTouchPoints > 0;
  }

  var state = { profile: null, onChange: null, onEdit: null, root: null, compact: false };

  function html() {
    if (state.compact) return compactHtml();
    var profile = state.profile || {};
    var prefs = profile.prefs || {};
    var stats = profile.stats || {};
    var color = profile.color || COLORS[0];
    var out = '';
    out += '<div class="pc-head">';
    out += '  <div class="pc-avatar" id="pcAvatar">' + esc(profile.avatar || '🙂') + '</div>';
    out += '  <div class="pc-head-body">';
    out += '    <input class="pc-name" id="pcName" maxlength="12" autocomplete="off" spellcheck="false" placeholder="' + esc(t('name_placeholder')) + '" value="' + esc(profile.name || '') + '">';
    out += '    <div class="pc-head-meta">' + esc(t('profile_ip_note')) + '</div>';
    out += '  </div>';
    out += '</div>';

    // Session XP: earned per IP, reset whenever the server restarts.
    var xp = profile.xp;
    if (xp && typeof xp.total === 'number') {
      var pct = xp.need > 0 ? Math.min(100, Math.round((xp.into / xp.need) * 100)) : 100;
      out += '<div class="pc-xp">';
      out += '  <div class="pc-xp-top">' +
        '<span class="pc-xp-level">' + esc(tf('xp_level', xp.level)) + '</span>' +
        '<span class="pc-xp-total">' + esc(tf('xp_total', xp.total)) + '</span>' +
        '</div>';
      out += '  <div class="pc-xp-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '">' +
        '<span style="width:' + pct + '%"></span></div>';
      out += '  <div class="pc-xp-next">' + esc(tf('xp_to_next', xp.level + 1, xp.need - xp.into)) + '</div>';
      out += '  <div class="pc-note">' + esc(t('xp_session_note')) + '</div>';
      out += '</div>';
    }

    out += '<div class="pc-section"><div class="pc-label">' + esc(t('profile_avatar_label')) + '</div><div class="pc-emoji" id="pcEmoji">';
    out += EMOTES.map(function(e) {
      return '<button type="button" class="pc-emoji-btn' + (e === profile.avatar ? ' selected' : '') + '" data-avatar="' + esc(e) + '">' + e + '</button>';
    }).join('');
    out += '</div></div>';

    out += '<div class="pc-section"><div class="pc-label">' + esc(t('profile_color_label')) + '</div><div class="pc-colors" id="pcColors">';
    out += COLORS.map(function(c) {
      return '<button type="button" class="pc-color' + (c === color ? ' selected' : '') + '" data-color="' + esc(c) + '" style="background:' + esc(c) + '"></button>';
    }).join('');
    out += '</div></div>';

    out += '<div class="pc-section"><div class="pc-label">' + esc(t('profile_prefs')) + '</div>';
    out += toggle('sound', t('pref_sound'), prefs.sound !== false);
    out += toggle('autoReady', t('pref_auto_ready'), !!prefs.autoReady);
    if (hasHaptics()) out += toggle('vibrate', t('pref_vibrate'), prefs.vibrate !== false);
    out += '</div>';

    out += '<div class="pc-section pc-stats"><div class="pc-label">' + esc(t('profile_stats')) + '</div>';
    out += '<div class="pc-stats-row">' +
      stat(stats.games || 0, t('profile_stat_games')) +
      stat(stats.wins || 0, t('profile_stat_wins')) +
      stat(stats.rooms || 0, t('profile_stat_rooms')) +
      '</div>';
    out += '<div class="pc-note">' + esc(t('profile_reset_note')) + '</div></div>';
    return out;

    function toggle(key, label, on) {
      return '<button type="button" class="pc-toggle' + (on ? ' on' : '') + '" data-pref="' + key + '">' +
        '<span>' + esc(label) + '</span><span class="pc-toggle-pill">' + esc(t(on ? 'on' : 'off')) + '</span></button>';
    }
    function stat(value, label) {
      return '<div class="pc-stat"><strong>' + esc(value) + '</strong><span>' + esc(label) + '</span></div>';
    }
  }

  /**
   * Lobby summary: identity + session XP only. The full editor (avatars,
   * colours, preferences, stats) lives in the drawer that "Edit" opens, so
   * the hero stays a hero instead of becoming a settings page.
   */
  function compactHtml() {
    var profile = state.profile || {};
    var stats = profile.stats || {};
    var out = '<div class="pc-compact">';
    out += '<div class="pc-compact-head">';
    out += '<button type="button" class="pc-avatar pc-avatar-sm" data-edit="1" title="' + esc(t('profile_edit')) + '">' + esc(profile.avatar || '🙂') + '</button>';
    out += '<div class="pc-compact-id">';
    out += '<input class="pc-name" id="pcName" maxlength="12" autocomplete="off" spellcheck="false" placeholder="' + esc(t('name_placeholder')) + '" value="' + esc(profile.name || '') + '">';
    out += '<span class="pc-compact-meta">' + esc(t('profile_ip_note')) + '</span>';
    out += '</div></div>';

    var xp = profile.xp;
    if (xp && typeof xp.total === 'number') {
      var pct = xp.need > 0 ? Math.min(100, Math.round((xp.into / xp.need) * 100)) : 100;
      out += '<div class="pc-xp pc-xp-sm">';
      out += '  <div class="pc-xp-top">' +
        '<span class="pc-xp-level">' + esc(tf('xp_level', xp.level)) + '</span>' +
        '<span class="pc-xp-total">' + esc(tf('xp_total', xp.total)) + '</span>' +
        '</div>';
      out += '  <div class="pc-xp-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '">' +
        '<span style="width:' + pct + '%"></span></div>';
      out += '  <div class="pc-xp-next">' + esc(tf('xp_to_next', xp.level + 1, xp.need - xp.into)) + '</div>';
      out += '</div>';
    }

    out += '<div class="pc-compact-foot">';
    out += '<span class="pc-compact-stats">' + esc(tf('profile_compact_stats', stats.games || 0, stats.wins || 0)) + '</span>';
    out += '<button type="button" class="pc-edit-link" data-edit="1">' + esc(t('profile_edit')) + '</button>';
    out += '</div></div>';
    return out;
  }

  function emit(patch) {
    if (typeof state.onChange === 'function') state.onChange(patch);
  }

  function bind() {
    var root = state.root;
    if (!root) return;
    var profile = state.profile = state.profile || {};

    root.querySelectorAll('[data-edit]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        if (typeof state.onEdit === 'function') state.onEdit();
      });
    });

    var nameInput = root.querySelector('#pcName');
    if (nameInput) {
      // Commit on blur/Enter instead of on every keystroke: the server is the
      // profile store and a half-typed nickname should not be saved.
      var commitName = function() {
        var value = nameInput.value.trim();
        if (!value) { nameInput.value = profile.name || ''; return; }
        if (value === profile.name) return;
        profile.name = value;
        emit({ name: value });
      };
      nameInput.addEventListener('change', commitName);
      nameInput.addEventListener('blur', commitName);
      nameInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') { commitName(); nameInput.blur(); }
      });
    }

    root.querySelectorAll('.pc-emoji-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var avatar = btn.getAttribute('data-avatar');
        profile.avatar = avatar;
        var display = root.querySelector('#pcAvatar');
        if (display) display.textContent = avatar;
        root.querySelectorAll('.pc-emoji-btn').forEach(function(other) {
          other.classList.toggle('selected', other === btn);
        });
        emit({ avatar: avatar });
      });
    });

    root.querySelectorAll('.pc-color').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var color = btn.getAttribute('data-color');
        profile.color = color;
        root.querySelectorAll('.pc-color').forEach(function(other) {
          other.classList.toggle('selected', other === btn);
        });
        var avatar = root.querySelector('#pcAvatar');
        if (avatar) avatar.style.borderColor = color;
        emit({ color: color });
      });
    });

    root.querySelectorAll('.pc-toggle').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var key = btn.getAttribute('data-pref');
        var prefs = (profile.prefs = profile.prefs || {});
        var next = !(key === 'sound' ? prefs.sound !== false
          : key === 'vibrate' ? prefs.vibrate !== false
          : !!prefs.autoReady);
        prefs[key] = next;
        btn.classList.toggle('on', next);
        var pill = btn.querySelector('.pc-toggle-pill');
        if (pill) pill.textContent = t(next ? 'on' : 'off');
        if (key === 'sound' && window._sfx) window._sfx.enabled = next;
        // Audible confirmation: turning sound on immediately plays a preview,
        // every other toggle clicks so the effect is easy to recognise.
        if (window._sfx) window._sfx.play('click');
        emit({ prefs: prefs });
      });
    });
  }

  function render(root, profile, options) {
    if (!root) return;
    var opts = options || {};
    state.root = root;
    state.profile = profile || {};
    state.onChange = opts.onChange || null;
    state.onEdit = opts.onEdit || null;
    state.compact = !!opts.compact;
    root.classList.add('pc-root');
    root.classList.toggle('pc-root-compact', state.compact);
    root.innerHTML = html();
    bind();
  }

  /** Updates the rendered values in place (used when the server pushes changes). */
  function refresh(profile) {
    if (!state.root || !profile) return;
    state.profile = profile;
    state.root.innerHTML = html();
    bind();
  }

  window.ProfileCard = { render: render, refresh: refresh, emojis: EMOTES, colors: COLORS };
})();
