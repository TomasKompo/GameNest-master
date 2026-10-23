// 回归:大厅"开放牌桌"目录(/api/rooms)。
// Host 建好房间后,同一网络里的其他玩家应当能直接看到并加入,不用再口头传房间号。
// 目录只暴露公开信息(游戏、房主昵称/头像、人数),不得泄漏 resumeToken。
const test = require('node:test');
const assert = require('node:assert/strict');
const net = require('node:net');
const { spawn } = require('node:child_process');
const WebSocket = require('ws');

const delay = ms => new Promise(r => setTimeout(r, ms));

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

async function waitForServer(base) {
  const started = Date.now();
  while (Date.now() - started < 8000) {
    try {
      const res = await fetch(`${base}/api/stats`);
      if (res.ok) return;
    } catch (e) { /* retry */ }
    await delay(150);
  }
  throw new Error('server did not start');
}

test('open tables directory lists waiting rooms and hides full or running ones', { timeout: 30000 }, async () => {
  const port = await freePort();
  const base = `http://127.0.0.1:${port}`;
  const srv = spawn(process.execPath, ['server.js'], {
    env: { ...process.env, PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let errors = '';
  srv.stderr.on('data', d => { errors += d; });
  let ws = null;

  async function fetchRooms() {
    const res = await fetch(`${base}/api/rooms`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('cache-control'), 'no-store');
    return (await res.json()).rooms;
  }

  try {
    // The socket must be opened only after the server is listening, otherwise
    // its connection error would be unhandled and fail the test.
    await waitForServer(base);
    ws = new WebSocket(`ws://127.0.0.1:${port}`);
    await new Promise((resolve, reject) => {
      ws.once('open', resolve);
      ws.once('error', reject);
    });
    const send = payload => ws.send(JSON.stringify(payload));

    send({ type: 'create_room', data: { game: 'flightchess', lang: 'cs' } });
    await delay(200);

    let rooms = await fetchRooms();
    assert.equal(rooms.length, 1, 'fresh room should be listed: ' + JSON.stringify(rooms));
    const room = rooms[0];
    assert.equal(room.game, 'flightchess');
    assert.equal(room.humans, 1);
    assert.equal(room.bots, 0);
    assert.equal(room.maxPlayers, 4);
    assert.equal(typeof room.id, 'string');
    assert.ok(room.id.length >= 3);
    assert.ok(room.host && typeof room.host.name === 'string' && room.host.name.length > 0, 'host name is shown on the card');
    assert.equal(room.resumeToken, undefined, 'seat tokens must never leak through the directory');
    assert.equal(typeof room.createdAt, 'number');

    // A room that is full no longer accepts players, so it should not be listed.
    for (let i = 0; i < 3; i++) { send({ type: 'add_bot' }); await delay(80); }
    rooms = await fetchRooms();
    assert.equal(rooms.length, 0, 'full room should be hidden');

    // Reopening a seat brings the table back.
    send({ type: 'remove_bot', data: { botIndex: 1 } });
    await delay(120);
    rooms = await fetchRooms();
    assert.equal(rooms.length, 1, 'room with a free seat should be listed again');
    assert.equal(rooms[0].bots, 2);

    // Ready tables are still joinable, so they stay in the directory.
    send({ type: 'player_ready' });
    await delay(120);
    rooms = await fetchRooms();
    assert.equal(rooms.length, 1, 'ready table should stay joinable');

    for (let i = 0; i < 2; i++) { send({ type: 'add_bot' }); await delay(80); }
    send({ type: 'start_game' });
    await delay(300);
    rooms = await fetchRooms();
    assert.equal(rooms.length, 0, 'running game is not joinable and must be hidden');
  } finally {
    try { if (ws) ws.close(); } catch (e) {}
    srv.kill();
  }
  assert.equal(errors.includes('Error'), false, 'server logged an error: ' + errors.slice(-300));
});
