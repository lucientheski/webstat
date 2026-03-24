# ⚡ webstat

Zero-config system monitoring dashboard. **htop, but in your browser.**

One command. No dependencies. Real-time metrics. Mobile-friendly.

```bash
npx webstat
```

![webstat dashboard](https://img.shields.io/badge/zero-dependencies-brightgreen) ![Node.js](https://img.shields.io/badge/node-%3E%3D16-blue) ![License: MIT](https://img.shields.io/badge/license-MIT-yellow)

## What it does

Starts a local web server showing real-time system metrics:

- **CPU** — Total usage + per-core breakdown
- **Memory** — RAM and swap usage
- **Disks** — Usage for all mounted filesystems
- **Network** — Per-interface throughput (↓/↑ rates)
- **Processes** — Top processes sorted by CPU/memory (click headers to sort)
- **System** — Hostname, OS, uptime, load averages, kernel version

Updates every second via Server-Sent Events. No polling, no page reloads.

## Install & Run

### Quick start (no install needed)

```bash
npx webstat
```

### Global install

```bash
npm install -g webstat
webstat
```

### From source

```bash
git clone https://github.com/lucientheski/webstat.git
cd webstat
node bin/webstat.js
```

## Usage

```
webstat [options]

Options:
  -p, --port <port>      Port to listen on (default: 7070)
  -H, --host <host>      Host to bind to (default: 127.0.0.1)
                         Use 0.0.0.0 for LAN access
  -i, --interval <ms>    Update interval in ms (default: 1000)
  --no-open              Don't open browser automatically
  -h, --help             Show this help
```

### Examples

```bash
# Start on localhost (default)
webstat

# Allow access from other devices on your network
webstat -H 0.0.0.0

# Use a different port
webstat -p 3000

# Faster updates (500ms)
webstat -i 500

# Don't auto-open browser
webstat --no-open

# Combine flags — LAN access on port 8080
webstat -H 0.0.0.0 -p 8080
```

### Access from another device

```bash
# On the host machine:
webstat -H 0.0.0.0

# On your phone/other computer, open:
# http://<host-ip>:7070
```

The startup message shows all available LAN addresses.

## API

webstat also exposes a JSON API:

| Endpoint | Description |
|----------|-------------|
| `GET /` | Dashboard HTML |
| `GET /api/stats` | One-shot JSON snapshot of all metrics |
| `GET /api/stream` | Server-Sent Events stream (real-time updates) |

### Example: get current stats as JSON

```bash
curl http://localhost:7070/api/stats | jq .
```

### Example: stream live updates

```bash
curl -N http://localhost:7070/api/stream
```

## Features

- **Zero dependencies** — No Express, no React, no build step. Just Node.js built-ins.
- **Zero config** — No YAML, no setup files, no accounts. Run and go.
- **Ephemeral** — Not a daemon. Runs while you need it, Ctrl+C when done.
- **Mobile-first** — Responsive layout that works great on phones.
- **Dark/light theme** — Toggle with the 🌓 button. Preference is saved.
- **Auto-reconnect** — If the connection drops, it reconnects automatically.
- **Port fallback** — If port 7070 is busy, tries the next 10 ports.
- **Graceful shutdown** — Ctrl+C closes all connections cleanly.

## Requirements

- **Node.js ≥ 16** (uses built-in `http`, `os`, `fs`, `child_process`)
- **Linux** for full metrics (CPU per-core, swap, network throughput, processes)
- **macOS/Windows** — basic metrics work via `os` module, some features may be limited

## How it works

```
Browser  ←── SSE stream ──  Node.js server  ←── /proc, os module
                                            ←── ps aux
                                            ←── df
```

1. A metrics collector reads system stats every second (from `/proc` on Linux, `os` module elsewhere)
2. The HTTP server broadcasts metrics to all connected browsers via Server-Sent Events
3. The dashboard (vanilla HTML/CSS/JS, inlined in the server) updates the DOM on each event
4. No data is stored — purely ephemeral, in-memory

## Design decisions

- **Why Node.js?** → `npx webstat` works instantly for anyone with Node.js. No binary downloads, no platform detection.
- **Why no framework?** → Zero dependencies = instant install, minimal attack surface, no build step.
- **Why SSE over WebSocket?** → One-directional flow (server→client) is a perfect SSE use case. Auto-reconnect built into the browser API.
- **Why vanilla JS?** → The dashboard is simple enough that a framework adds complexity without benefit. The entire UI is a single inlined string.

## License

MIT — see [LICENSE](LICENSE)

## Author

Built by [Luci](https://github.com/lucientheski) 🔥
