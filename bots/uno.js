const { botName } = require('./lib/bot-name');

exports.name = 'uno';

exports.createBot = (playerIndex) => ({
  name: botName(playerIndex, 'zh'),
  getMove(state) {
    const hand = state.hands && state.hands[playerIndex];
    if (!hand || hand.length === 0) return {};

    // The UNO race is open: a bot that holds the last card shouts immediately.
    if (state.unoWindow && state.unoWindow.target === playerIndex) return { unoCall: true };

    // After drawing a playable card the turn stays open: play it if we can,
    // otherwise end the turn.
    if (state.pendingDraw && state.pendingDraw.player === playerIndex) {
      const drawn = hand.find((card) => card.id === state.pendingDraw.cardId);
      if (drawn && canPlay(drawn, state)) {
        return {
          cardId: drawn.id,
          chosenColor: drawn.color === 'wild' ? chooseColorAfterPlay(hand, drawn) : undefined,
          swapTarget: drawn.value === '7' ? chooseSwapTarget(state, hand) : undefined,
        };
      }
      return { endTurn: true };
    }

    if (hand.length === 1 && (!state.unoCalled || !state.unoCalled[playerIndex])) {
      return { unoCall: true };
    }

    const playable = hand.filter((card) => canPlay(card, state));
    if (playable.length === 0) return {};

    const nextIndex = getNextPlayerIndex(state);
    const nextHand = (state.hands && state.hands[nextIndex]) || [];
    const top = state.discard && state.discard[0];

    let bestCard = playable[0];
    let bestScore = -Infinity;
    for (const card of playable) {
      const score = scoreCard(card, hand, top, nextHand.length, state);
      if (score > bestScore) {
        bestScore = score;
        bestCard = card;
      }
    }

    return {
      cardId: bestCard.id,
      chosenColor: bestCard.color === 'wild' ? chooseColorAfterPlay(hand, bestCard) : undefined,
      swapTarget: bestCard.value === '7' ? chooseSwapTarget(state, bestCard) : undefined,
    };
  },
});

function canPlay(card, state) {
  const top = state.discard && state.discard[0];
  if (!card) return false;
  if (card.color === 'wild') {
    // A +4 is only legal with no card of the current color in hand.
    if (card.value === '+4') return !(state.hands[state.currentPlayer] || []).some(
      (c) => c.color === state.currentColor
    );
    return true;
  }
  if (!top) return true;
  return card.value === top.value || card.color === state.currentColor;
}

function getNextPlayerIndex(state) {
  const hands = state.hands || [];
  if (!hands.length) return 0;
  const direction = state.direction || 1;
  return ((state.currentPlayer + direction) % hands.length + hands.length) % hands.length;
}

function chooseSwapTarget(state, selfCard) {
  // Rule 7: take the smallest hand at the table so ours shrinks the most.
  const hands = state.hands || [];
  let best = -1;
  let bestLen = Infinity;
  for (let i = 0; i < hands.length; i++) {
    if (i === state.currentPlayer) continue;
    const len = (hands[i] || []).length;
    if (len > 0 && len < bestLen) {
      bestLen = len;
      best = i;
    }
  }
  return best === -1 ? undefined : best;
}

function chooseColorAfterPlay(hand, playedCard) {
  const counts = countColors(hand, playedCard);
  let bestColor = 'red';
  let bestCount = -1;
  for (const color of ['red', 'blue', 'green', 'yellow']) {
    if ((counts[color] || 0) > bestCount) {
      bestCount = counts[color] || 0;
      bestColor = color;
    }
  }
  return bestColor;
}

function countColors(hand, excludeCard) {
  const counts = { red: 0, blue: 0, green: 0, yellow: 0 };
  for (const card of hand) {
    if (excludeCard && card.id === excludeCard.id) continue;
    if (counts[card.color] !== undefined) counts[card.color] += 1;
  }
  return counts;
}

function scoreCard(card, hand, top, nextHandSize, state) {
  const remainingColors = countColors(hand, card);
  const dominantColorCount = card.color === 'wild'
    ? Math.max(remainingColors.red, remainingColors.blue, remainingColors.green, remainingColors.yellow)
    : (remainingColors[card.color] || 0);

  let score = 0;

  if (hand.length === 1) score += 1000;
  if (hand.length === 2) score += 160;

  score += dominantColorCount * 18;

  if (card.color !== 'wild' && top && card.value === top.value) score += 8;
  if (card.color !== 'wild' && top && card.color === top.color) score += 10;

  if (card.value === 'skip' || card.value === 'reverse') score += 18;
  if (card.value === '+2') score += 24;
  if (card.value === '+4') score += 10;
  // Playing a 0 rotates every hand; a 7 can dump a big hand on someone else.
  if (card.value === '0' && state._options && state._options.unoZero !== false) score += 6;
  if (card.value === '7' && state._options && state._options.unoSeven !== false) {
    score += hand.length >= 3 ? 22 : 4;
  }

  if (nextHandSize <= 2) {
    if (card.value === 'skip' || card.value === 'reverse') score += 55;
    if (card.value === '+2') score += 50;
    if (card.value === '+4') score += 35;
  }

  if (card.color === 'wild') score -= 36;

  return score;
}
