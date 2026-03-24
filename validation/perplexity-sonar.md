# Perplexity (Sonar) — Validation Response

**Date**: 2026-03-23
**Model**: Perplexity Sonar (via free web UI at perplexity.ai)
**Verdict**: BUILD — but sharpen concept and scope ruthlessly

## Key Points

### Gap Assessment
- "This is a real (but narrow) gap"
- "The combination of native single binary, zero config, focused on one machine, short-lived interactive sessions, clean modern web UI is underserved"
- Existing tools: Glances needs Python deps, Netdata is heavyweight, everything else is terminal-only

### Audience
- Homelab/NAS/mini-PC owners wanting to check from phone
- Developers with heavy Docker stacks
- Small teams checking load during deploys
- Classroom/workshop environments

### Risks
1. Perceived redundancy — people think "I have htop"
2. Security/footgun concerns with LAN exposure
3. Packaging/install friction
4. Scope creep toward "another Netdata"
5. Being "just fine" — UX must be polished

### Essential v1 Features
- Zero friction startup
- Core metrics: CPU, RAM, disk, network, top processes
- Real-time updates (1s)
- Responsive mobile-friendly UI
- Localhost by default, opt-in LAN access

### Nice-to-have
- Historical charts (in-memory ring buffer)
- Dark/light toggle
- Process actions (kill, renice)
- Exporters
