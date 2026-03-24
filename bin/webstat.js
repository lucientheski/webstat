#!/usr/bin/env node

'use strict';

const { createServer } = require('../src/server');

// Parse CLI arguments
const args = process.argv.slice(2);
const flags = {};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--port' || arg === '-p') {
    flags.port = parseInt(args[++i], 10);
  } else if (arg === '--host' || arg === '-H') {
    flags.host = args[++i];
  } else if (arg === '--no-open') {
    flags.open = false;
  } else if (arg === '--interval' || arg === '-i') {
    flags.interval = parseInt(args[++i], 10);
  } else if (arg === '--help' || arg === '-h') {
    console.log(`
  webstat — Zero-config system monitoring dashboard

  Usage: webstat [options]

  Options:
    -p, --port <port>      Port to listen on (default: 7070)
    -H, --host <host>      Host to bind to (default: 127.0.0.1)
                           Use 0.0.0.0 for LAN access
    -i, --interval <ms>    Update interval in ms (default: 1000)
    --no-open              Don't open browser automatically
    -h, --help             Show this help

  Examples:
    webstat                     Start on localhost:7070
    webstat -p 3000             Use port 3000
    webstat -H 0.0.0.0          Allow LAN access
    npx webstat                 Run without installing
`);
    process.exit(0);
  }
}

const config = {
  port: flags.port || 7070,
  host: flags.host || '127.0.0.1',
  open: flags.open !== false,
  interval: flags.interval || 1000,
};

createServer(config);
