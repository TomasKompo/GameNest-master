// Session XP: earned per player (identified by IP), stored only in the server
// process memory, and wiped whenever the server restarts.
const test = require('node:test');
const assert = require('node:assert/strict');
const net = require('node:net');
const { spawn } = require('node:child_process');
const WebSocket = require('ws');

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function freePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.listen(0, '127.0.0.1', () => {
      const port = srv.address().port;
      srv.close(() => resolve(port));
    });
    srv.on('error', reject);
  });
}

async function waitUp(port) {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/stats`);
      if (res.ok) return;
    } catch (e) { /* not listening yet */ }
    await delay(150);
  }
  throw new Error('server did not start');
}

function connect(port, ip) {
  const ws = new WebSocket(`ws://127.0.0.1:${port}`, { headers: { 'x-forwarded-for': ip } });
  ws.messages = [];
  ws.scanFrom = 0;
  ws.on('message', (raw) => { ws.messages.push(JSON.parse(raw.toString())); });
  ws.sendJson = (payload) => ws.send(JSON.stringify(payload));
  ws.waitFor = async (predicate, timeout = 5000) => {
    const started = Date.now();
    while (Date.now() - started < timeout) {
      for (let i = ws.scanFrom; i < ws.messages.length; i++) {
        if (predicate(ws.messages[i])) {
          ws.scanFrom = i + 1;
          return ws.messages[i];
        }
      }
      await delay(25);
    }
    return null;
  };
  return new Promise((resolve, reject) => {
    ws.on('open', () => resolve(ws));
    ws.on('error', reject);
  });
}

async function profileXp(port, ip) {
  const res = await fetch(`http://127.0.0.1:${port}/api/profile`, {
    headers: { 'x-forwarded-for': ip },
  });
  assert.equal(res.status, 200);
  const body = await res.json();
  return body.profile.xp;
}

test('session XP is awarded for creating, joining and finishing games, and resets on restart', { timeout: 60000 }, async (t) => {
  const port = await freePort();
  const start = () => spawn(process.execPath, ['server.js'], {
    env: { ...process.env, PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let srv = start();
  let logs = '';
  srv.stderr.on('data', (d) => { logs += d; });
  const sockets = [];

  t.after(() => {
    for (const ws of sockets) { try { ws.close(); } catch (e) {} }
    try { srv.kill(); } catch (e) {}
  });

  try {
    await waitUp(port);

    // A brand-new IP starts at zero XP, level 1.
    const fresh = await profileXp(port, '10.9.0.1');
    assert.deepEqual(
      { total: fresh.total, level: fresh.level, into: fresh.into, need: fresh.need },
      { total: 0, level: 1, into: 0, need: 100 },
      'fresh session starts at 0 XP'
    );
    assert.equal(typeof fresh.sessionStartedAt, 'number');

    const a = await connect(port, '10.9.0.1');
    sockets.push(a);
    const aInitial = await a.waitFor((m) => m.type === 'profile_state');
    assert.equal(aInitial.profile.xp.total, 0);

    // Creating a table pays XP, and the client hears about it.
    a.sendJson({ type: 'create_room', data: { game: 'tictactoe', lang: 'cs' } });
    // The XP ack is pushed before the room payload, so read it first.
    const createdXp = await a.waitFor((m) => m.type === 'xp_award');
    const created = await a.waitFor((m) => m.type === 'room_created');
    assert.ok(created, 'room_created should arrive');
    assert.equal(createdXp.reason, 'create');
    assert.equal(createdXp.amount, 10);
    assert.equal(createdXp.xp.total, 10);
    assert.equal((await profileXp(port, '10.9.0.1')).total, 10, 'create XP is stored on the IP profile');

    // Joining somebody else's table pays join XP.
    const b = await connect(port, '10.9.0.2');
    sockets.push(b);
    await b.waitFor((m) => m.type === 'profile_state');
    b.sendJson({ type: 'join_room', data: { roomId: created.roomId, lang: 'cs' } });
    const joinXp = await b.waitFor((m) => m.type === 'xp_award');
    const joined = await b.waitFor((m) => m.type === 'room_joined');
    assert.ok(joined, 'room_joined should arrive');
    assert.equal(joinXp.reason, 'join');
    assert.equal(joinXp.amount, 10);
    assert.equal(joinXp.xp.total, 10);

    // A reconnect/resume on the same IP must not farm join XP. B resumes its
    // own seat on a fresh socket, then keeps playing from there.
    const bResumed = await connect(port, '10.9.0.2');
    sockets.push(bResumed);
    bResumed.sendJson({ type: 'join_room', data: { roomId: created.roomId, resumeToken: joined.resumeToken, lang: 'cs' } });
    assert.ok(await bResumed.waitFor((m) => m.type === 'room_joined'), 'resume works');
    assert.equal(await bResumed.waitFor((m) => m.type === 'xp_award', 600), null, 'resuming a seat earns no XP');

    // Play a real tic-tac-toe game: 0 wins on cells 0,1,2.
    a.sendJson({ type: 'player_ready' });
    bResumed.sendJson({ type: 'player_ready' });
    await delay(150);
    a.sendJson({ type: 'start_game' });
    const started = await a.waitFor((m) => m.type === 'game_started');
    assert.ok(started, 'game should start');
    const moves = [
      [a, 0], [bResumed, 3],
      [a, 1], [bResumed, 4],
      [a, 2],
    ];
    for (const [ws, cell] of moves) {
      ws.sendJson({ type: 'game_move', data: { cell } });
      await delay(60);
    }

    const winXp = await a.waitFor((m) => m.type === 'xp_award' && m.reason === 'win');
    assert.ok(winXp, 'winner gets finish + win XP: ' + JSON.stringify(a.messages.slice(-3)));
    const finished = await a.waitFor((m) => m.type === 'game_state' && m.state && m.state.winner === 0);
    assert.ok(finished, 'player 0 should win');
    assert.equal(winXp.amount, 85, 'finish 25 + win 60');
    assert.equal(winXp.xp.total, 95);

    const finishXp = await bResumed.waitFor((m) => m.type === 'xp_award' && m.reason === 'finish');
    assert.ok(finishXp, 'loser still gets participation XP');
    assert.equal(finishXp.amount, 25);
    assert.equal(finishXp.xp.total, 35);

    // Crossing the 100 XP threshold levels the player up (95 + 10 from a new table).
    a.sendJson({ type: 'create_room', data: { game: 'tictactoe', lang: 'cs' } });
    const levelUp = await a.waitFor((m) => m.type === 'xp_award' && m.levelUp);
    assert.ok(levelUp, 'a level-up is announced');
    assert.equal(levelUp.levelUp, 2);
    assert.equal(levelUp.xp.total, 105);
    assert.equal(levelUp.xp.level, 2);
    assert.equal(levelUp.xp.into, 5);
    assert.equal(levelUp.xp.need, 150);

    // Restart: the whole session XP is gone.
    for (const ws of sockets) { try { ws.close(); } catch (e) {} }
    sockets.length = 0;
    srv.kill();
    await new Promise((resolve) => srv.once('exit', resolve));
    srv = start();
    srv.stderr.on('data', (d) => { logs += d; });
    await waitUp(port);

    const afterRestart = await profileXp(port, '10.9.0.1');
    assert.equal(afterRestart.total, 0, 'restarting the server zeroes session XP');
    assert.equal(afterRestart.level, 1);

    assert.equal(/Error/.test(logs), false, 'server logged an error: ' + logs.slice(-300));
  } finally {
    try { srv.kill(); } catch (e) {}
  }
});
