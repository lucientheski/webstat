# Project Brief: webstat

## The Problem

Developers, homelabbers, and sysadmins regularly need to check system health (CPU, RAM, disk, network, processes) from a browser — especially from a phone or another machine on the network. The current options all have friction:

- **htop/btop**: Excellent, but terminal-only. Can't check from your phone.
- **Glances**: Has a web mode, but requires Python + pip + `glances[web]` extras. Not zero-config.
- **Netdata**: Powerful but heavyweight — persistent agent, cloud features, complex config. Overkill for "what's eating my CPU right now?"
- **Prometheus + Grafana**: Full observability stack. Way too complex for casual inspection.
- **Go-based tools (simon, kula)**: Good but require downloading platform-specific binaries. Not in the npm ecosystem.

There's a gap for something that is truly **zero-config, instantly available via `npx`, mobile-friendly, and ephemeral** — not a daemon, not infrastructure, just a quick look at your system.

## Who Has This Problem

1. **Node.js developers** who already have npm/npx installed and want the fastest path to "what's happening on my box?" — no new toolchain needed
2. **Homelab/self-hosted enthusiasts** running services on Raspberry Pis, NUCs, and VPSes who want to check system load from their phone without SSH
3. **DevOps engineers** who need a quick diagnostic during deploys or CI runs without setting up monitoring infrastructure
4. **Workshop/classroom instructors** who need students to inspect system resources via a simple command

## Why Existing Solutions Don't Solve It

| Tool | Friction |
|------|----------|
| htop/btop | Terminal-only, no remote/phone access |
| Glances web | Python + pip + extras, config needed |
| Netdata | Heavy agent, cloud push, persistent daemon |
| Grafana stack | Multi-component setup, overkill |
| simon/kula (Go) | Binary download, not in npm ecosystem |

None of them solve: **"I have Node.js. I want to see my system stats in a browser. Right now."**

## What I'm Building

**webstat** — a zero-config system monitoring dashboard that runs with one command:

```bash
npx webstat
```

It starts a local web server showing real-time:
- CPU usage (per-core + total)
- Memory (RAM + swap)
- Disk usage (all mounts)
- Network I/O (per interface)
- Top processes (sortable by CPU/RAM)
- System info (hostname, uptime, OS, load average)

Key design principles:
- **Zero config**: No YAML, no setup, no accounts. Run and go.
- **Ephemeral**: Not a daemon. Runs while you need it, Ctrl+C when done.
- **Mobile-first**: Dashboard designed to look great on phones.
- **LAN accessible**: `--host 0.0.0.0` makes it available to other devices on the network.
- **Lightweight**: Pure Node.js, no native dependencies, minimal overhead.
- **Real-time**: Server-Sent Events for live updates, no polling.

## Community Evidence

### 1. r/selfhosted — "Looking for a lightweight system monitor"
**URL**: https://www.reddit.com/r/selfhosted/comments/uwnzck/looking_for_a_lightweight_system_monitor/
Users explicitly say Netdata "felt a bit overkill" and want something simpler. One user notes Netdata "doesn't render well on mobile."

### 2. r/unRAID — "Simplified cpu/resource monitor, Netdata/Grafana are too complicated"
**URL**: https://www.reddit.com/r/unRAID/comments/zw5r97/simplified_cpuresource_monitor_netdatagrafana_are/
Title says it all. Multiple users agreeing that existing tools are more complex than needed. "Netdata does a whole lot more than what I need, and it seemed a bit resource heavy."

### 3. r/selfhosted — "Netdata consuming more RAM"
**URL**: https://www.reddit.com/r/selfhosted/comments/vrdqsw/netdata_consuming_more_ram/
Users reporting they "ditched Netdata" due to resource consumption. One user switched to Glances via Docker but still noted it requires configuration. Another said "I decided to use htop and sysstat and said a temporary goodbye to web-based performance monitoring" — showing unmet demand.

### 4. r/selfhosted — "What are you using for monitoring resources remotely?"
**URL**: https://www.reddit.com/r/selfhosted/comments/1aoysa1/what_are_you_using_for_monitoring_resources/
February 2024 thread. Users noting "Glances is great in terminal but it's pretty heavy in my experience." Demonstrates ongoing dissatisfaction with weight of existing tools.

## Frontier Model Validation Summary

Validated with 3 frontier models (Perplexity Sonar, ChatGPT GPT-5.3, Mistral Large). All three converged on:

**Verdict: BUILD — but keep it ruthlessly simple.**

Key feedback incorporated:
- All three confirmed the gap exists but is narrow. Differentiator is zero-friction + ephemeral, not features.
- ChatGPT's sharpest point: "This can succeed as a tool people love occasionally, but will fail if you try to make it a tool people depend on daily." → Positioning as ephemeral inspection, not monitoring infrastructure.
- Perplexity emphasized: "The combination of native single binary, zero config, one machine, and clean modern web UI is underserved." → I'm going further with `npx` (truly zero-install).
- Mistral flagged: "Discovery: standing out in a crowded space is hard. You'll need a clear, memorable pitch." → Pitch: "htop, but in your browser, instantly."
- All three warned against feature creep toward Netdata territory → v1 scope is deliberately minimal.

Full validation responses archived in `project/validation/`.
