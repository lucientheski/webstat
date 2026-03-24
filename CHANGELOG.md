# Changelog

## [1.0.0] - 2026-03-24

### Added
- Initial release
- Real-time CPU monitoring (total + per-core breakdown)
- Memory and swap usage display
- Disk usage for all mounted filesystems
- Network interface throughput (per-interface rx/tx rates)
- Top 20 processes sorted by CPU/memory (click column headers to sort)
- System info (hostname, OS, uptime, load averages, CPU model)
- Server-Sent Events (SSE) for real-time updates without polling
- JSON API endpoints (`/api/stats`, `/api/stream`)
- Dark/light theme toggle with localStorage persistence
- Mobile-responsive layout
- Zero dependencies — uses only Node.js built-in modules
- CLI with `--port`, `--host`, `--interval`, `--no-open` flags
- Automatic browser open on startup
- Port fallback (tries next 10 ports if default is busy)
- Graceful shutdown on Ctrl+C

### Fixed
- **Docker noise in network view**: Initial version showed Docker veth pairs and bridge networks, flooding the network card with ~10 unused interfaces. Fixed by filtering `veth*` and `br-*` interfaces.
- **Docker bridge IPs in startup banner**: LAN address display showed Docker bridge IPs (172.x) alongside the real LAN IP. Fixed by filtering internal/Docker interfaces from startup output.
- **Disk filesystem whitelist too restrictive**: Initial whitelist only recognized ~12 filesystem types. Changed to exclusion-based filter (skip known virtual/pseudo filesystems) to support more real filesystem types automatically.
