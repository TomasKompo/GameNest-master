// public/js/renderers/uno.js
(function() {
  window.gameRenderers = window.gameRenderers || new Map();

  function t(key) { return typeof _t === 'function' ? _t(key) : key; }
  function tf(key) { var args = Array.prototype.slice.call(arguments, 1); return String(t(key)).replace(/%s/g, function() { return args.shift(); }); }
  function playerName(i) {
    if (window.gamePlayers && window.gamePlayers[i] && window.gamePlayers[i].name) return window.gamePlayers[i].name;
    return tf('uno_player', i + 1);
  }

  var VALUES = {
    '0':'0','1':'1','2':'2','3':'3','4':'4','5':'5','6':'6','7':'7','8':'8','9':'9',
    'skip':'⊘', 'reverse':'⇄', '+2':'+2', 'wild':'★', '+4':'+4'
  };

  var COLOR_HEX = { red:'#e74c3c', blue:'#3498db', green:'#2ecc71', yellow:'#f1c40f', wild:'#555' };
  var COLOR_TEXT = { red:'#fff', blue:'#fff', green:'#fff', yellow:'#222', wild:'#fff' };
  var COLOR_NAMES = {
    red: t('uno_red'), blue: t('uno_blue'), green: t('uno_green'), yellow: t('uno_yellow')
  };
  var COLOR_ORDER = ['red','blue','green','yellow'];
  var CARD_COLOR = { red:'#d63a2f', blue:'#1f6fd1', green:'#2c9a55', yellow:'#f2b705' };

  // Inline SVG glyphs for action cards (currentColor so they tint per card).
  var ICONS = {
    skip: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="3"/><path d="M6.2 17.8 17.8 6.2" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
    reverse: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 9.5h11l-3-3M19 14.5H8l3 3" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    wild: '<svg viewBox="0 0 24 24" aria-hidden="true"><g transform="rotate(-28 12 12)"><path d="M12 3a6 9 0 0 0-6 9h6z" fill="#d63a2f"/><path d="M12 3a6 9 0 0 1 6 9h-6z" fill="#1f6fd1"/><path d="M12 21a6 9 0 0 1-6-9h6z" fill="#f2b705"/><path d="M12 21a6 9 0 0 0 6-9h-6z" fill="#2c9a55"/></g></svg>'
  };

  function valueGlyph(value) {
    if (ICONS[value]) return ICONS[value];
    if (value === '+2' || value === '+4') return '<span class="uf-num uf-plus">' + value + '</span>';
    return '<span class="uf-num">' + (VALUES[value] || value) + '</span>';
  }

  function cornerLabel(value) {
    if (value === 'skip') return '⊘';
    if (value === 'reverse') return '⇄';
    if (value === 'wild') return '';
    return value;
  }

  function cardFace(card) {
    var bg = card.color === 'wild' ? '#1c1b19' : (CARD_COLOR[card.color] || '#888');
    var corner = cornerLabel(card.value);
    var center = card.value === '+4'
      ? ICONS.wild + '<span class="uf-num uf-plus uf-over">+4</span>'
      : valueGlyph(card.value);
    return '<div class="uf" style="--uc:' + bg + '">' +
      '<span class="uf-oval">' + center + '</span>' +
      (corner ? '<span class="uf-corner">' + corner + '</span><span class="uf-corner uf-br">' + corner + '</span>' : '') +
    '</div>';
  }

  function cardBack() {
    return '<div class="uf uf-back" style="--uc:#1c1b19"><span class="uf-oval">' + ICONS.wild + '</span></div>';
  }

  // The style injection used to rely on a global that some pages did not load;
  // fall back to a local <style> so the table can never render as blank cards.
  function ensureStyles() {
    if (window.injectStylesOnce) {
      try { window.injectStylesOnce('unoRendererStyles', STYLES); return; } catch (e) { /* fall through */ }
    }
    if (document.getElementById('unoRendererStyles')) return;
    var style = document.createElement('style');
    style.id = 'unoRendererStyles';
    style.textContent = STYLES;
    document.head.appendChild(style);
  }

  var STYLES = '' +
    '.uno-table{width:100%;max-width:1040px;margin:0 auto;min-height:min(64vh,660px);display:flex;flex-direction:column;justify-content:space-between;gap:8px;}' +
    '.uno-opponents{display:flex;flex-wrap:wrap;gap:6px;max-height:22vh;overflow-y:auto;flex-shrink:0;align-items:flex-start;align-content:flex-start;justify-content:center;}' +
    '.uno-opponent{flex:0 1 auto;min-width:74px;max-width:150px;display:flex;flex-direction:column;align-items:flex-start;padding:4px 7px;background:var(--bg);border-radius:10px;font-size:10px;font-weight:600;border:2px solid transparent;transition:border-color .25s;overflow:hidden;}' +
    '.uno-opponent.active-turn{border-color:var(--accent);background:var(--surface);animation:pulse 2s ease infinite;}' +
    '.uno-opponent .opp-top{display:flex;justify-content:space-between;align-items:center;width:100%;gap:6px;}' +
    '.uno-opponent .card-count{font-size:11px;color:var(--text-muted);}' +
    '.uno-opponent .card-backs{display:flex;gap:1px;margin-top:2px;}' +
    '.uno-opponent .mini-back{width:9px;height:14px;background:linear-gradient(135deg,#c8a45c,#a8863a);border-radius:2px;}' +
    '.uno-center{display:flex;flex-direction:column;align-items:center;gap:4px;margin:2px 0;}' +
    '.uno-color-badge{font-size:12px;font-weight:700;padding:3px 14px;border-radius:20px;color:#fff;transition:background .3s;}' +
    '.uno-play-area{display:flex;gap:20px;align-items:center;justify-content:center;padding:4px 0 20px;position:relative;}' +
    '.uno-discard-card{width:76px;height:110px;border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 2px 10px rgba(0,0,0,.15);position:relative;transition:transform .2s;}' +
    '.uno-discard-card.play-flash{animation:unoDiscardPop .42s ease;}' +
    '.uno-draw-pile{width:76px;height:110px;border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#2a2a2a;color:#fff;box-shadow:0 2px 10px rgba(0,0,0,.1);cursor:pointer;border:none;padding:0;position:relative;}' +
    '.uno-draw-pile:disabled{opacity:.55;cursor:default;}' +
    '.uno-draw-pile .uno-pile-count{position:absolute;bottom:-19px;left:0;right:0;text-align:center;font-size:11px;font-weight:700;color:var(--text-muted);white-space:nowrap;}' +
    '.uno-hand-wrap{padding:4px 2px;margin:0 -4px;}' +
    '.uno-hand{display:flex;flex-wrap:wrap;gap:6px;padding:2px 4px;justify-content:center;}' +
    '.uno-card{width:58px;height:87px;border-radius:9px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:800;box-shadow:0 2px 6px rgba(0,0,0,.13);cursor:pointer;transition:transform .15s,opacity .15s,box-shadow .15s;flex-shrink:0;position:relative;}' +
    '.uno-card.new-card{animation:unoNewCardIn .38s ease;}' +
    '.uno-card:active{transform:scale(.94);}' +
    '.uno-card.not-playable{opacity:.94;cursor:default;}' +
    '.uno-card.not-playable:active{transform:none;}' +
    '.uf{position:absolute;inset:0;border-radius:inherit;background:var(--uc);box-shadow:inset 0 0 0 3px #fff;overflow:hidden;color:var(--uc);}' +
    '.uf-oval{position:absolute;left:50%;top:50%;width:74%;height:62%;transform:translate(-50%,-50%) rotate(-28deg);background:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;}' +
    '.uf-oval>*{transform:rotate(28deg);}' +
    '.uf-oval svg{width:58%;height:auto;}' +
    '.uf-num{font-weight:900;font-size:calc(var(--cw) * .44);line-height:1;letter-spacing:-1px;text-shadow:1px 1px 0 rgba(0,0,0,.18);}' +
    '.uf-plus{font-size:calc(var(--cw) * .32);}' +
    '.uf-over{position:absolute;color:#fff;-webkit-text-stroke:1px #1c1b19;}' +
    '.uf-corner{position:absolute;top:5%;left:9%;font-weight:900;font-size:calc(var(--cw) * .2);line-height:1;color:#fff;text-shadow:0 1px 1px rgba(0,0,0,.35);}' +
    '.uf-br{top:auto;left:auto;bottom:5%;right:9%;transform:rotate(180deg);}' +
    '.uf-back .uf-oval{background:#d63a2f;}' +
    '.uf-back .uf-oval svg{width:70%;}' +
    '.uno-card,.uno-discard-card,.uno-draw-pile{--cw:58px;position:relative;background:#fff !important;padding:0;border:none;}' +
    '.uno-discard-card,.uno-draw-pile{--cw:76px;}' +
    '@media(min-width:900px){.uno-card{width:66px;height:99px;--cw:66px;}.uno-hand{gap:9px;}}' +
    '@media (hover:hover){.uno-card.playable:hover{transform:translateY(-6px);box-shadow:0 10px 20px rgba(0,0,0,.18);}}' +
    '.uno-card.playable{box-shadow:0 3px 9px rgba(0,0,0,.18),0 0 0 2px #fff,0 0 0 5px rgba(28,27,25,.82);}' +
    '.uno-card.drew-this{outline:3px solid #f2b705;outline-offset:2px;}' +
    '.uno-opp-badge{font-size:8px;font-weight:800;padding:1px 4px;border-radius:5px;margin-left:3px;}' +
    '.uno-opp-badge.safe{background:#2ecc71;color:#fff;}' +
    '.uno-opp-badge.warn{background:#f2b705;color:#2a220a;}' +
    '.uno-actions{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;}' +
    '.uno-hint{min-height:16px;text-align:center;font-size:12px;color:var(--text-muted);padding:1px 6px;}' +
    '.uno-hint.warn{color:#d63a2f;font-weight:700;}' +
    '.uno-dir{font-size:11px;color:var(--text-muted);letter-spacing:2px;}' +
    '.uno-last{display:flex;align-items:center;justify-content:center;gap:7px;min-height:34px;font-size:12px;color:var(--text-muted);font-weight:600;}' +
    '.uno-last-name{max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
    '.uno-mini{position:relative;width:24px;height:34px;border-radius:4px;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.22);flex-shrink:0;}' +
    '.uno-mini .uf-num{font-size:11px;letter-spacing:0;}' +
    '.uno-mini .uf-corner{display:none;}' +
    '.uno-color-picker-btns{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;padding:2px 0;}' +
    '.uno-color-picker-btn{width:48px;height:48px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.2);cursor:pointer;font-size:12px;font-weight:700;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.3);transition:transform .15s;}' +
    '.uno-color-picker-btn:active{transform:scale(.9);}' +
    '.uno-swap-list{display:flex;flex-direction:column;gap:8px;max-height:50vh;overflow-y:auto;}' +
    '.uno-swap-option{display:flex;align-items:center;justify-content:space-between;gap:12px;border:1px solid var(--border);background:var(--bg);border-radius:12px;padding:10px 14px;font-size:14px;font-weight:600;cursor:pointer;}' +
    '.uno-swap-option:active{transform:scale(.98);}' +
    '.uno-swap-option .swap-count{font-size:12px;color:var(--text-muted);font-weight:600;}' +
    '.uno-swap-skip{margin-top:12px;width:100%;}' +
    '.uno-race{z-index:60;background:rgba(20,18,14,.72);backdrop-filter:blur(4px);}' +
    '.uno-race-card{display:flex;flex-direction:column;align-items:center;gap:12px;padding:0 20px;text-align:center;}' +
    '.uno-race-title{font-size:13px;letter-spacing:4px;color:#fff;opacity:.8;font-weight:800;text-transform:uppercase;}' +
    '.uno-race-btn{width:min(64vmin,320px);height:min(64vmin,320px);border-radius:50%;border:10px solid #fff;background:#d63a2f;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:min(18vmin,84px);font-weight:900;letter-spacing:1px;box-shadow:0 18px 50px rgba(0,0,0,.45);cursor:pointer;animation:unoRacePulse 1s ease-in-out infinite;}' +
    '.uno-race-btn span{font-size:.5em;line-height:0.8;}' +
    '.uno-race-btn:active{transform:scale(.96);}' +
    '.uno-race-hint{color:#fff;font-size:15px;font-weight:600;max-width:420px;line-height:1.35;}' +
    '.uno-race-time{color:#f2b705;font-size:26px;font-weight:900;font-variant-numeric:tabular-nums;}' +
    '.uno-race-you{color:#fff;font-size:13px;opacity:.85;}' +
    '@keyframes unoRacePulse{0%,100%{transform:scale(1);}50%{transform:scale(1.035);}}' +
    '@keyframes unoDiscardPop{' +
      '0%{transform:translateY(12px) scale(.92) rotate(-6deg);opacity:.55;}' +
      '60%{transform:translateY(-4px) scale(1.03) rotate(1deg);opacity:1;}' +
      '100%{transform:translateY(0) scale(1) rotate(0deg);opacity:1;}' +
    '}' +
    '@keyframes unoNewCardIn{' +
      '0%{transform:translateY(22px) scale(.88);opacity:0;}' +
      '100%{transform:translateY(0) scale(1);opacity:1;}' +
    '}' +
    '@media(max-width:380px){' +
      '.uno-opponent{font-size:11px;padding:5px 8px;gap:0;}' +
      '.uno-opponent .mini-back{width:8px;height:12px;}' +
      '.uno-discard-card{width:60px;height:88px;--cw:60px;}' +
      '.uno-draw-pile{width:60px;height:88px;--cw:60px;}' +
      '.uno-play-area{gap:14px;}' +
      '.uno-card{width:44px;height:66px;border-radius:8px;--cw:44px;}' +
      '.uno-hand{gap:3px;min-height:72px;}' +
      '.uno-actions .btn{font-size:13px;padding:8px 14px;}' +
    '}' +
    '@media(orientation:landscape) and (max-height:450px){' +
      '.uno-table{flex-direction:row;gap:6px;align-items:flex-start;flex-wrap:wrap;}' +
      '.uno-opponents{flex:0 0 auto;flex-direction:column;max-width:140px;}' +
      '.uno-center{flex:0 0 auto;}' +
      '.uno-discard-card,.uno-draw-pile{width:50px;height:74px;--cw:50px;}' +
      '.uno-card{width:40px;height:60px;border-radius:7px;--cw:40px;}' +
      '.uno-hand{gap:2px;min-height:0;padding:0 2px;}' +
      '.uno-hand-wrap{flex:1;min-width:0;}' +
      '.uno-actions{flex:0 0 auto;flex-direction:column;gap:4px;}' +
      '.uno-actions .btn{font-size:12px;padding:6px 10px;}' +
      '.uno-color-badge{font-size:10px;padding:2px 10px;}' +
      '.uno-play-area{gap:8px;}' +
    '}';

  const last = {
    discardKey: null,
    handSig: null,
    handLen: 0,
    unoResultAt: null,
    raceTick: null,
  };
  var pendingWildCard = null;
  var pendingSevenCard = null;

  window.gameRenderers.set('uno', {

    init: function(container) {
      ensureStyles();

      container.innerHTML = '' +
        '<div class="uno-table">' +
          '<div class="uno-opponents" id="unoOpponents"></div>' +
          '<div class="uno-center">' +
            '<div class="uno-color-badge" id="unoColorBadge">-</div>' +
            '<div class="uno-play-area">' +
              '<div class="uno-discard-card" id="unoDiscardCard"></div>' +
              '<button class="uno-draw-pile" id="unoDrawPile" type="button">' + cardBack() + '</button>' +
            '</div>' +
            '<div class="uno-dir" id="unoDirection"></div>' +
            '<div class="uno-last" id="unoLast"></div>' +
          '</div>' +
          '<div class="uno-hand-wrap"><div class="uno-hand" id="unoHand"></div></div>' +
          '<div class="uno-hint" id="unoHint"></div>' +
          '<div class="uno-actions">' +
            '<button class="btn btn-outline btn-sm" id="drawBtn">' + t('uno_draw') + '</button>' +
            '<button class="btn btn-outline btn-sm" id="endTurnBtn" style="display:none">' + t('uno_end_turn') + '</button>' +
          '</div>' +
        '</div>' +
        '<div class="overlay" id="unoColorPicker" style="display:none">' +
          '<div class="overlay-card">' +
            '<div style="font-size:18px;font-weight:700;margin-bottom:10px">' + t('uno_choose_color') + '</div>' +
            '<div class="uno-color-picker-btns" id="unoColorBtns"></div>' +
            '<button class="btn btn-outline btn-sm" id="unoColorCancel" style="margin-top:14px;width:100%;">' + t('cancel') + '</button>' +
          '</div>' +
        '</div>' +
        '<div class="overlay" id="unoSwapPicker" style="display:none">' +
          '<div class="overlay-card">' +
            '<div style="font-size:18px;font-weight:700;margin-bottom:4px">' + t('uno_swap_title') + '</div>' +
            '<div style="font-size:13px;color:var(--text-muted);margin-bottom:12px">' + t('uno_swap_hint') + '</div>' +
            '<div class="uno-swap-list" id="unoSwapList"></div>' +
            '<button class="btn btn-outline btn-sm uno-swap-skip" id="unoSwapSkip">' + t('uno_swap_skip') + '</button>' +
          '</div>' +
        '</div>' +
        '<div class="overlay uno-race" id="unoRace" style="display:none">' +
          '<div class="uno-race-card">' +
            '<div class="uno-race-title">UNO</div>' +
            '<button class="uno-race-btn" id="unoRaceBtn" type="button">UNO<span>!</span></button>' +
            '<div class="uno-race-hint" id="unoRaceHint"></div>' +
            '<div class="uno-race-time" id="unoRaceTime"></div>' +
          '</div>' +
        '</div>';

      var cbox = document.getElementById('unoColorBtns');
      COLOR_ORDER.forEach(function(col) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'uno-color-picker-btn';
        btn.style.background = COLOR_HEX[col];
        btn.textContent = COLOR_NAMES[col];
        btn.addEventListener('click', function() {
          document.getElementById('unoColorPicker').style.display = 'none';
          if (pendingWildCard) {
            window.makeGameMove({ cardId: pendingWildCard, chosenColor: col });
            pendingWildCard = null;
          }
        });
        cbox.appendChild(btn);
      });

      document.getElementById('unoColorCancel').addEventListener('click', function() {
        pendingWildCard = null;
        document.getElementById('unoColorPicker').style.display = 'none';
      });

      document.getElementById('drawBtn').addEventListener('click', function() {
        window.makeGameMove({});
      });
      document.getElementById('unoDrawPile').addEventListener('click', function() {
        if (this.disabled) return;
        window.makeGameMove({});
      });
      document.getElementById('endTurnBtn').addEventListener('click', function() {
        window.makeGameMove({ endTurn: true });
      });
      document.getElementById('unoSwapSkip').addEventListener('click', function() {
        document.getElementById('unoSwapPicker').style.display = 'none';
        if (pendingSevenCard) {
          window.makeGameMove({ cardId: pendingSevenCard });
          pendingSevenCard = null;
        }
      });
      document.getElementById('unoRaceBtn').addEventListener('click', function() {
        window.makeGameMove({ unoCall: true });
      });
    },

    render: function(state, container, playerIndex, winner) {
      window._unoState = state;
      window._unoSelf = playerIndex;
      var hands = state.hands || [];
      var discard = state.discard || [];
      var deck = state.deck || [];
      var currentPlayer = state.currentPlayer;
      var isMyTurn = currentPlayer === playerIndex && (winner === null || winner === undefined);
      var pendingDraw = state.pendingDraw && state.pendingDraw.player === playerIndex ? state.pendingDraw : null;
      var hand = hands[playerIndex] || [];
      var topCard = discard[0] || null;
      var discardKey = topCard ? topCard.id + ':' + state.currentColor : null;
      var handSig = hand.map(function(c) { return c.id; }).join('|');
      var discardChanged = discardKey && last.discardKey && discardKey !== last.discardKey;
      var drewCard = last.handSig !== null && handSig !== last.handSig && hand.length > last.handLen;

      var legalPlay = hasLegalPlay(hand, topCard, state.currentColor);
      renderOpponents(hands, currentPlayer, playerIndex, state, winner);
      renderColorBadge(state.currentColor);
      renderDiscard(discard, discardChanged);
      renderDrawPile(deck, isMyTurn && !pendingDraw && !winner && !legalPlay);
      renderDirection(state.direction);
      renderLastAction(state);
      renderHand(hand, topCard, state.currentColor, isMyTurn, pendingDraw, drewCard);
      renderButtons(isMyTurn, pendingDraw, hand, state, winner, legalPlay);
      renderRace(state, playerIndex);
      renderUnoResult(state);

      last.discardKey = discardKey;
      last.handSig = handSig;
      last.handLen = hand.length;
    }
  });

  // ---- Render helpers -----------------------------------------------------

  function renderOpponents(hands, currentPlayer, selfIndex, state, winner) {
    var el = document.getElementById('unoOpponents');
    if (!el) return;
    var called = state.unoCalled || [];
    var html = '';
    for (var i = 0; i < hands.length; i++) {
      if (i === selfIndex) continue;
      var count = (hands[i] && hands[i].length) || 0;
      var active = i === currentPlayer && (winner === null || winner === undefined) ? ' active-turn' : '';
      var badge = '';
      if (count === 1) {
        badge = called[i]
          ? ' <span class="uno-opp-badge safe">UNO</span>'
          : ' <span class="uno-opp-badge warn">UNO?</span>';
      }
      var backs = '';
      for (var b = 0; b < Math.min(count, 7); b++) backs += '<div class="mini-back"></div>';
      if (count > 7) backs += '<span style="font-size:10px;color:var(--text-muted);align-self:center;">+' + (count - 7) + '</span>';
      html += '<div class="uno-opponent' + active + '">' +
        '<div class="opp-top"><span>' + playerName(i) + badge + '</span>' +
          '<span class="card-count">×' + count + '</span></div>' +
        '<div class="card-backs">' + backs + '</div>' +
      '</div>';
    }
    el.innerHTML = html;
  }

  function renderColorBadge(color) {
    var el = document.getElementById('unoColorBadge');
    if (!el) return;
    if (color && COLOR_HEX[color]) {
      el.style.background = COLOR_HEX[color];
      el.style.color = COLOR_TEXT[color];
      el.textContent = tf('uno_current', COLOR_NAMES[color] || color);
    } else {
      el.style.background = '#999';
      el.textContent = t('uno_not_started');
    }
  }

  function renderDiscard(discard, changed) {
    var el = document.getElementById('unoDiscardCard');
    if (!el) return;
    if (!discard || !discard.length) { el.innerHTML = ''; return; }
    el.innerHTML = cardFace(discard[0]);
    if (changed) {
      void el.offsetWidth;
      el.classList.add('play-flash');
      clearTimeout(el._animTimer);
      el._animTimer = setTimeout(function() { el.classList.remove('play-flash'); }, 460);
    }
  }

  function renderDrawPile(deck, clickable) {
    var el = document.getElementById('unoDrawPile');
    if (!el) return;
    el.innerHTML = cardBack() +
      '<div class="uno-pile-count">' + ((deck && deck.length) || 0) + ' ' + t('uno_remaining') + '</div>';
    el.disabled = !clickable;
  }

  function renderDirection(direction) {
    var el = document.getElementById('unoDirection');
    if (el) el.textContent = direction === -1 ? '↺' : '↻';
  }

  function esc(text) {
    return String(text === undefined || text === null ? '' : text).replace(/[&<>"']/g, function(ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  // Small "who played what" chip under the piles — keeps the table readable
  // when a bot has just moved and the player looked away.
  function renderLastAction(state) {
    var el = document.getElementById('unoLast');
    if (!el) return;
    var act = state.lastAction;
    if (!act || act.player === undefined || act.player === null) { el.innerHTML = ''; return; }
    var who = '<span class="uno-last-name">' + esc(playerName(act.player)) + '</span>';
    if (act.type === 'play' && act.card) {
      el.innerHTML = who + '<span class="uno-mini">' + cardFace(act.card) + '</span>';
    } else if (act.type === 'draw') {
      el.innerHTML = who + '<span class="uno-mini">' + cardBack() + '</span><span>+1</span>';
    } else {
      el.innerHTML = '';
    }
  }

  function renderHand(hand, topCard, currentColor, isMyTurn, pendingDraw, drewCard) {
    var el = document.getElementById('unoHand');
    if (!el) return;
    var html = '';
    for (var i = 0; i < hand.length; i++) {
      var card = hand[i];
      var allowed = !pendingDraw || pendingDraw.cardId === card.id;
      var playable = isMyTurn && allowed && canPlayCard(card, topCard, currentColor, hand);
      var cls = playable ? ' playable' : ' not-playable';
      var fresh = drewCard && i === hand.length - 1 ? ' new-card' : '';
      var drewThis = pendingDraw && pendingDraw.cardId === card.id ? ' drew-this' : '';
      html += '<div class="uno-card' + cls + fresh + drewThis + '" data-card-id="' + card.id + '">' + cardFace(card) + '</div>';
    }
    el.innerHTML = html;

    var cards = el.children;
    for (var j = 0; j < cards.length; j++) {
      (function(cardEl, card) {
        cardEl.addEventListener('click', function() {
          if (!isMyTurn) { showToast(t('uno_opponent_turn')); return; }
          if (pendingDraw && pendingDraw.cardId !== card.id) {
            showToast(t('uno_play_drawn_only'));
            return;
          }
          if (!canPlayCard(card, topCard, currentColor, hand)) {
            showToast(card.value === '+4' && hand.some(function(c) { return c.color === currentColor; })
              ? t('uno_wild4_rule')
              : t('uno_cannot_play'));
            return;
          }
          if (card.color === 'wild') {
            pendingWildCard = card.id;
            document.getElementById('unoColorPicker').style.display = 'flex';
            return;
          }
          // The final card wins immediately; no swap target needed then.
          if (card.value === '7' && sevenRuleEnabled() && hand.length > 1) {
            openSwapPicker(card);
            return;
          }
          window.makeGameMove({ cardId: card.id });
        });
      })(cards[j], hand[j]);
    }
  }

  function sevenRuleEnabled() {
    var st = window._unoState;
    return !st || !st._options || st._options.unoSeven !== false;
  }

  function openSwapPicker(card) {
    var state = window._unoState;
    if (!state) { window.makeGameMove({ cardId: card.id }); return; }
    pendingSevenCard = card.id;
    var list = document.getElementById('unoSwapList');
    var html = '';
    for (var i = 0; i < (state.hands || []).length; i++) {
      if (i === window._unoSelf) continue;
      var count = (state.hands[i] || []).length;
      html += '<button type="button" class="uno-swap-option" data-target="' + i + '">' +
        '<span>' + playerName(i) + '</span>' +
        '<span class="swap-count">' + count + ' ' + t('uno_cards') + '</span></button>';
    }
    list.innerHTML = html;
    Array.prototype.forEach.call(list.querySelectorAll('.uno-swap-option'), function(btn) {
      btn.addEventListener('click', function() {
        var target = parseInt(this.getAttribute('data-target'), 10);
        document.getElementById('unoSwapPicker').style.display = 'none';
        window.makeGameMove({ cardId: pendingSevenCard, swapTarget: target });
        pendingSevenCard = null;
      });
    });
    document.getElementById('unoSwapPicker').style.display = 'flex';
  }

  function renderButtons(isMyTurn, pendingDraw, hand, state, winner, legalPlay) {
    var drawBtn = document.getElementById('drawBtn');
    var endBtn = document.getElementById('endTurnBtn');
    var hint = document.getElementById('unoHint');
    if (!drawBtn || !endBtn || !hint) return;

    var over = winner !== null && winner !== undefined;
    drawBtn.style.display = isMyTurn ? '' : 'none';
    // You may only draw with no legal card in hand.
    drawBtn.disabled = !!pendingDraw || over || !!legalPlay;
    drawBtn.title = legalPlay ? t('uno_have_playable_hint') : '';
    drawBtn.textContent = t('uno_draw');
    endBtn.style.display = pendingDraw ? '' : 'none';

    if (over) {
      hint.textContent = '';
      hint.className = 'uno-hint';
      return;
    }
    if (pendingDraw) {
      hint.textContent = t('uno_drawn_playable');
      hint.className = 'uno-hint';
      return;
    }
    if (isMyTurn && hand.length === 1 && state.unoWindow && state.unoWindow.target === window._unoSelf) {
      hint.textContent = t('uno_call_now');
      hint.className = 'uno-hint warn';
      return;
    }
    if (isMyTurn && legalPlay) {
      hint.textContent = t('uno_have_playable_hint');
      hint.className = 'uno-hint';
      return;
    }
    hint.textContent = '';
    hint.className = 'uno-hint';
  }

  function renderRace(state, playerIndex) {
    var overlay = document.getElementById('unoRace');
    if (!overlay) return;
    var win = state.unoWindow;
    if (!win || (state.winner !== null && state.winner !== undefined)) {
      overlay.style.display = 'none';
      clearInterval(last.raceTick);
      last.raceTick = null;
      return;
    }
    var hint = document.getElementById('unoRaceHint');
    var time = document.getElementById('unoRaceTime');
    var targetName = playerName(win.target);
    hint.textContent = tf('uno_call_race_hint', targetName);
    overlay.style.display = 'flex';

    function tick() {
      var left = Math.max(0, Math.ceil((win.until - Date.now()) / 1000));
      if (time) time.textContent = left + 's';
      if (left <= 0) {
        clearInterval(last.raceTick);
        last.raceTick = null;
      }
    }
    clearInterval(last.raceTick);
    tick();
    last.raceTick = setInterval(tick, 200);
  }

  function renderUnoResult(state) {
    var res = state.unoResult;
    if (!res || res.at === last.unoResultAt) return;
    last.unoResultAt = res.at;
    var target = playerName(res.target);
    if (res.safe) {
      showToast(tf('uno_call_safe', target));
    } else if (res.reason === 'caught' && res.caller !== null && res.caller !== undefined) {
      showToast(tf('uno_call_caught', playerName(res.caller), target));
    } else {
      showToast(tf('uno_call_timeout', target));
    }
  }

  function hasLegalPlay(hand, topCard, currentColor) {
    return (hand || []).some(function(card) { return canPlayCard(card, topCard, currentColor, hand); });
  }

  function canPlayCard(card, topCard, currentColor, hand) {
    if (!card) return false;
    if (card.color === 'wild') {
      if (card.value === '+4' && Array.isArray(hand)) {
        return !hand.some(function(c) { return c.id !== card.id && c.color === currentColor; });
      }
      return true;
    }
    if (!topCard) return true;
    if (card.value === topCard.value) return true;
    return card.color === currentColor;
  }

  function showToast(msg) {
    if (typeof window.showToast === 'function') { window.showToast(msg); return; }
    var t = document.getElementById('toast');
    if (!t) {
      t = document.createElement('div');
      t.className = 'toast';
      t.id = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(function() { t.classList.remove('show'); }, 1800);
  }
})();
