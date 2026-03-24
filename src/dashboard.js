'use strict';

/**
 * Generate the complete dashboard HTML as a string.
 * Everything is inlined — no external files needed.
 */
function getDashboardHTML() {
  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>webstat</title>
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg: #0d1117;
  --surface: #161b22;
  --border: #30363d;
  --text: #e6edf3;
  --text-dim: #8b949e;
  --accent: #58a6ff;
  --green: #3fb950;
  --yellow: #d29922;
  --red: #f85149;
  --orange: #db6d28;
  --bar-bg: #21262d;
  --font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, sans-serif;
  --mono: 'SF Mono', 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

[data-theme="light"] {
  --bg: #ffffff;
  --surface: #f6f8fa;
  --border: #d0d7de;
  --text: #1f2328;
  --text-dim: #656d76;
  --accent: #0969da;
  --green: #1a7f37;
  --yellow: #9a6700;
  --red: #cf222e;
  --orange: #bc4c00;
  --bar-bg: #eaeef2;
}

body {
  font-family: var(--font);
  background: var(--bg);
  color: var(--text);
  line-height: 1.5;
  min-height: 100vh;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  flex-wrap: wrap;
  gap: 8px;
}

.header h1 {
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header h1 span { color: var(--accent); }

.header-info {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: var(--text-dim);
  align-items: center;
  flex-wrap: wrap;
}

.header-info .tag {
  background: var(--bar-bg);
  padding: 2px 8px;
  border-radius: 4px;
  font-family: var(--mono);
  font-size: 12px;
}

.status-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--green);
  display: inline-block;
  animation: pulse 2s infinite;
}

.status-dot.disconnected { background: var(--red); animation: none; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.theme-toggle {
  cursor: pointer;
  background: none;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 4px 8px;
  color: var(--text);
  font-size: 16px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 12px;
  padding: 12px 16px;
  max-width: 1400px;
  margin: 0 auto;
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
}

.card-title {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-dim);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.big-number {
  font-size: 36px;
  font-weight: 700;
  font-family: var(--mono);
  line-height: 1;
}

.big-number.green { color: var(--green); }
.big-number.yellow { color: var(--yellow); }
.big-number.orange { color: var(--orange); }
.big-number.red { color: var(--red); }

.bar-container {
  height: 8px;
  background: var(--bar-bg);
  border-radius: 4px;
  overflow: hidden;
  margin: 8px 0;
}

.bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease, background-color 0.5s ease;
}

.bar-green { background: var(--green); }
.bar-yellow { background: var(--yellow); }
.bar-orange { background: var(--orange); }
.bar-red { background: var(--red); }

.cores-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  gap: 4px;
  margin-top: 8px;
}

.core-bar {
  height: 32px;
  background: var(--bar-bg);
  border-radius: 3px;
  position: relative;
  overflow: hidden;
}

.core-bar-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  transition: height 0.5s ease, background-color 0.5s ease;
  border-radius: 3px;
}

.core-bar-label {
  position: absolute;
  bottom: 1px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 9px;
  font-family: var(--mono);
  color: var(--text);
  z-index: 1;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  font-size: 13px;
}

.stat-label { color: var(--text-dim); }
.stat-value { font-family: var(--mono); font-size: 13px; }

.disk-item {
  margin-bottom: 12px;
}

.disk-item:last-child { margin-bottom: 0; }

.disk-name {
  font-size: 12px;
  font-family: var(--mono);
  color: var(--text-dim);
  margin-bottom: 2px;
  display: flex;
  justify-content: space-between;
}

.net-item {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.net-item:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }

.net-name {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
}

.net-rates {
  display: flex;
  gap: 16px;
  font-family: var(--mono);
  font-size: 13px;
}

.net-rates .rx { color: var(--green); }
.net-rates .tx { color: var(--accent); }

.process-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  font-family: var(--mono);
}

.process-table th {
  text-align: left;
  padding: 6px 8px;
  border-bottom: 1px solid var(--border);
  color: var(--text-dim);
  font-weight: 600;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}

.process-table th:hover { color: var(--accent); }
.process-table th.sorted { color: var(--accent); }

.process-table td {
  padding: 4px 8px;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
}

.process-table tr:hover { background: var(--bar-bg); }

.card-full {
  grid-column: 1 / -1;
}

.load-values {
  display: flex;
  gap: 16px;
  margin-top: 4px;
}

.load-item {
  text-align: center;
}

.load-item .val {
  font-family: var(--mono);
  font-size: 20px;
  font-weight: 600;
}

.load-item .label {
  font-size: 11px;
  color: var(--text-dim);
}

.chart-container {
  height: 60px;
  position: relative;
  margin-top: 8px;
}

.chart-container canvas {
  width: 100%;
  height: 100%;
}

@media (max-width: 640px) {
  .grid { grid-template-columns: 1fr; padding: 8px; gap: 8px; }
  .header { padding: 8px 12px; }
  .card { padding: 12px; }
  .big-number { font-size: 28px; }
  .header-info { font-size: 12px; gap: 8px; }
}
</style>
</head>
<body>

<div class="header">
  <h1><span>⚡</span> webstat</h1>
  <div class="header-info">
    <span id="hostname" class="tag">—</span>
    <span id="uptime">—</span>
    <span><span class="status-dot" id="statusDot"></span> <span id="statusText">connecting</span></span>
    <button class="theme-toggle" onclick="toggleTheme()" title="Toggle theme">🌓</button>
  </div>
</div>

<div class="grid">
  <!-- CPU -->
  <div class="card">
    <div class="card-title">🔲 CPU</div>
    <div id="cpuTotal" class="big-number">—%</div>
    <div class="bar-container">
      <div id="cpuBar" class="bar-fill bar-green" style="width: 0%"></div>
    </div>
    <div id="cpuCores" class="cores-grid"></div>
  </div>

  <!-- Memory -->
  <div class="card">
    <div class="card-title">💾 Memory</div>
    <div id="memTotal" class="big-number">—%</div>
    <div class="bar-container">
      <div id="memBar" class="bar-fill bar-green" style="width: 0%"></div>
    </div>
    <div id="memDetails"></div>
    <div id="swapSection" style="margin-top: 12px; display: none;">
      <div class="stat-row">
        <span class="stat-label">Swap</span>
        <span id="swapPercent" class="stat-value">—</span>
      </div>
      <div class="bar-container">
        <div id="swapBar" class="bar-fill bar-green" style="width: 0%"></div>
      </div>
      <div id="swapDetails"></div>
    </div>
  </div>

  <!-- Load Average -->
  <div class="card">
    <div class="card-title">📊 Load Average</div>
    <div class="load-values">
      <div class="load-item"><div id="load1" class="val">—</div><div class="label">1 min</div></div>
      <div class="load-item"><div id="load5" class="val">—</div><div class="label">5 min</div></div>
      <div class="load-item"><div id="load15" class="val">—</div><div class="label">15 min</div></div>
    </div>
    <div style="margin-top: 12px;" id="sysDetails"></div>
  </div>

  <!-- Disks -->
  <div class="card">
    <div class="card-title">💿 Disks</div>
    <div id="disks">—</div>
  </div>

  <!-- Network -->
  <div class="card">
    <div class="card-title">🌐 Network</div>
    <div id="network">—</div>
  </div>

  <!-- Processes -->
  <div class="card card-full">
    <div class="card-title">⚙️ Processes <span id="procCount" style="font-weight: normal; color: var(--text-dim)">(0)</span></div>
    <div style="overflow-x: auto;">
      <table class="process-table">
        <thead>
          <tr>
            <th data-sort="pid">PID</th>
            <th data-sort="user">USER</th>
            <th data-sort="cpu" class="sorted">CPU%</th>
            <th data-sort="mem">MEM%</th>
            <th data-sort="rss">RSS</th>
            <th data-sort="command">COMMAND</th>
          </tr>
        </thead>
        <tbody id="processBody"></tbody>
      </table>
    </div>
  </div>
</div>

<script>
// State
let currentSort = { key: 'cpu', desc: true };
let latestData = null;

// Formatters
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(i > 1 ? 1 : 0) + ' ' + units[i];
}

function formatRate(bytesPerSec) {
  if (bytesPerSec < 1024) return bytesPerSec + ' B/s';
  if (bytesPerSec < 1048576) return (bytesPerSec / 1024).toFixed(1) + ' KB/s';
  return (bytesPerSec / 1048576).toFixed(1) + ' MB/s';
}

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return d + 'd ' + h + 'h ' + m + 'm';
  if (h > 0) return h + 'h ' + m + 'm';
  return m + 'm';
}

function getColorClass(percent) {
  if (percent < 50) return 'green';
  if (percent < 75) return 'yellow';
  if (percent < 90) return 'orange';
  return 'red';
}

function getBarColorClass(percent) {
  return 'bar-' + getColorClass(percent);
}

// Update functions
function updateCPU(cpu) {
  const el = document.getElementById('cpuTotal');
  el.textContent = cpu.total + '%';
  el.className = 'big-number ' + getColorClass(cpu.total);

  const bar = document.getElementById('cpuBar');
  bar.style.width = cpu.total + '%';
  bar.className = 'bar-fill ' + getBarColorClass(cpu.total);

  const coresEl = document.getElementById('cpuCores');
  if (cpu.cores.length <= 32) {
    coresEl.innerHTML = cpu.cores.map((usage, i) =>
      '<div class="core-bar">' +
        '<div class="core-bar-fill ' + getBarColorClass(usage) + '" style="height:' + usage + '%"></div>' +
        '<div class="core-bar-label">' + usage + '</div>' +
      '</div>'
    ).join('');
  } else {
    coresEl.innerHTML = '<div style="font-size:12px;color:var(--text-dim)">' + cpu.cores.length + ' cores</div>';
  }
}

function updateMemory(mem) {
  const el = document.getElementById('memTotal');
  el.textContent = mem.percent + '%';
  el.className = 'big-number ' + getColorClass(mem.percent);

  const bar = document.getElementById('memBar');
  bar.style.width = mem.percent + '%';
  bar.className = 'bar-fill ' + getBarColorClass(mem.percent);

  document.getElementById('memDetails').innerHTML =
    '<div class="stat-row"><span class="stat-label">Used</span><span class="stat-value">' + formatBytes(mem.used) + '</span></div>' +
    '<div class="stat-row"><span class="stat-label">Free</span><span class="stat-value">' + formatBytes(mem.free) + '</span></div>' +
    '<div class="stat-row"><span class="stat-label">Total</span><span class="stat-value">' + formatBytes(mem.total) + '</span></div>';

  if (mem.swap && mem.swap.total > 0) {
    document.getElementById('swapSection').style.display = 'block';
    document.getElementById('swapPercent').textContent = mem.swap.percent + '%';
    const swapBar = document.getElementById('swapBar');
    swapBar.style.width = mem.swap.percent + '%';
    swapBar.className = 'bar-fill ' + getBarColorClass(mem.swap.percent);
    document.getElementById('swapDetails').innerHTML =
      '<div class="stat-row"><span class="stat-label">Used</span><span class="stat-value">' + formatBytes(mem.swap.used) + '</span></div>' +
      '<div class="stat-row"><span class="stat-label">Total</span><span class="stat-value">' + formatBytes(mem.swap.total) + '</span></div>';
  }
}

function updateDisks(disks) {
  if (!disks.length) {
    document.getElementById('disks').innerHTML = '<div style="color:var(--text-dim)">No disks found</div>';
    return;
  }
  document.getElementById('disks').innerHTML = disks.map(d =>
    '<div class="disk-item">' +
      '<div class="disk-name"><span>' + d.mount + '</span><span>' + d.percent + '% (' + formatBytes(d.used) + ' / ' + formatBytes(d.total) + ')</span></div>' +
      '<div class="bar-container"><div class="bar-fill ' + getBarColorClass(d.percent) + '" style="width:' + d.percent + '%"></div></div>' +
    '</div>'
  ).join('');
}

function updateNetwork(net) {
  if (!net.length) {
    document.getElementById('network').innerHTML = '<div style="color:var(--text-dim)">No interfaces found</div>';
    return;
  }
  document.getElementById('network').innerHTML = net.map(n =>
    '<div class="net-item">' +
      '<div class="net-name">' + n.name + (n.ip ? ' <span style="color:var(--text-dim);font-size:12px;font-weight:normal">' + n.ip + '</span>' : '') + '</div>' +
      '<div class="net-rates">' +
        '<span class="rx">↓ ' + formatRate(n.rxRate) + '</span>' +
        '<span class="tx">↑ ' + formatRate(n.txRate) + '</span>' +
      '</div>' +
      '<div style="font-size:11px;color:var(--text-dim);margin-top:2px">Total: ↓ ' + formatBytes(n.rxBytes) + '  ↑ ' + formatBytes(n.txBytes) + '</div>' +
    '</div>'
  ).join('');
}

function updateProcesses(procs) {
  document.getElementById('procCount').textContent = '(' + procs.length + ')';

  // Sort
  const sorted = [...procs].sort((a, b) => {
    let va = a[currentSort.key];
    let vb = b[currentSort.key];
    if (typeof va === 'string') {
      return currentSort.desc ? vb.localeCompare(va) : va.localeCompare(vb);
    }
    return currentSort.desc ? vb - va : va - vb;
  });

  document.getElementById('processBody').innerHTML = sorted.map(p =>
    '<tr>' +
      '<td>' + p.pid + '</td>' +
      '<td>' + p.user + '</td>' +
      '<td style="color:' + (p.cpu > 50 ? 'var(--red)' : p.cpu > 20 ? 'var(--yellow)' : 'var(--text)') + '">' + p.cpu.toFixed(1) + '</td>' +
      '<td style="color:' + (p.mem > 50 ? 'var(--red)' : p.mem > 20 ? 'var(--yellow)' : 'var(--text)') + '">' + p.mem.toFixed(1) + '</td>' +
      '<td>' + formatBytes(p.rss) + '</td>' +
      '<td title="' + escapeHtml(p.command) + '">' + escapeHtml(p.command.substring(0, 80)) + '</td>' +
    '</tr>'
  ).join('');
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function updateSystem(sys) {
  document.getElementById('hostname').textContent = sys.hostname;
  document.getElementById('uptime').textContent = '⏱ ' + formatUptime(sys.uptime);

  document.getElementById('load1').textContent = sys.loadAvg[0].toFixed(2);
  document.getElementById('load5').textContent = sys.loadAvg[1].toFixed(2);
  document.getElementById('load15').textContent = sys.loadAvg[2].toFixed(2);

  // Color load values based on CPU count
  const cpuCount = sys.cpuCount || 1;
  ['load1', 'load5', 'load15'].forEach((id, i) => {
    const el = document.getElementById(id);
    const ratio = sys.loadAvg[i] / cpuCount;
    el.style.color = ratio < 0.7 ? 'var(--green)' : ratio < 1.0 ? 'var(--yellow)' : ratio < 1.5 ? 'var(--orange)' : 'var(--red)';
  });

  document.getElementById('sysDetails').innerHTML =
    '<div class="stat-row"><span class="stat-label">OS</span><span class="stat-value">' + sys.platform + ' ' + sys.arch + '</span></div>' +
    '<div class="stat-row"><span class="stat-label">Kernel</span><span class="stat-value">' + sys.release + '</span></div>' +
    '<div class="stat-row"><span class="stat-label">CPU</span><span class="stat-value">' + sys.cpuCount + '× ' + (sys.cpuModel.length > 30 ? sys.cpuModel.substring(0, 30) + '…' : sys.cpuModel) + '</span></div>' +
    '<div class="stat-row"><span class="stat-label">Node</span><span class="stat-value">' + sys.nodeVersion + '</span></div>';
}

// Theme
function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('webstat-theme', next);
}

// Restore theme
const savedTheme = localStorage.getItem('webstat-theme');
if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);

// Sort handler
document.querySelectorAll('.process-table th[data-sort]').forEach(th => {
  th.addEventListener('click', () => {
    const key = th.dataset.sort;
    if (currentSort.key === key) {
      currentSort.desc = !currentSort.desc;
    } else {
      currentSort = { key, desc: true };
    }
    document.querySelectorAll('.process-table th').forEach(h => h.classList.remove('sorted'));
    th.classList.add('sorted');
    if (latestData) updateProcesses(latestData.processes);
  });
});

// SSE Connection
function connect() {
  const dot = document.getElementById('statusDot');
  const text = document.getElementById('statusText');

  const es = new EventSource('/api/stream');

  es.onopen = () => {
    dot.classList.remove('disconnected');
    text.textContent = 'live';
  };

  es.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      latestData = data;
      updateCPU(data.cpu);
      updateMemory(data.memory);
      updateDisks(data.disks);
      updateNetwork(data.network);
      updateProcesses(data.processes);
      updateSystem(data.system);
    } catch (e) {
      console.error('Parse error:', e);
    }
  };

  es.onerror = () => {
    dot.classList.add('disconnected');
    text.textContent = 'reconnecting…';
    es.close();
    setTimeout(connect, 2000);
  };
}

connect();
</script>
</body>
</html>`;
}

module.exports = { getDashboardHTML };
