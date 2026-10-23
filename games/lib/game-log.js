// games/lib/game-log.js
// Live in-game logging for the server terminal.
//
// Every room event (start, move, draw, UNO call, win, rejected move, crash)
// is printed as one timestamped line so a running match can be followed
// without opening the browser devtools. Errors are always printed; per-move
// lines can be muted with GAMENEST_LOG=0.

const enabled = process.env.GAMENEST_LOG !== '0';
const useColor = !!process.stdout.isTTY && !process.env.NO_COLOR;

function paint(code, text) {
  return useColor ? '\x1b[' + code + 'm' + text + '\x1b[0m' : text;
}

// One line per event: no embedded newlines, no unbounded payload dumps.
function clean(text) {
  return String(text === undefined || text === null ? '' : text)
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500);
}

function clock() {
  const d = new Date();
  return [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map((n) => String(n).padStart(2, '0'))
    .join(':');
}

// "UNO Z6Z6" — the game and room are what you grep for in a long session.
function roomLabel(room) {
  const game = (room && room.game ? String(room.game) : 'game').toUpperCase();
  const id = (room && room._roomId) || '----';
  return game + ' ' + id;
}

// Human-readable seat name, resolved live from the room so renames and seat
// swaps show up correctly in later lines.
function seatName(room, index) {
  if (!room || index === undefined || index === null) return '?';
  if (room.players) {
    for (const info of room.players.values()) {
      if (info && info.index === index) return info.name || ('Hráč ' + (index + 1));
    }
  }
  if (room.bots && room.bots.has(index)) {
    const bot = room.bots.get(index);
    return (bot && bot.name) || ('AI ' + (index + 1));
  }
  return 'Sedadlo ' + (index + 1);
}

function emit(label, message, tone) {
  const color = tone === 'error' ? '31' : tone === 'warn' ? '33' : tone === 'ok' ? '32' : '36';
  const head = paint('2', clock()) + '  ' + paint(color, String(label).padEnd(10));
  const body = tone === 'error' ? paint('31', clean(message))
    : tone === 'warn' ? paint('33', clean(message))
      : tone === 'ok' ? paint('32', clean(message))
        : clean(message);
  process.stdout.write(head + '  ' + body + '\n');
}

function logEvent(room, message) {
  if (!enabled) return;
  emit(roomLabel(room), message, 'event');
}

// Warnings/errors always print, even with GAMENEST_LOG=0.
function logWarn(room, message) {
  emit(roomLabel(room), message, 'warn');
}

function logError(room, message) {
  emit(roomLabel(room), message, 'error');
}

function logOk(room, message) {
  if (!enabled) return;
  emit(roomLabel(room), message, 'ok');
}

function logSystem(message) {
  emit('SYSTEM', message, 'event');
}

// Browser-side crashes are forwarded here by POST /api/client-log.
function logClientError(info) {
  const where = [info && info.game, info && info.room].filter(Boolean).join(' ');
  emit('CLIENT', (where ? '[' + clean(where) + '] ' : '') + (clean(info && (info.message || info.msg)) || 'unknown error'), 'error');
  const stack = info && info.stack ? String(info.stack) : '';
  const lines = stack.split('\n').slice(0, 8);
  for (const line of lines) process.stdout.write(paint('2', '             ' + line.trim().slice(0, 220)) + '\n');
  if (info && info.source) {
    process.stdout.write(paint('2', '             at ' + clean(info.source) + (info.line ? ':' + info.line : '')) + '\n');
  }
}

// Crash reporting: the first line stays a normal log line, the stack is printed
// underneath so it is actually readable in a terminal.
function logCrash(prefix, err) {
  emit('SYSTEM', prefix, 'error');
  const text = err && err.stack ? err.stack : String(err);
  const lines = String(text).split('\n').slice(0, 14);
  for (const line of lines) {
    process.stdout.write(paint('2', '             ' + line.trim().slice(0, 220)) + '\n');
  }
}

function logBoot() {
  process.stdout.write(paint('2', 'Live game log: zapnuto — GAMENEST_LOG=0 vypne tahy, chyby zůstanou vidět.') + '\n');
}

module.exports = { logEvent, logWarn, logError, logOk, logSystem, logCrash, logClientError, logBoot, seatName, enabled };
