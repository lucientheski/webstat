'use strict';

const os = require('os');
const fs = require('fs');
const { execSync } = require('child_process');

// Store previous CPU times for delta calculation
let prevCpuTimes = null;

/**
 * Read a file from /proc, return empty string on failure
 */
function readProc(path) {
  try {
    return fs.readFileSync(path, 'utf8');
  } catch {
    return '';
  }
}

/**
 * Calculate CPU usage percentages from delta between two readings
 */
function getCpuUsage() {
  const cpus = os.cpus();
  const current = cpus.map(cpu => ({
    user: cpu.times.user,
    nice: cpu.times.nice,
    sys: cpu.times.sys,
    idle: cpu.times.idle,
    irq: cpu.times.irq,
  }));

  if (!prevCpuTimes) {
    prevCpuTimes = current;
    return { cores: cpus.map(() => 0), total: 0 };
  }

  const cores = current.map((cur, i) => {
    const prev = prevCpuTimes[i];
    const totalDelta =
      (cur.user - prev.user) +
      (cur.nice - prev.nice) +
      (cur.sys - prev.sys) +
      (cur.idle - prev.idle) +
      (cur.irq - prev.irq);
    const idleDelta = cur.idle - prev.idle;
    return totalDelta === 0 ? 0 : Math.round(((totalDelta - idleDelta) / totalDelta) * 100);
  });

  const totalUsage = cores.length > 0
    ? Math.round(cores.reduce((a, b) => a + b, 0) / cores.length)
    : 0;

  prevCpuTimes = current;
  return { cores, total: totalUsage };
}

/**
 * Get memory information
 */
function getMemory() {
  const total = os.totalmem();
  const free = os.freemem();
  const used = total - free;

  const result = {
    total,
    used,
    free,
    percent: Math.round((used / total) * 100),
    swap: null,
  };

  // Try to get swap info from /proc/meminfo (Linux only)
  const meminfo = readProc('/proc/meminfo');
  if (meminfo) {
    const swapTotal = meminfo.match(/SwapTotal:\s+(\d+)/);
    const swapFree = meminfo.match(/SwapFree:\s+(\d+)/);
    if (swapTotal && swapFree) {
      const st = parseInt(swapTotal[1], 10) * 1024;
      const sf = parseInt(swapFree[1], 10) * 1024;
      result.swap = {
        total: st,
        used: st - sf,
        free: sf,
        percent: st === 0 ? 0 : Math.round(((st - sf) / st) * 100),
      };
    }
  }

  return result;
}

/**
 * Get disk usage via df command
 */
function getDisks() {
  try {
    const output = execSync('df -B1 --output=source,fstype,size,used,avail,pcent,target 2>/dev/null || df -k 2>/dev/null', {
      encoding: 'utf8',
      timeout: 3000,
    });

    const lines = output.trim().split('\n').slice(1); // skip header
    const disks = [];

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 7) {
        const source = parts[0];
        const fstype = parts[1];
        const mount = parts.slice(6).join(' ');

        // Skip pseudo/virtual filesystems
        const skipTypes = ['devtmpfs', 'devpts', 'proc', 'sysfs', 'cgroup', 'cgroup2',
          'securityfs', 'pstore', 'debugfs', 'tracefs', 'configfs', 'fusectl',
          'mqueue', 'hugetlbfs', 'binfmt_misc', 'efivarfs', 'autofs', 'nsfs'];
        const skipMounts = ['/proc', '/sys', '/dev', '/run/lock', '/run/snapd',
          '/snap/', '/var/lib/docker'];

        if (skipTypes.includes(fstype)) continue;
        if (skipMounts.some(m => mount.startsWith(m))) continue;
        if (source === 'none' || source === 'tmpfs' || source === 'udev') continue;

        const total = parseInt(parts[2], 10);
        if (total === 0) continue; // skip zero-size filesystems

        disks.push({
          filesystem: source,
          type: fstype,
          total,
          used: parseInt(parts[3], 10),
          available: parseInt(parts[4], 10),
          percent: parseInt(parts[5].replace('%', ''), 10),
          mount,
        });
      }
    }

    return disks;
  } catch {
    return [];
  }
}

// Store previous network bytes for throughput calculation
let prevNetBytes = null;
let prevNetTime = null;

/**
 * Get network interfaces with throughput
 */
function getNetwork() {
  const interfaces = os.networkInterfaces();
  const result = [];

  // Try /proc/net/dev for byte counters (Linux)
  const netDev = readProc('/proc/net/dev');
  const currentBytes = {};
  const now = Date.now();

  if (netDev) {
    const lines = netDev.trim().split('\n').slice(2); // skip headers
    for (const line of lines) {
      const match = line.trim().match(/^(\S+):\s+(\d+)\s+\d+\s+\d+\s+\d+\s+\d+\s+\d+\s+\d+\s+\d+\s+(\d+)/);
      if (match) {
        const iface = match[1];
        currentBytes[iface] = {
          rxBytes: parseInt(match[2], 10),
          txBytes: parseInt(match[3], 10),
        };
      }
    }
  }

  for (const [name, addrs] of Object.entries(interfaces)) {
    if (name === 'lo') continue; // skip loopback
    if (name.startsWith('veth')) continue; // skip Docker veth pairs
    if (name.startsWith('br-')) continue; // skip Docker bridge networks

    const ipv4 = addrs.find(a => a.family === 'IPv4');
    const entry = {
      name,
      ip: ipv4 ? ipv4.address : null,
      mac: addrs[0]?.mac || null,
      rxBytes: currentBytes[name]?.rxBytes || 0,
      txBytes: currentBytes[name]?.txBytes || 0,
      rxRate: 0,
      txRate: 0,
    };

    // Calculate throughput rate
    if (prevNetBytes && prevNetBytes[name] && prevNetTime) {
      const elapsed = (now - prevNetTime) / 1000;
      if (elapsed > 0) {
        entry.rxRate = Math.round((entry.rxBytes - prevNetBytes[name].rxBytes) / elapsed);
        entry.txRate = Math.round((entry.txBytes - prevNetBytes[name].txBytes) / elapsed);
      }
    }

    result.push(entry);
  }

  prevNetBytes = currentBytes;
  prevNetTime = now;

  return result;
}

/**
 * Get top processes (Linux only via /proc)
 */
function getProcesses(limit = 20) {
  try {
    // Use ps for cross-platform compatibility
    const output = execSync(
      'ps aux --sort=-%cpu 2>/dev/null || ps aux 2>/dev/null',
      { encoding: 'utf8', timeout: 3000 }
    );

    const lines = output.trim().split('\n').slice(1); // skip header
    const totalMem = os.totalmem();
    const processes = [];

    for (const line of lines.slice(0, limit)) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 11) {
        processes.push({
          user: parts[0],
          pid: parseInt(parts[1], 10),
          cpu: parseFloat(parts[2]),
          mem: parseFloat(parts[3]),
          vsz: parseInt(parts[4], 10) * 1024,
          rss: parseInt(parts[5], 10) * 1024,
          stat: parts[7],
          started: parts[8],
          time: parts[9],
          command: parts.slice(10).join(' ').substring(0, 200),
        });
      }
    }

    return processes;
  } catch {
    return [];
  }
}

/**
 * Get system information
 */
function getSystemInfo() {
  return {
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    release: os.release(),
    uptime: os.uptime(),
    loadAvg: os.loadavg(),
    cpuModel: os.cpus()[0]?.model || 'Unknown',
    cpuCount: os.cpus().length,
    nodeVersion: process.version,
  };
}

/**
 * Collect all metrics
 */
function collectAll() {
  return {
    timestamp: Date.now(),
    cpu: getCpuUsage(),
    memory: getMemory(),
    disks: getDisks(),
    network: getNetwork(),
    processes: getProcesses(),
    system: getSystemInfo(),
  };
}

module.exports = { collectAll };
