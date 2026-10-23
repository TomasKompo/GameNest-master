const test = require('node:test');
const assert = require('node:assert/strict');

const uno = require('../games/uno');
const unoBot = require('../bots/uno');

function card(color, value, id) {
  return { color, value, id: id || (color + '-' + value) };
}

function setup(hands, opts) {
  const s = uno.createState();
  s._options = opts || {};
  s.hands = hands;
  s.deck = [];
  s.discard = [card('red', '5', 'top-red-5')];
  s.currentColor = 'red';
  s.currentPlayer = 0;
  s.direction = 1;
  s.winner = null;
  s.unoCalled = hands.map(() => true);
  s.unoWindow = null;
  s.unoResult = null;
  s.pendingDraw = null;
  return s;
}

test('uno: +2 makes the next player draw two and skips them (no stacking)', () => {
  const s = setup([
    [card('red', '+2', 'red-plus2'), card('green', '1', 'green-1')],
    [card('blue', '1', 'blue-1')],
    [card('yellow', '1', 'yellow-1')],
  ]);
  s.deck = [card('green', '2', 'g2'), card('green', '3', 'g3')];

  assert.equal(uno.handleMove({ cardId: 'red-plus2' }, s, 0), null);
  assert.equal(s.hands[1].length, 3, 'victim draws exactly two cards');
  assert.equal(s.currentPlayer, 2, 'victim is skipped');
  assert.equal(s.drawStack, undefined, 'no stacking counter exists');
});

test('uno: +4 is illegal while holding the current color and skips the victim', () => {
  const illegal = setup([
    [card('red', '7', 'red-7'), card('wild', '+4', '+4-0')],
    [card('blue', '2', 'blue-2')],
  ]);
  assert.equal(uno.handleMove({ cardId: '+4-0', chosenColor: 'blue' }, illegal, 0), 'uno_wild4_not_allowed');

  const s = setup([
    [card('green', '7', 'green-7'), card('wild', '+4', '+4-1')],
    [card('blue', '2', 'blue-2')],
    [card('yellow', '2', 'yellow-2')],
  ]);
  s.deck = [card('red', '1', 'r1'), card('red', '2', 'r2'), card('red', '3', 'r3'), card('red', '4', 'r4')];
  assert.equal(uno.handleMove({ cardId: '+4-1', chosenColor: 'blue' }, s, 0), null);
  assert.equal(s.hands[1].length, 5, '+4 draws four');
  assert.equal(s.currentColor, 'blue');
  assert.equal(s.currentPlayer, 2, 'victim is skipped');
});

test('uno: drawing is refused while a legal card is in hand', () => {
  const s = setup([
    [card('red', '7', 'red-7')],
    [card('blue', '3', 'blue-3')],
  ]);
  assert.equal(uno.handleMove({}, s, 0), 'uno_have_playable_card');
  assert.equal(s.currentPlayer, 0);
});

test('uno: a drawn playable card may be played immediately or kept', () => {
  const s = setup([
    [card('green', '7', 'green-7')],
    [card('blue', '3', 'blue-3')],
  ]);
  s.deck = [card('red', '9', 'red-9')];

  assert.equal(uno.handleMove({}, s, 0), null);
  assert.equal(s.currentPlayer, 0, 'turn stays open after a playable draw');
  assert.deepEqual(s.pendingDraw, { player: 0, cardId: 'red-9' });

  assert.equal(uno.handleMove({ cardId: 'green-7' }, s, 0), 'uno_play_drawn_only');
  assert.equal(uno.handleMove({ cardId: 'red-9' }, s, 0), null);
  assert.equal(s.currentPlayer, 1);
});

test('uno: the +4 restriction also applies when deciding whether one may draw', () => {
  const s = setup([
    [card('red', '7', 'red-7'), card('wild', '+4', '+4-3')],
    [card('blue', '3', 'blue-3')],
  ]);
  // The red 7 is legal, so drawing is refused even though +4 is not legal here.
  assert.equal(uno.handleMove({}, s, 0), 'uno_have_playable_card');

  const onlyWild = setup([
    [card('wild', '+4', '+4-4')],
    [card('blue', '3', 'blue-3')],
  ]);
  // A lone +4 is legal, so drawing is still refused.
  assert.equal(uno.handleMove({}, onlyWild, 0), 'uno_have_playable_card');
});

test('uno: after a playable draw the player may end the turn instead', () => {
  const s = setup([
    [card('green', '7', 'green-7')],
    [card('blue', '3', 'blue-3')],
  ]);
  s.deck = [card('red', '9', 'red-9')];
  assert.equal(uno.handleMove({}, s, 0), null);
  assert.equal(uno.handleMove({ endTurn: true }, s, 0), null);
  assert.equal(s.currentPlayer, 1);
  assert.equal(s.pendingDraw, null);
});

test('uno: playing a 0 passes every hand on in the current direction', () => {
  const s = setup([
    [card('red', '0', 'red-0'), card('blue', '1', 'blue-1')],
    [card('green', '1', 'green-1'), card('green', '2', 'green-2')],
    [card('yellow', '3', 'yellow-3')],
  ]);

  assert.equal(uno.handleMove({ cardId: 'red-0' }, s, 0), null);
  assert.deepEqual(s.hands[1].map((c) => c.id), ['blue-1'], 'seat 1 got seat 0\'s remaining hand');
  assert.deepEqual(s.hands[2].map((c) => c.id), ['green-1', 'green-2'], 'seat 2 got seat 1\'s hand');
  assert.deepEqual(s.hands[0].map((c) => c.id), ['yellow-3'], 'seat 0 got seat 2\'s hand');
  assert.equal(s.currentPlayer, 1);
});

test('uno: a 7 swaps the whole hand with the chosen player', () => {
  const s = setup([
    [card('red', '7', 'red-7'), card('blue', '1', 'blue-1')],
    [card('green', '1', 'green-1'), card('green', '2', 'green-2'), card('green', '3', 'green-3')],
    [card('yellow', '3', 'yellow-3')],
  ], { unoSeven: true });

  assert.equal(uno.handleMove({ cardId: 'red-7', swapTarget: 1 }, s, 0), null);
  assert.equal(s.hands[0].length, 3, 'player 0 took the bigger hand');
  assert.deepEqual(s.hands[1].map((c) => c.id), ['blue-1']);
  // Seat 1 now holds one card, so the UNO race opens for them.
  assert.equal(s.unoWindow && s.unoWindow.target, 1);
  assert.equal(s.unoCalled[1], false);
  assert.equal(s.currentPlayer, 1);
});

test('uno: the 7 swap can be skipped and rejects an invalid target', () => {
  const hands = () => [
    [card('red', '7', 'red-7'), card('blue', '1', 'blue-1')],
    [card('green', '1', 'green-1'), card('green', '2', 'green-2')],
  ];
  const bad = setup(hands(), { unoSeven: true });
  assert.equal(uno.handleMove({ cardId: 'red-7', swapTarget: 0 }, bad, 0), 'uno_bad_swap_target');

  const skipped = setup(hands(), { unoSeven: true });
  assert.equal(uno.handleMove({ cardId: 'red-7' }, skipped, 0), null);
  assert.equal(skipped.hands[0].length, 1);
  assert.equal(skipped.hands[1].length, 2);
});

test('uno: with the seven rule off the swap target is ignored', () => {
  const s = setup([
    [card('red', '7', 'red-7'), card('blue', '1', 'blue-1')],
    [card('green', '1', 'green-1'), card('green', '2', 'green-2')],
  ], { unoSeven: false });

  assert.equal(uno.handleMove({ cardId: 'red-7', swapTarget: 1 }, s, 0), null);
  assert.equal(s.hands[0].length, 1);
  assert.equal(s.hands[1].length, 2);
});

test('uno: the target wins the shout race by clicking first', () => {
  const s = setup([
    [card('red', '9', 'red-9'), card('blue', '1', 'blue-1')],
    [card('green', '1', 'green-1')],
  ]);
  assert.equal(uno.handleMove({ cardId: 'red-9' }, s, 0), null);
  assert.equal(s.unoWindow.target, 0);

  assert.equal(uno.handleMove({ unoCall: true }, s, 0), null);
  assert.equal(s.unoWindow, null);
  assert.equal(s.unoResult.safe, true);
  assert.equal(s.hands[0].length, 1, 'no penalty for a timely call');
});

test('uno: an opponent who shouts first gives the target two penalty cards', () => {
  const s = setup([
    [card('red', '9', 'red-9'), card('blue', '1', 'blue-1')],
    [card('green', '1', 'green-1')],
  ]);
  s.deck = [card('yellow', '1', 'y1'), card('yellow', '2', 'y2')];
  assert.equal(uno.handleMove({ cardId: 'red-9' }, s, 0), null);

  assert.equal(uno.handleMove({ unoCall: true }, s, 1), null);
  assert.equal(s.unoWindow, null);
  assert.equal(s.unoResult.safe, false);
  assert.equal(s.unoResult.reason, 'caught');
  assert.equal(s.hands[0].length, 3, 'target draws two');
});

test('uno: forgetting to shout until the timer runs out also costs two cards', () => {
  const s = setup([
    [card('red', '9', 'red-9'), card('blue', '1', 'blue-1')],
    [card('green', '1', 'green-1')],
  ]);
  s.deck = [card('yellow', '1', 'y1'), card('yellow', '2', 'y2')];
  assert.equal(uno.handleMove({ cardId: 'red-9' }, s, 0), null);
  s.unoWindow.until = Date.now() - 1;

  assert.equal(uno.resolveUnoTimeout(s), true);
  assert.equal(s.unoWindow, null);
  assert.equal(s.unoResult.reason, 'timeout');
  assert.equal(s.hands[0].length, 3);
});

test('uno: a winning +4 still makes the next player draw four', () => {
  const s = setup([
    [card('wild', '+4', '+4-9')],
    [card('blue', '2', 'blue-2')],
  ]);
  s.deck = [card('red', '1', 'r1'), card('red', '2', 'r2'), card('red', '3', 'r3'), card('red', '4', 'r4')];

  assert.equal(uno.handleMove({ cardId: '+4-9', chosenColor: 'blue' }, s, 0), null);
  assert.equal(s.winner, 0);
  assert.equal(s.hands[1].length, 5);
});

test('uno: a winning 0 ends the round without rotating the hands', () => {
  const s = setup([
    [card('red', '0', 'red-0')],
    [card('blue', '3', 'blue-3'), card('blue', '4', 'blue-4')],
  ]);
  assert.equal(uno.handleMove({ cardId: 'red-0' }, s, 0), null);
  assert.equal(s.winner, 0);
  assert.equal(s.hands[0].length, 0, 'the winner keeps an empty hand');
  assert.equal(s.hands[1].length, 2, 'the other hand is not passed around after the win');
});

test('uno: a winning 7 ends the round without swapping hands', () => {
  const s = setup([
    [card('red', '7', 'red-7')],
    [card('blue', '3', 'blue-3'), card('blue', '4', 'blue-4')],
  ]);
  assert.equal(uno.handleMove({ cardId: 'red-7', swapTarget: 1 }, s, 0), null);
  assert.equal(s.winner, 0);
  assert.equal(s.hands[0].length, 0);
  assert.equal(s.hands[1].length, 2);
});

test('uno: bots can finish games with the new rules and shout race', () => {
  for (const n of [2, 3, 4]) {
    for (let gameNo = 0; gameNo < 4; gameNo++) {
      const s = uno.createState();
      s._playerCount = n;
      s._options = {};
      uno.initGame(s, n);
      const bots = Array.from({ length: n }, (_, i) => unoBot.createBot(i));
      for (let step = 0; s.winner === null && step < 3000; step++) {
        const move = bots[s.currentPlayer].getMove(s);
        const err = uno.handleMove(move, s, s.currentPlayer);
        assert.equal(err, null, 'bot move rejected: ' + JSON.stringify(move) + ' -> ' + err);
      }
      assert.notEqual(s.winner, null, 'game should finish for ' + n + ' players');
    }
  }
});

test('uno: draw pile reshuffles the discard pile except its top card', () => {
  const s = setup([
    [card('green', '7', 'green-7')],
    [card('blue', '3', 'blue-3')],
  ]);
  s.deck = [];
  s.discard = [card('red', '5', 'top-red-5'), card('blue', '8', 'old-1'), card('yellow', '8', 'old-2')];

  assert.equal(uno.handleMove({}, s, 0), null);
  assert.equal(s.deck.length + s.hands[0].length, 3, 'reshuffled cards are still in play');
  assert.equal(s.discard[0].id, 'top-red-5', 'top card stays on the discard pile');
});
