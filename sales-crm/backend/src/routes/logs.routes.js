import express from "express";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const router = express.Router();

router.get("/:serviceName", async (req, res) => {
  try {
    const { serviceName } = req.params;
    const { lines = 100, type = "all" } = req.query;
    const numLines = parseInt(lines) || 100;

    let command = "pm2 logs " + serviceName + " --lines " + numLines + " --nostream";

    if (type === "error") {
      command += " --err";
    } else if (type === "out") {
      command += " --out";
    }

    const { stdout, stderr } = await execAsync(command);

    if (stderr && !stdout) {
      return res.status(500).json({ error: "Failed to fetch logs", details: stderr });
    }

    const logLines = stdout.split("\n").filter(line => line.trim());

    const formattedLogs = logLines.map((line, index) => {
      const pm2Match = line.match(/^(\d+)|([^\t]+)|(.+)$/);
      
      if (pm2Match) {
        return {
          id: index,
          pid: pm2Match[1],
          process: pm2Match[2],
          message: pm2Match[3],
          timestamp: new Date().toISOString(),
          raw: line
        };
      }

      return {
        id: index,
        pid: null,
        process: null,
        message: line,
        timestamp: new Date().toISOString(),
        raw: line
      };
    });

    res.json({
      logs: formattedLogs,
      total: formattedLogs.length,
      type,
      lines: numLines,
      service: serviceName
    });
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({ error: "Failed to fetch logs", details: error.message });
  }
});

router.get("/:serviceName/status", async (req, res) => {
  try {
    const { serviceName } = req.params;
    const { stdout } = await execAsync("pm2 jlist");
    const processes = JSON.parse(stdout);
    
    const targetProcess = processes.find(p => p.name === serviceName);
    
    if (!targetProcess) {
      return res.status(404).json({ error: "Process not found", service: serviceName });
    }

    res.json({
      name: targetProcess.name,
      pid: targetProcess.pid,
      status: targetProcess.status,
      uptime: targetProcess.pm_uptime,
      restarts: targetProcess.restart_time,
      memory: targetProcess.monit?.memory,
      cpu: targetProcess.monit?.cpu
    });
  } catch (error) {
    console.error("Error fetching status:", error);
    res.status(500).json({ error: "Failed to fetch status" });
  }
});

router.post("/:serviceName/restart", async (req, res) => {
  try {
    const { serviceName } = req.params;
    const { stdout } = await execAsync("pm2 restart " + serviceName);
    res.json({ message: "Service restarted successfully", output: stdout, service: serviceName });
  } catch (error) {
    console.error("Error restarting service:", error);
    res.status(500).json({ error: "Failed to restart service", details: error.message });
  }
});

router.post("/:serviceName/flush", async (req, res) => {
  try {
    const { serviceName } = req.params;
    const { stdout } = await execAsync("pm2 flush " + serviceName);
    res.json({ message: "Logs flushed successfully", output: stdout, service: serviceName });
  } catch (error) {
    console.error("Error flushing logs:", error);
    res.status(500).json({ error: "Failed to flush logs", details: error.message });
  }
});

export default router;
