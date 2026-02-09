import express from "express";
import { exec } from "child_process";
import { promisify } from "util";
import os from "os";

const execAsync = promisify(exec);
const router = express.Router();

// Store previous CPU times for calculation
let previousCpuTimes = null;

function getCpuUsage() {
  const cpus = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;

  cpus.forEach(cpu => {
    for (const type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  });

  const idle = totalIdle;
  const total = totalTick;

  if (previousCpuTimes) {
    const idleDiff = idle - previousCpuTimes.idle;
    const totalDiff = total - previousCpuTimes.total;
    const usage = 100 - (100 * (idleDiff / totalDiff));
    previousCpuTimes = { idle, total };
    return Math.min(100, Math.max(0, usage)).toFixed(2);
  }

  previousCpuTimes = { idle, total };
  return "0.00";
}

router.get("/metrics", async (req, res) => {
  try {
    // Get PM2 processes
    const { stdout: pm2Output } = await execAsync("pm2 jlist");
    const processes = JSON.parse(pm2Output);

    // Get memory info
    const { stdout: memOutput } = await execAsync("free -b");
    const memLines = memOutput.split("\n");
    const memData = memLines[1].split(/\s+/);
    const memory = {
      total: parseInt(memData[1]),
      used: parseInt(memData[2]),
      free: parseInt(memData[3]),
      available: parseInt(memData[6])
    };

    // Get disk info
    const { stdout: diskOutput } = await execAsync("df -B1 /");
    const diskLines = diskOutput.split("\n");
    const diskData = diskLines[1].split(/\s+/);
    const disk = {
      total: parseInt(diskData[1]),
      used: parseInt(diskData[2]),
      available: parseInt(diskData[3]),
      percentage: diskData[4]
    };

    // Get CPU info
    const cpuInfo = os.cpus();
    const loadAvg = os.loadavg();
    const cpuUsage = getCpuUsage();
    
    const cpu = {
      model: cpuInfo[0]?.model || "Unknown",
      cores: cpuInfo.length,
      current: cpuUsage,
      loadAverage: loadAvg[0].toFixed(2),
      speed: cpuInfo[0]?.speed || 0
    };

    // Get system uptime
    const uptime = os.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const uptimeStr = days > 0 
      ? `${days}d ${hours}h ${minutes}m` 
      : hours > 0 
        ? `${hours}h ${minutes}m` 
        : `${minutes}m`;

    // Get system info
    const { stdout: loadOutput } = await execAsync("cat /proc/loadavg");
    const loadParts = loadOutput.trim().split(/\s+/);
    const loadAverage = parseFloat(loadParts[0]);

    const system = {
      uptime: uptimeStr,
      loadaverage: loadAverage,
      processes: parseInt(loadParts[3])
    };

    res.json({
      memory,
      disk,
      cpu,
      system,
      processes: processes.map(p => ({
        pid: p.pid,
        name: p.name,
        status: p.status,
        memory: p.monit?.memory || 0,
        cpu: p.monit?.cpu || 0,
        restarts: p.restart_time
      }))
    });
  } catch (error) {
    console.error("Error fetching system metrics:", error);
    res.status(500).json({ error: "Failed to fetch system metrics", details: error.message });
  }
});

export default router;
