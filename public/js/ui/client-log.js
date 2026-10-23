// public/js/ui/client-log.js
// Forwards browser-side crashes to the server terminal (POST /api/client-log),
// so a broken renderer shows up in the live game log instead of only in the
// player's devtools. The server rate-limits and truncates the payload.
(function () {
  if (typeof window === 'undefined') return;

  var MAX_PER_PAGE = 5; // a render loop can throw forever — don't flood
  var sent = 0;

  function locationInfo() {
    var game = null;
    var room = null;
    try {
      game = sessionStorage.getItem('game');
      room = sessionStorage.getItem('roomId');
    } catch (e) { /* private mode */ }
    return { game: game, room: room };
  }

  function report(payload) {
    if (sent >= MAX_PER_PAGE) return;
    sent++;
    var where = locationInfo();
    payload.game = payload.game || where.game || undefined;
    payload.room = payload.room || where.room || undefined;
    payload.page = location.pathname;
    try {
      var body = JSON.stringify(payload);
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/client-log', new Blob([body], { type: 'application/json' }));
      } else if (window.fetch) {
        fetch('/api/client-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: body,
          keepalive: true,
        }).catch(function () {});
      }
    } catch (e) { /* logging must never throw */ }
  }

  window.addEventListener('error', function (event) {
    // Resource load failures (img/script) have no error object; still useful.
    report({
      message: event.message || ('failed to load ' + (event.target && (event.target.src || event.target.href))),
      source: event.filename || (event.target && event.target.tagName),
      line: event.lineno,
      stack: event.error && event.error.stack,
    });
  });

  window.addEventListener('unhandledrejection', function (event) {
    var reason = event.reason;
    report({
      message: 'Unhandled promise rejection: ' + (reason && reason.message ? reason.message : String(reason)),
      stack: reason && reason.stack,
    });
  });

  // Exposed so game renderers can report a caught-but-suspicious problem.
  window.reportClientError = function (message, stack) {
    report({ message: String(message), stack: stack });
  };
})();
