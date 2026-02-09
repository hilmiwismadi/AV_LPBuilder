import React, { useState, useEffect, useRef } from "react";
import { logsAPI } from "../services/api";
import "./LogsPage.css";

const AVAILABLE_SERVICES = [
  { id: "sales-crm-backend", name: "Sales CRM Backend", port: 3002 },
  { id: "lpbuilder-backend", name: "LP Builder Backend", port: 3001 },
  { id: "sales-crm-frontend", name: "Sales CRM Frontend", port: 5174 },
];

const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [logType, setLogType] = useState("all");
  const [numLines, setNumLines] = useState(100);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedLine, setCopiedLine] = useState(null);
  const [selectedService, setSelectedService] = useState(AVAILABLE_SERVICES[0]);
  const intervalRef = useRef(null);
  const logContainerRef = useRef(null);

  useEffect(() => {
    fetchLogs();
    fetchStatus();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [logType, numLines, selectedService]);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchLogs();
        fetchStatus();
      }, 3000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, logType, numLines, selectedService]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await logsAPI.getLogs(selectedService.id, numLines, logType);
      setLogs(response.data.logs);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatus = async () => {
    try {
      const response = await logsAPI.getStatus(selectedService.id);
      setStatus(response.data);
    } catch (error) {
      console.error("Failed to fetch status:", error);
    }
  };

  const handleRestart = async () => {
    const confirmMsg = "Restart " + selectedService.name + "?";
    if (!window.confirm(confirmMsg)) return;
    try {
      await logsAPI.restartService(selectedService.id);
      alert(selectedService.name + " restarted");
      fetchStatus();
      fetchLogs();
    } catch (error) {
      alert("Failed: " + error.message);
    }
  };

  const handleFlush = async () => {
    if (!window.confirm("Flush all logs?")) return;
    try {
      await logsAPI.flushService(selectedService.id);
      alert("Logs flushed");
      fetchLogs();
    } catch (error) {
      alert("Failed: " + error.message);
    }
  };

  const handleCopyLine = (log) => {
    navigator.clipboard.writeText(log.raw).then(() => {
      setCopiedLine(log.id);
      setTimeout(() => setCopiedLine(null), 2000);
    });
  };

  const handleCopyAll = () => {
    const text = logs.map(l => l.raw).join("\n");
    navigator.clipboard.writeText(text).then(() => {
      alert("Copied!");
    });
  };

  const filteredLogs = logs.filter(log =>
    log.raw.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.message && log.message.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatMemory = (bytes) => !bytes ? "N/A" : (bytes / 1024 / 1024).toFixed(2) + " MB";

  const formatUptime = (ms) => {
    if (!ms) return "N/A";
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (d > 0) return d + "d " + (h % 24) + "h " + (m % 60) + "m";
    if (h > 0) return h + "h " + (m % 60) + "m";
    if (m > 0) return m + "m " + (s % 60) + "s";
    return s + "s";
  };

  return (
    <div className="logs-page">
      <div className="logs-header">
        <h1>System Logs Viewer</h1>
        {status && (
          <div className="status-panel">
            <div className={"status-indicator " + status.status}>
              <span className="status-dot"></span>
              <span className="status-text">{(status.status || "UNKNOWN").toUpperCase()}</span>
            </div>
            <div className="status-info">
              <span className="service-name">{selectedService.name}</span>
              <span>PID: {status.pid}</span>
              <span>Memory: {formatMemory(status.memory)}</span>
              <span>Uptime: {formatUptime(status.uptime)}</span>
              <span>Restarts: {status.restarts}</span>
            </div>
          </div>
        )}
      </div>

      <div className="logs-controls">
        <div className="control-group">
          <label>Service:</label>
          <select value={selectedService.id} onChange={(e) => {
            const svc = AVAILABLE_SERVICES.find(s => s.id === e.target.value);
            setSelectedService(svc);
            setLogs([]);
            setStatus(null);
          }}>
            {AVAILABLE_SERVICES.map(s => <option key={s.id} value={s.id}>{s.name} (Port {s.port})</option>)}
          </select>
        </div>

        <div className="control-group">
          <label>Log Type:</label>
          <select value={logType} onChange={e => setLogType(e.target.value)}>
            <option value="all">All Logs</option>
            <option value="out">Output Only</option>
            <option value="error">Errors Only</option>
          </select>
        </div>

        <div className="control-group">
          <label>Lines:</label>
          <select value={numLines} onChange={e => setNumLines(parseInt(e.target.value))}>
            <option value="50">Last 50</option>
            <option value="100">Last 100</option>
            <option value="200">Last 200</option>
            <option value="500">Last 500</option>
          </select>
        </div>

        <div className="control-group">
          <label><input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} /> Auto Refresh (3s)</label>
        </div>

        <div className="control-group search-group">
          <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="search-input" />
        </div>

        <button onClick={fetchLogs} disabled={loading} className="btn-refresh">{loading ? "Refreshing..." : "Refresh"}</button>
        <button onClick={handleCopyAll} className="btn-copy">Copy All</button>
        <button onClick={handleFlush} className="btn-flush">Flush</button>
        <button onClick={handleRestart} className="btn-restart">Restart</button>
      </div>

      <div className="logs-stats">
        <span>Showing {filteredLogs.length} of {logs.length} lines</span>
      </div>

      <div className="logs-container" ref={logContainerRef}>
        {filteredLogs.length === 0 ? (
          <div className="no-logs">{loading ? "Loading..." : "No logs"}</div>
        ) : (
          <div className="logs-list">
            {filteredLogs.map((log) => (
              <div key={log.id} className={"log-line " + (log.process && log.process.includes("error") ? "error" : "")} onClick={() => handleCopyLine(log)} title="Click to copy">
                <span className="log-meta">{log.pid && <span className="log-pid">[{log.pid}]</span>}{log.process && <span className="log-process">{log.process}</span>}</span>
                <span className="log-message">{log.message || log.raw}</span>
                {copiedLine === log.id && <span className="copied-badge">Copied!</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LogsPage;
