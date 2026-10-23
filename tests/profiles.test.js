// Protocol-level checks for the per-IP profiles.
//
// The rule the app promises: while the server runs, an IP address keeps its
// "account" (nickname, avatar, colour, preferences, stats) even after it
// disconnects and comes back — and everything resets on server restart.
const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const WebSocket = require('ws');

const PORT = 3191;
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

/** WebSocket client that records every message it receives. */
function connect() {
  const ws = new WebSocket(`ws://127.0.0.1:${PORT}`);
  ws.messages = [];
  ws.scanFrom = 0; // waitFor walks forward, so repeated waits see fresh messages
  ws.on('message', (raw) => { ws.messages.push(JSON.parse(raw.toString())); });
  ws.sendJson = (payload) => ws.send(JSON.stringify(payload));
  ws.waitFor = async (predicate, timeout = 4000) => {
    const started = Date.now();
    while (Date.now() - started < timeout) {
      for (let i = ws.scanFrom; i < ws.messages.length; i++) {
        if (predicate(ws.messages[i])) {
          ws.scanFrom = i + 1;
          return ws.messages[i];
        }
      }
      await delay(30);
    }
    return null;
  };
  return new Promise((resolve, reject) => {
    ws.on('open', () => resolve(ws));
    ws.on('error', reject);
  });
}

test('per-IP profiles survive reconnects and feed room seats', async () => {
  const srv = spawn(process.execPath, ['server.js'], {
    env: { ...process.env, PORT: String(PORT) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let stderr = '';
  srv.stderr.on('data', (d) => { stderr += d; });

  try {
    // Wait for the port to accept connections
    await new Promise((resolve, reject) => {
      const timer = setInterval(() => {
        const probe = new WebSocket(`ws://127.0.0.1:${PORT}`);
        probe.on('open', () => { probe.close(); clearInterval(timer); resolve(); });
        probe.on('error', () => {});
      }, 150);
      setTimeout(() => reject(new Error('server not listening: ' + stderr.slice(-300))), 8000);
    });

    // --- 1. a brand new IP gets a fresh profile ---
    const first = await connect();
    const initial = await first.waitFor((m) => m.type === 'profile_state');
    assert.ok(initial, 'profile_state should arrive on connect');
    assert.equal(typeof initial.profile.id, 'string');
    assert.equal(initial.profile.name, '', 'a fresh profile starts without a nickname');
    assert.equal(initial.profile.prefs.lang, 'cs', 'Czech is the default language');
    assert.equal(initial.profile.prefs.sound, true);

    // --- 2. nickname, avatar and preferences are saved ---
    first.sendJson({ type: 'profile_update', data: {
      name: '  Testík  ',
      avatar: '🦊',
      color: '#5b7cbf',
      prefs: { autoReady: true, sound: false, lang: 'en' },
    } });
    const saved = await first.waitFor((m) => m.type === 'profile_state' && m.saved);
    assert.ok(saved, 'profile_update should be acknowledged');
    assert.equal(saved.profile.name, 'Testík');
    assert.equal(saved.profile.avatar, '🦊');
    assert.equal(saved.profile.color, '#5b7cbf');
    assert.equal(saved.profile.prefs.autoReady, true);
    assert.equal(saved.profile.prefs.sound, false);
    assert.equal(saved.profile.prefs.lang, 'en');

    // --- 3. markup is stripped, unknown avatars/colours are refused ---
    first.sendJson({ type: 'profile_update', data: {
      name: '<img src=x onerror=alert(1)>Bob',
      avatar: '<b>',
      color: 'red; background:url(x)',
    } });
    const sanitized = await first.waitFor((m) => m.type === 'profile_state' && m.saved);
    assert.ok(sanitized, 'the second update should still be acknowledged (name changed)');
    assert.equal(/[<>]/.test(sanitized.profile.name), false, 'nickname must not contain markup');
    assert.equal(sanitized.profile.avatar, '🦊', 'invalid avatars are refused');
    assert.equal(sanitized.profile.color, '#5b7cbf', 'invalid colours are refused');

    // --- 4. the same IP reconnecting keeps its account ---
    const beforeReconnect = sanitized.profile;
    first.close();
    await delay(200);
    const second = await connect();
    const resumed = await second.waitFor((m) => m.type === 'profile_state');
    assert.ok(resumed, 'profile_state should arrive after reconnecting');
    assert.equal(resumed.profile.id, beforeReconnect.id, 'same IP, same profile id');
    assert.equal(resumed.profile.name, beforeReconnect.name);
    assert.equal(resumed.profile.avatar, beforeReconnect.avatar);
    assert.equal(resumed.profile.prefs.autoReady, true);
    assert.equal(resumed.fresh, false, 'a returning profile is not fresh');

    // --- 5. a new seat is created with the profile identity ---
    second.sendJson({ type: 'create_room', data: { game: 'tictactoe', lang: 'cs' } });
    const created = await second.waitFor((m) => m.type === 'room_created');
    assert.ok(created, 'room_created should arrive');
    const seat = created.players.find((p) => !p.isBot);
    assert.equal(seat.name, beforeReconnect.name, 'seat uses the profile nickname');
    assert.equal(seat.avatar, beforeReconnect.avatar, 'seat uses the profile avatar');
    assert.equal(seat.color, '#5b7cbf');

    // --- 6. the created room counts toward the profile stats ---
    second.sendJson({ type: 'profile_get' });
    const stats = await second.waitFor((m) => m.type === 'profile_state');
    assert.ok(stats, 'profile_state should be returned on request');
    assert.ok(stats.profile.stats.rooms >= 1, 'creating a room increments the profile stat');

    // --- 7. invalid options are ignored, valid ones are stored ---
    second.sendJson({ type: 'set_option', data: { key: 'bestOf', value: 99 } });
    await delay(120);
    assert.notEqual(created.options.bestOf, 99, 'out-of-range option values are rejected');
    second.sendJson({ type: 'set_option', data: { key: 'bestOf', value: 3 } });
    const optionUpdate = await second.waitFor((m) => m.type === 'room_update' && m.options && m.options.bestOf === 3);
    assert.ok(optionUpdate, 'a valid option value is stored and broadcast');

    // --- 8. a reconnect on the same IP still gets into the existing room ---
    second.sendJson({ type: 'leave_room' });
    await second.waitFor((m) => m.type === 'left_room');
    second.close();
    await delay(200);
    const third = await connect();
    await third.waitFor((m) => m.type === 'profile_state');
    third.sendJson({ type: 'join_room', data: { roomId: created.roomId, lang: 'cs' } });
    const joined = await third.waitFor((m) => m.type === 'room_joined');
    assert.ok(joined, 'the room should still be joinable');
    const rejoinSeat = joined.players.find((p) => p.index === joined.playerIndex);
    assert.equal(rejoinSeat.name, beforeReconnect.name, 'the new seat also uses the profile nickname');
    third.close();
  } finally {
    srv.kill();
  }
});
