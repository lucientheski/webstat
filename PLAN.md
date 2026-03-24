# Project Plan: webstat

## Architecture Overview

webstat is a single-process Node.js application with an embedded HTTP server that serves a real-time system monitoring dashboard.

```
┌─────────────────────────────────────────┐
│              Browser (Client)            │
│  ┌─────────────────────────────────────┐ │
│  │   Single-Page Dashboard (Vanilla)   │ │
│  │   HTML + CSS + JS (no framework)    │ │
│  │   SSE EventSource for live data     │ │
│  └─────────────┬───────────────────────┘ │
└────────────────│─────────────────────────┘
                 │ HTTP + SSE
┌────────────────▼─────────────────────────┐
│           Node.js Server                  │
│  ┌─────────────────────────────────────┐ │
│  │   HTTP Server (built-in http module) │ │
│  │   Routes:                            │ │
│  │   GET /         → Dashboard HTML     │ │
│  │   GET /api/stats → JSON snapshot     │ │
│  │   GET /api/stream → SSE stream       │ │
│  └─────────────┬───────────────────────┘ │
│  ┌─────────────▼───────────────────────┐ │
│  │   System Metrics Collector           │ │
│  │   os module + /proc parsing          │ │
│  │   1-second collection interval       │ │
│  └─────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

## Tech Stack

### Node.js (no framework, no native deps)

**Why Node.js:**
- `npx webstat` — zero install for anyone with Node.js (massive audience)
- Built-in `os` module provides CPU, memory, network, uptime
- Built-in `http` module — no Express needed
- `/proc` filesystem parsing for Linux-specific metrics (processes, disk I/O)
- Cross-platform: `os` module works on Linux, macOS, Windows
- No native dependencies — `npm install` just works, no build tools needed

**Why not Go/Rust:**
- Require platform-specific binaries and download infrastructure
- npm/npx is already on every dev machine
- The audience already has Node.js

**Why no framework (Express, Fastify, etc.):**
- Zero dependencies = faster install, smaller attack surface
- Built-in `http` module is sufficient for 3 routes
- No framework lock-in

### Frontend: Vanilla HTML/CSS/JS

**Why no React/Vue/Svelte:**
- Single file, inlined in the server — no build step
- Dashboard is simple enough for vanilla JS
- Faster initial load, no framework overhead
- The entire frontend is served from memory — no static file serving

### Real-time: Server-Sent Events (SSE)

**Why SSE over WebSocket:**
- One-directional data flow (server → client) matches the use case perfectly
- Built into browsers, no client library needed
- Auto-reconnect built in
- Simpler server implementation
- Works through proxies and load balancers

## Key Components

### 1. `src/server.js` — HTTP Server
- Serves dashboard HTML at `/`
- JSON API at `/api/stats` (one-shot snapshot)
- SSE stream at `/api/stream` (live updates every 1s)
- Handles CLI flags (port, host, open browser)

### 2. `src/collector.js` — System Metrics Collector
- CPU usage (per-core, using `os.cpus()` delta calculation)
- Memory (total, used, free, swap via `/proc/meminfo`)
- Disk usage (via `df` command or `/proc/mounts` + `statvfs`)
- Network I/O (via `os.networkInterfaces()` + `/proc/net/dev`)
- Load average (via `os.loadavg()`)
- Uptime (via `os.uptime()`)
- Top processes (via `/proc/[pid]/stat` parsing)
- System info (hostname, OS, arch, Node version)

### 3. `src/dashboard.js` — Frontend (inlined HTML/CSS/JS)
- Responsive grid layout (mobile-first)
- CPU gauge + per-core bars
- Memory/swap usage bars
- Disk usage cards
- Network throughput chart (last 60s in-memory)
- Process table (sortable, top 20 by CPU/RAM)
- System info header
- Dark theme default, light theme toggle
- Auto-reconnect on SSE disconnect

### 4. `bin/webstat.js` — CLI Entry Point
- Parse flags: `--port`, `--host`, `--no-open`, `--interval`
- Print startup banner with URL
- Open browser by default (disable with `--no-open`)

## Data Flow

1. Collector reads system metrics every 1 second
2. Server broadcasts metrics via SSE to all connected clients
3. Dashboard receives SSE events and updates DOM
4. No data persistence — purely ephemeral, in-memory

## Task Breakdown

### Phase 3a: Core Infrastructure (2-3 hours)
- [ ] Initialize npm project with package.json
- [ ] Create CLI entry point with flag parsing
- [ ] Create HTTP server with route handling
- [ ] Implement SSE broadcasting

### Phase 3b: Metrics Collection (2-3 hours)
- [ ] CPU usage (total + per-core with delta calculation)
- [ ] Memory (RAM + swap)
- [ ] Disk usage (mounts + space)
- [ ] Network I/O (bytes in/out per interface)
- [ ] Process list (PID, name, CPU%, MEM%, command)
- [ ] System info (hostname, OS, uptime, load)

### Phase 3c: Dashboard UI (3-4 hours)
- [ ] Responsive layout (CSS Grid, mobile-first)
- [ ] CPU visualization (gauge + per-core bars)
- [ ] Memory/swap bars
- [ ] Disk usage cards
- [ ] Network throughput mini-chart (canvas, last 60s)
- [ ] Process table with sorting
- [ ] System info header
- [ ] Dark/light theme
- [ ] SSE connection with auto-reconnect

### Phase 3d: Polish & Testing (2-3 hours)
- [ ] Error handling (graceful shutdown, port-in-use)
- [ ] Cross-platform fallbacks (macOS/Windows where `os` module suffices)
- [ ] README.md
- [ ] Test on LAN (verify Qu can access from reshi)
- [ ] Performance check (ensure < 1% CPU overhead)

## Acceptance Criteria

1. **`npx webstat` works**: Running the command starts a server and opens a browser showing live system metrics
2. **LAN accessible**: Running with `--host 0.0.0.0` allows access from another machine (Qu on reshi at http://192.168.1.208:PORT)
3. **Real-time updates**: Metrics refresh every second without page reload
4. **Mobile-friendly**: Dashboard is usable on a phone-width viewport
5. **Process list**: Shows top processes sorted by CPU or memory
6. **Clean shutdown**: Ctrl+C stops cleanly, no zombie processes
7. **Zero dependencies**: `npm install` downloads nothing extra (node_modules is empty or absent)
8. **Runs on Linux**: Full metrics on Linux (degraded but functional on macOS/Windows via `os` module)

## Risk Assessment

### Risk 1: Process listing on non-Linux
**Problem**: `/proc` filesystem parsing only works on Linux. macOS and Windows don't have `/proc`.
**Mitigation**: Use `os` module for cross-platform basics. Process listing falls back to `ps aux` on macOS or is omitted on Windows. Linux is the primary target (the spec says Qu tests from reshi, both machines are Linux).
**Severity**: Low — both machines in the test environment are Linux.

### Risk 2: SSE connection limits
**Problem**: Browsers limit concurrent SSE connections per domain (usually 6). If someone opens many tabs, connections may queue.
**Mitigation**: Dashboard shows a warning if SSE disconnects. Keep-alive with reconnect. This is a single-user tool, not a production service — unlikely to hit the limit in normal use.
**Severity**: Low.

### Risk 3: CPU overhead from 1-second collection
**Problem**: Reading `/proc` files every second could use noticeable CPU on low-power devices (Raspberry Pi).
**Mitigation**: Metrics collection is lightweight (file reads, no shell commands for hot path). `os.cpus()` is native and fast. Process listing is the heaviest part — limit to top 20. Configurable interval via `--interval`.
**Severity**: Low — tested tools like Glances do the same at higher frequency.

### Risk 4: Port conflicts
**Problem**: Default port may already be in use.
**Mitigation**: Try default port (7070), if taken, increment and retry up to 10 ports. Print actual port in startup message.
**Severity**: Low — standard solution.
