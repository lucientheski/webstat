# Retrospective: webstat

## What Went Well

### Validation was genuinely useful
The frontier model validation (Perplexity, ChatGPT, Mistral) wasn't theater — it shaped the product. ChatGPT's reframe from "monitoring dashboard" to "ephemeral inspection tool" was the single most important insight. It changed the entire positioning and kept scope tight.

### Zero-dependency architecture paid off
Choosing to use only Node.js built-ins meant:
- No `npm install` step, no `node_modules`
- The entire project is 4 files totaling ~30KB
- `npx webstat` genuinely works with zero setup
- No framework lock-in, no build step, no transpilation

### The Docker noise bug was a real find
Testing on a machine with Docker running revealed that the naive approach (show all interfaces) floods the dashboard with useless veth/bridge entries. Finding and fixing this during development is exactly the kind of thing that separates "works on my machine" from "works for users."

### SSE over WebSocket was the right call
Server-Sent Events turned out to be perfect for this use case. One-directional data flow, browser auto-reconnect, no client library needed. The implementation was simpler and more reliable than WebSocket would have been.

## What Went Wrong

### Frontier model UI automation is fragile
The browser automation for validating with chat UIs was unreliable. Gemini timed out, Perplexity required discovering a contenteditable div (not a textarea), and each model's interface required custom handling. This consumed more time than the actual validation reasoning.

### No automated tests
The project has no test suite — all testing was manual. For a v1 shipped under time pressure, this is acceptable, but for any ongoing development it would be the first thing to add. The collector module especially would benefit from unit tests with mock `/proc` data.

### Cross-platform support is minimal
The `os` module basics work everywhere, but process listing, swap info, and network throughput all depend on Linux-specific paths (`/proc`, `ps aux` output format). macOS would get degraded metrics, Windows would miss several features. I didn't have time to test or build proper fallbacks.

## Where the Product Falls Short

### No historical data
The dashboard shows only the current moment. A 60-second rolling chart for CPU/network would make it much more useful — you could see "what just spiked?" instead of only seeing current state.

### No authentication
With `--host 0.0.0.0`, anyone on the LAN can see your processes and system info. A simple shared-secret token in the URL would be the minimum viable security. This is documented in the README but not implemented.

### Process list is basic
The process table shows top 20 by CPU but lacks kill/renice ability, search/filter, or tree view. These were explicitly scoped out, but they'd make the tool significantly more useful.

### No npm publish
The package is on GitHub but not on npm registry. `npx webstat` won't work until it's published to npm. This would be the immediate next step for real distribution.

## Technical Lessons

### Lesson 1: CPU delta calculation requires two readings
`os.cpus()` returns cumulative times, not instant usage. You need to take two readings and calculate the delta. The first call always returns 0% for all cores. This is why the collector primes itself with an initial `collectAll()` before starting the broadcast loop.

### Lesson 2: SSE connections prevent `networkidle` in Playwright
When testing with Playwright, `waitUntil: 'networkidle'` hangs forever because the SSE connection never closes. Must use `domcontentloaded` instead. This is the kind of subtle issue that would affect anyone writing automated tests for SSE-based apps.

### Lesson 3: `df` output format varies across distros
The `df --output=...` flag isn't universal. The fallback to `df -k` is necessary for older systems. Parsing tabular CLI output is always fragile — a proper implementation would read `/proc/mounts` and use `statvfs` via a native addon, but that would break the zero-dependency constraint.

## Process Lessons

### Lesson 1: Scope discipline is the hardest part
Every frontier model warned about feature creep. They were right. The temptation to add "just one more thing" (charts, auth, Docker stats, GPU monitoring) was constant. The project succeeded because the scope stayed ruthlessly small: 4 files, 3 routes, 6 metric types.

### Lesson 2: Build it ugly, then make it work, then make it pretty
I wrote the collector first, the server second, the dashboard third. Getting data flowing before caring about presentation meant I could test the core loop early and fix bugs (like the Docker noise) before investing in UI polish.

### Lesson 3: Community evidence > model consensus
The reddit threads from r/selfhosted and r/unRAID were more convincing than any model's opinion. Real users saying "Netdata is overkill for what I need" and "Glances is great but heavy" — that's validation you can't fake. Models can reason about markets, but they can't tell you what real people are frustrated about right now.
