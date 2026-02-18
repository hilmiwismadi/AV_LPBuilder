import express from "express";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const router = express.Router();

// GET /whatsapp — fetch WA-filtered logs from sales-crm-backend
// NOTE: Must be defined BEFORE /:serviceName to avoid param capture
router.get("/whatsapp", async (req, res) => {
  try {
    const { lines = 500 } = req.query;
    const numLines = Math.min(parseInt(lines) || 500, 1000);

    const { stdout } = await execAsync(
      `pm2 logs sales-crm-backend --lines ${numLines} --nostream`
    );

    // Strip ANSI color codes before filtering/processing
    const stripAnsi = (str) => str.replace(/\x1b\[[0-9;]*m/g, "");

    // Specific patterns — avoid matching stack trace paths like "whatsappService.js"
    const waKeywords = [
      "[WA-",                        // [WA-CREATE], [WA-QR], etc.
      "WhatsApp client",             // "WhatsApp client authenticated!", "WhatsApp client is ready!"
      "Sending message to:",         // outgoing send attempt
      "Message sent successfully",   // send confirmation
      "WhatsApp send failed",        // send failure
      "Restarting WhatsApp service", // restart event
      "Initializing WhatsApp service", // init event
    ];

    const allLines = stdout.split("\n").map(stripAnsi).filter((l) => l.trim());
    const waLines = allLines.filter((line) =>
      waKeywords.some((kw) => line.includes(kw))
    );

    const formattedLogs = waLines.map((line, index) => {
      let type = "info";
      if (line.includes("Incoming") || line.includes("incoming")) {
        type = "incoming";
      } else if (
        line.includes("Outgoing") ||
        line.includes("outgoing") ||
        line.includes("Sending message to:") ||
        line.includes("Message sent successfully")
      ) {
        type = "outgoing";
      } else if (
        line.toLowerCase().includes("error") ||
        line.toLowerCase().includes("failed") ||
        line.toLowerCase().includes("skipping")
      ) {
        type = "error";
      } else if (
        line.includes("authenticated") ||
        line.includes("ready") ||
        line.includes("Initializing") ||
        line.includes("Restarting")
      ) {
        type = "status";
      }

      // Strip PM2 prefix like "10|sales-c | "
      const messageMatch = line.match(/^\d+\|[^|]+\|\s*(.+)$/);
      const message = messageMatch ? messageMatch[1].trim() : line.trim();

      return { id: index, type, message, raw: line };
    });

    res.json({ logs: formattedLogs, total: formattedLogs.length, lines: numLines });
  } catch (error) {
    console.error("Error fetching WA logs:", error);
    res.status(500).json({ error: "Failed to fetch WA logs", details: error.message });
  }
});

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
