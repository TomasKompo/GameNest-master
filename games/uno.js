// games/uno.js
// UNO — 2-6 players. Official matching rules plus two configurable house rules:
//   * zero rule — playing a 0 passes every hand to the next player
//   * seven rule — playing a 7 swaps hands with any chosen opponent
// +2/+4 never stack and +4 is never challenged: the next player simply draws.

const COLORS = ['red', 'blue', 'green', 'yellow'];

exports.name = 'uno';
exports.maxPlayers = 6;
exports.minPlayers = 2;

const DEFAULT_CALL_SECONDS = 8;

function createDeck() {
  const deck = [];
  for (const c of COLORS) {
    deck.push({ color: c, value: '0', id: c + '-0' });
    for (let i = 1; i <= 9; i++) {
      deck.push({ color: c, value: String(i), id: c + '-' + i + '-a' });
      deck.push({ color: c, value: String(i), id: c + '-' + i + '-b' });
    }
    deck.push({ color: c, value: 'skip', id: c + '-skip-a' });
    deck.push({ color: c, value: 'skip', id: c + '-skip-b' });
    deck.push({ color: c, value: 'reverse', id: c + '-reverse-a' });
    deck.push({ color: c, value: 'reverse', id: c + '-reverse-b' });
    deck.push({ color: c, value: '+2', id: c + '-+2-a' });
    deck.push({ color: c, value: '+2', id: c + '-+2-b' });
  }
  for (let i = 0; i < 4; i++) {
    deck.push({ color: 'wild', value: 'wild', id: 'wild-' + i });
    deck.push({ color: 'wild', value: '+4', id: '+4-' + i });
  }
  return deck;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function optionsOf(state) {
  const o = (state && state._options) || {};
  return {
    zeroRule: o.unoZero !== false,
    sevenRule: o.unoSeven !== false,
    callSeconds: typeof o.unoCallSeconds === 'number' ? o.unoCallSeconds : DEFAULT_CALL_SECONDS,
  };
}

exports.createState = () => ({
  deck: [],
  discard: [],
  hands: [],
  currentColor: null,
  currentPlayer: 0,
  direction: 1,
  winner: null,
  // Per-player: true once that player has safely called UNO for a one-card hand.
  unoCalled: [],
  // Open race: everybody sees a big UNO button until somebody clicks it.
  // { target, until } — target is the player holding one card.
  unoWindow: null,
  // Result of the last race, for the toast: { target, caller, safe, reason, at }.
  unoResult: null,
  // Set when the current player drew a playable card and may play it now.
  pendingDraw: null,
  lastAction: null,
});

function initGame(state, playerCount) {
  const deck = createDeck();
  shuffle(deck);
  state.hands = [];
  for (let i = 0; i < playerCount; i++) {
    state.hands[i] = deck.splice(0, 7);
  }
  // The first discard must be a plain number card, otherwise its effect would
  // fire before anybody has had a turn.
  let firstIdx = deck.findIndex((c) => c.color !== 'wild' && /^[0-9]$/.test(c.value));
  if (firstIdx === -1) firstIdx = 0;
  state.discard = [deck.splice(firstIdx, 1)[0]];
  state.deck = deck;
  state.currentColor = state.discard[0].color;
  state.currentPlayer = 0;
  state.direction = 1;
  state.winner = null;
  state.unoCalled = Array(playerCount).fill(true);
  state.unoWindow = null;
  state.unoResult = null;
  state.pendingDraw = null;
  state.lastAction = null;
}
exports.initGame = initGame;

function nextIndex(state, from) {
  const n = state.hands.length;
  const base = from === undefined ? state.currentPlayer : from;
  return ((base + state.direction) % n + n) % n;
}

function advance(state, steps) {
  const n = state.hands.length;
  const count = steps === undefined ? 1 : steps;
  for (let i = 0; i < count; i++) {
    state.currentPlayer = ((state.currentPlayer + state.direction) % n + n) % n;
  }
}

function canPlay(card, state) {
  if (!card) return false;
  if (card.color === 'wild') return true;
  if (card.color === state.currentColor) return true;
  const top = state.discard[0];
  return !!top && card.value === top.value;
}

function handHasColor(hand, color) {
  return (hand || []).some((c) => c.color === color);
}

// A playable card that also respects the official +4 restriction.
function isLegalPlay(card, state, hand) {
  if (!canPlay(card, state)) return false;
  if (card.value === '+4' && handHasColor(hand, state.currentColor)) return false;
  return true;
}

function drawCards(hand, count, state) {
  let drawn = 0;
  for (let i = 0; i < count; i++) {
    if (!state.deck.length) {
      if (state.discard.length <= 1) break;
      // Keep the face-up top card, reshuffle everything underneath it.
      const top = state.discard.shift();
      state.deck = state.discard;
      shuffle(state.deck);
      state.discard = [top];
    }
    if (!state.deck.length) break;
    hand.push(state.deck.pop());
    drawn++;
  }
  return drawn;
}

function rotateHands(state) {
  const n = state.hands.length;
  const dir = state.direction;
  const next = new Array(n);
  for (let i = 0; i < n; i++) {
    const from = ((i - dir) % n + n) % n;
    next[i] = state.hands[from];
  }
  state.hands = next;
}

function swapHands(state, a, b) {
  const tmp = state.hands[a];
  state.hands[a] = state.hands[b];
  state.hands[b] = tmp;
}

function closeUnoWindow(state, result) {
  const target = state.unoWindow ? state.unoWindow.target : null;
  state.unoWindow = null;
  state.unoResult = Object.assign({ target: target, at: Date.now() }, result || {});
}

// Opens the race for the first player holding exactly one card. `preferred`
// goes first so the player who just played is the one asked to shout. `only`
// restricts the candidates to the seats whose hands actually changed.
function openUnoWindow(state, preferred, only) {
  const n = state.hands.length;
  const order = [];
  if (preferred !== undefined && preferred !== null) order.push(preferred);
  if (only) {
    for (const i of only) if (order.indexOf(i) === -1) order.push(i);
  } else {
    for (let i = 0; i < n; i++) if (order.indexOf(i) === -1) order.push(i);
  }
  for (const i of order) {
    if ((state.hands[i] || []).length === 1) {
      state.unoCalled[i] = false;
      state.unoWindow = {
        target: i,
        until: Date.now() + optionsOf(state).callSeconds * 1000,
      };
      return true;
    }
  }
  return false;
}

// After one race resolves, another player may still be sitting on one card
// (possible after a 0 or 7 swap). Give them their own shout window.
function openNextUnoRace(state) {
  if (state.winner !== null && state.winner !== undefined) return false;
  for (let i = 0; i < state.hands.length; i++) {
    if ((state.hands[i] || []).length === 1 && !state.unoCalled[i]) {
      state.unoWindow = {
        target: i,
        until: Date.now() + optionsOf(state).callSeconds * 1000,
      };
      return true;
    }
  }
  return false;
}

// Called by the room timer when nobody clicked the UNO button in time.
exports.resolveUnoTimeout = function(state) {
  const win = state.unoWindow;
  if (!win) return false;
  if (Date.now() < win.until) return false;
  drawCards(state.hands[win.target], 2, state);
  state.unoCalled[win.target] = false;
  closeUnoWindow(state, { caller: null, safe: false, reason: 'timeout' });
  openNextUnoRace(state);
  return true;
};

exports.handleMove = (data, state, playerIndex) => {
  if (state.winner !== null && state.winner !== undefined) return 'g_game_over';

  // A room can reach a move before initGame ran (solo/AI start paths).
  if (!state.hands.length) {
    initGame(state, state._playerCount || 2);
  }

  const move = data || {};

  // ---- UNO race -----------------------------------------------------------
  // Any seat may click. First click wins: the target is safe if they were
  // first, otherwise they take the two-card penalty.
  if (move.unoCall) {
    const win = state.unoWindow;
    if (!win) return null; // late click after the race resolved
    if (Date.now() > win.until) {
      exports.resolveUnoTimeout(state);
      return null;
    }
    if (playerIndex === win.target) {
      state.unoCalled[win.target] = true;
      closeUnoWindow(state, { caller: playerIndex, safe: true, reason: 'self' });
    } else {
      drawCards(state.hands[win.target], 2, state);
      state.unoCalled[win.target] = false;
      closeUnoWindow(state, { caller: playerIndex, safe: false, reason: 'caught' });
    }
    openNextUnoRace(state);
    return null;
  }

  // Any other move while the race is open means the next player already began
  // their turn — the chance to call UNO has passed.
  if (state.unoWindow) {
    const target = state.unoWindow.target;
    drawCards(state.hands[target], 2, state);
    state.unoCalled[target] = false;
    closeUnoWindow(state, { caller: null, safe: false, reason: 'passed' });
  }

  if (playerIndex !== state.currentPlayer) return 'g_not_your_turn';
  const hand = state.hands[playerIndex];
  if (!hand) return 'g_not_your_turn';

  // ---- End the turn after drawing a playable card -------------------------
  if (move.endTurn) {
    if (!state.pendingDraw || state.pendingDraw.player !== playerIndex) return 'uno_nothing_to_end';
    state.pendingDraw = null;
    advance(state, 1);
    return null;
  }

  // ---- Draw ---------------------------------------------------------------
  if (!move.cardId) {
    if (state.pendingDraw && state.pendingDraw.player === playerIndex) return 'uno_must_play_or_end';
    // You only draw when you truly cannot play anything.
    if (hand.some((c) => isLegalPlay(c, state, hand))) return 'uno_have_playable_card';
    const before = hand.length;
    drawCards(hand, 1, state);
    if (hand.length === before) {
      // Nothing left to draw anywhere: the turn just ends.
      advance(state, 1);
      return null;
    }
    const drawn = hand[hand.length - 1];
    state.lastAction = { type: 'draw', player: playerIndex };
    if (canPlay(drawn, state)) {
      // Official rule: you may play the card you just drew, or keep it.
      state.pendingDraw = { player: playerIndex, cardId: drawn.id };
      return null;
    }
    state.pendingDraw = null;
    advance(state, 1);
    return null;
  }

  // ---- Play a card --------------------------------------------------------
  const cardIdx = hand.findIndex((c) => c.id === move.cardId);
  if (cardIdx === -1) return 'uno_card_not_in_hand';
  const card = hand[cardIdx];

  if (state.pendingDraw && state.pendingDraw.player === playerIndex &&
      state.pendingDraw.cardId !== card.id) {
    return 'uno_play_drawn_only';
  }
  if (!canPlay(card, state)) return 'uno_cannot_play_card';
  // Official +4 rule: it may only be played with no card of the current color.
  if (card.value === '+4' && handHasColor(hand, state.currentColor)) {
    return 'uno_wild4_not_allowed';
  }
  if (card.color === 'wild' && COLORS.indexOf(move.chosenColor) === -1) {
    return 'uno_choose_color_required';
  }

  const opts = optionsOf(state);

  // Rule 7: validate the chosen swap partner before touching the hand.
  let swapTarget = null;
  if (card.value === '7' && opts.sevenRule && move.swapTarget !== undefined && move.swapTarget !== null) {
    const tgt = Number(move.swapTarget);
    if (!Number.isInteger(tgt) || tgt < 0 || tgt >= state.hands.length || tgt === playerIndex) {
      return 'uno_bad_swap_target';
    }
    swapTarget = tgt;
  }

  hand.splice(cardIdx, 1);
  state.pendingDraw = null;
  state.discard.unshift(card);
  state.currentColor = card.color === 'wild' ? move.chosenColor : card.color;

  const n = state.hands.length;
  const emptiedHand = hand.length === 0;
  let handsSwapped = false;
  let unoCandidates = null; // null = every seat (a 0 rotates all hands)

  switch (card.value) {
    case 'skip':
      advance(state, 2);
      break;
    case 'reverse':
      if (n === 2) {
        advance(state, 2); // two players: reverse works like skip
      } else {
        state.direction *= -1;
        advance(state, 1);
      }
      break;
    case '+2': {
      const victim = nextIndex(state);
      drawCards(state.hands[victim], 2, state);
      advance(state, 2);
      break;
    }
    case '+4': {
      const victim = nextIndex(state);
      drawCards(state.hands[victim], 4, state);
      advance(state, 2);
      break;
    }
    case '0':
      // The winning card ends the round: a hand swap after it would be
      // pointless (and would show the winner holding someone else's cards).
      if (opts.zeroRule && !emptiedHand) {
        rotateHands(state);
        handsSwapped = true;
        unoCandidates = null;
      }
      advance(state, 1);
      break;
    case '7':
      if (opts.sevenRule && swapTarget !== null && !emptiedHand) {
        swapHands(state, playerIndex, swapTarget);
        handsSwapped = true;
        unoCandidates = [playerIndex, swapTarget];
      }
      advance(state, 1);
      break;
    default:
      advance(state, 1);
      break;
  }

  state.lastAction = {
    type: 'play',
    player: playerIndex,
    card: { color: card.color, value: card.value },
    target: swapTarget,
  };

  // The card that emptied the hand wins even when its effect also fires.
  if (emptiedHand) {
    state.winner = playerIndex;
    state.pendingDraw = null;
    return null;
  }

  // Fresh one-card hands created by a 0/7 swap have not been announced yet.
  if (handsSwapped) {
    const seats = unoCandidates || Array.from({ length: n }, (_, i) => i);
    for (const i of seats) {
      if ((state.hands[i] || []).length === 1) state.unoCalled[i] = false;
    }
    openUnoWindow(state, playerIndex, unoCandidates || undefined);
  } else if (state.hands[playerIndex].length === 1) {
    openUnoWindow(state, playerIndex, [playerIndex]);
  }

  return null;
};

// ---- live terminal log -----------------------------------------------------
// Called by server.js after every accepted move. Returns a short Czech line
// ("zahraje červená 7 · další bere 2") that lands in the server terminal.
const COLOR_LABELS = { red: 'červená', blue: 'modrá', green: 'zelená', yellow: 'žlutá' };

function cardLabel(card) {
  if (!card) return '? karta';
  if (card.color === 'wild') return card.value === '+4' ? 'divoká +4' : 'divoká';
  const color = COLOR_LABELS[card.color] || card.color;
  const value = card.value === 'skip' ? 'stop' : card.value === 'reverse' ? 'otočení' : card.value;
  return color + ' ' + value;
}

exports.logMove = function (state, move, playerIndex, ctx) {
  const nameOf = (i) => (ctx && typeof ctx.name === 'function') ? ctx.name(i) : ('Hráč ' + (i + 1));
  const hand = (state.hands && state.hands[playerIndex]) || [];

  if (move && move.unoCall) {
    const res = state.unoResult;
    if (!res || !res.at) return 'klikne UNO (už rozhodnuto)';
    if (res.safe) return 'zakřičí UNO včas · ' + hand.length + ' v ruce';
    if (res.reason === 'caught') {
      return 'zakřičí UNO dřív než ' + nameOf(res.target) + ' → ' + nameOf(res.target) + ' bere 2';
    }
    return 'klikne UNO, ale pozdě';
  }

  if (move && move.endTurn) return 'nechá si líznutou kartu · ' + hand.length + ' v ruce';

  const act = state.lastAction;
  if (act && act.type === 'draw' && act.player === playerIndex) {
    const pending = state.pendingDraw && state.pendingDraw.player === playerIndex;
    return 'líže 1 kartu' + (pending ? ' (hratelná)' : '') + ' · ' + hand.length + ' v ruce';
  }

  if (act && act.type === 'play' && act.player === playerIndex) {
    const card = act.card || {};
    let text = 'zahraje ' + cardLabel(card);
    if (card.color === 'wild') text += ' → ' + (COLOR_LABELS[state.currentColor] || state.currentColor);
    switch (card.value) {
      case 'skip': text += ' · další stojí'; break;
      case 'reverse': text += state.hands.length === 2 ? ' · ve dvou jako stop' : ' · směr se otočil'; break;
      case '+2': text += ' · další bere 2'; break;
      case '+4': text += ' · další bere 4'; break;
      case '0': if (optionsOf(state).zeroRule) text += ' · nula, výměna všech rukou'; break;
      case '7': if (act.target !== null && act.target !== undefined) text += ' · výměna rukou s ' + nameOf(act.target); break;
      default: break;
    }
    if (state.winner === playerIndex) return text + ' · poslední karta, výhra';
    return text + ' · ' + hand.length + ' v ruce';
  }
  return null;
};

// Hide other players' cards, the draw pile order, and the card a different
// player just drew.
const { maskView } = require('./lib/hidden');
exports.playerView = function(state, playerIndex) {
  const view = maskView(state, playerIndex, { piles: ['deck'] });
  if (view === state) return state; // finished game: everything is public
  if (view.pendingDraw && view.pendingDraw.player !== playerIndex) view.pendingDraw = null;
  return view;
};
