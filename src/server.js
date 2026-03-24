'use strict';

const http = require('http');
const { collectAll } = require('./collector');
const { getDashboardHTML } = require('./dashboard');

function createServer(config) {
  const { port, host, open, interval } = config;
  const dashboardHTML = getDashboardHTML();

  // SSE clients
  const clients = new Set();

  // Metrics collection loop
  let collectionTimer = null;

  function startCollection() {
    // Initial collection (to prime CPU delta)
    collectAll();

    collectionTimer = setInterval(() => {
      const data = collectAll();
      const payload = 'data: ' + JSON.stringify(data) + '\n\n';

      for (const res of clients) {
        try {
          res.write(payload);
        } catch {
          clients.delete(res);
        }
      }
    }, interval);
  }

  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    // CORS headers for local development
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (url.pathname === '/' || url.pathname === '/index.html') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(dashboardHTML);
      return;
    }

    if (url.pathname === '/api/stats') {
      const data = collectAll();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
      return;
    }

    if (url.pathname === '/api/stream') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });

      // Send initial data immediately
      const initial = collectAll();
      res.write('data: ' + JSON.stringify(initial) + '\n\n');

      clients.add(res);

      req.on('close', () => {
        clients.delete(res);
      });
      return;
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  });

  // Try to listen, handling port conflicts
  function tryListen(tryPort, attempts = 0) {
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE' && attempts < 10) {
        console.log(`  Port ${tryPort} in use, trying ${tryPort + 1}...`);
        tryListen(tryPort + 1, attempts + 1);
      } else {
        console.error(`  Error: ${err.message}`);
        process.exit(1);
      }
    });

    server.listen(tryPort, host, () => {
      const actualPort = server.address().port;
      const url = host === '0.0.0.0'
        ? `http://localhost:${actualPort}`
        : `http://${host}:${actualPort}`;

      console.log('');
      console.log('  ⚡ webstat is running');
      console.log('');
      console.log(`  Local:   ${url}`);

      if (host === '0.0.0.0') {
        const os = require('os');
        const interfaces = os.networkInterfaces();
        for (const [name, addrs] of Object.entries(interfaces)) {
          if (name === 'lo' || name.startsWith('veth') || name.startsWith('br-') || name.startsWith('docker')) continue;
          const ipv4 = addrs.find(a => a.family === 'IPv4' && !a.internal);
          if (ipv4) {
            console.log(`  LAN:     http://${ipv4.address}:${actualPort}`);
          }
        }
      }

      console.log('');
      console.log('  Press Ctrl+C to stop');
      console.log('');

      startCollection();

      if (open) {
        const { exec } = require('child_process');
        const cmd = process.platform === 'darwin' ? 'open' :
                     process.platform === 'win32' ? 'start' : 'xdg-open';
        exec(`${cmd} ${url}`, () => {});
      }
    });
  }

  tryListen(port);

  // Graceful shutdown
  function shutdown() {
    console.log('\n  Shutting down...');
    if (collectionTimer) clearInterval(collectionTimer);

    // Close all SSE connections
    for (const res of clients) {
      try { res.end(); } catch {}
    }
    clients.clear();

    server.close(() => {
      process.exit(0);
    });

    // Force exit after 2 seconds
    setTimeout(() => process.exit(0), 2000);
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

module.exports = { createServer };
