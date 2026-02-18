import React, { useState, useEffect, useRef, useCallback } from "react";
import { waLogsAPI } from "../services/api";
import "./WALogsPage.css";

const TYPE_COLORS = {
  incoming: "#818cf8",
  outgoing: "#34d399",
  error: "#f87171",
  status: "#fbbf24",
  info: "#94a3b8",
};

const TYPE_LABELS = {
  incoming: "Incoming",
  outgoing: "Outgoing",
  error: "Error/Skip",
  status: "Status",
  info: "Info",
};

const WALogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [numLines, setNumLines] = useState(500);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const intervalRef = useRef(null);
  const containerRef = useRef(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await waLogsAPI.getLogs(numLines);
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error("Failed to fetch WA logs:", err);
    } finally {
      setLoading(false);
    }
  }, [numLines]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchLogs, 3000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [autoRefresh, fetchLogs]);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      !searchTerm ||
      log.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || log.type === filterType;
    return matchesSearch && matchesType;
  });

  const counts = {
    incoming: logs.filter((l) => l.type === "incoming").length,
    outgoing: logs.filter((l) => l.type === "outgoing").length,
    error: logs.filter((l) => l.type === "error").length,
    status: logs.filter((l) => l.type === "status").length,
  };

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  return (
    <div className="wa-logs-page">
      <div className="wa-logs-header">
        <div className="wa-logs-title">
          <span className="wa-icon">📱</span>
          <h1>WhatsApp Chat Logs</h1>
          {loading && <span className="wa-loading-dot">●</span>}
        </div>
        <div className="wa-legend">
          {Object.entries(TYPE_LABELS).map(([type, label]) => (
            <span
              key={type}
              className="wa-legend-item"
              style={{ color: TYPE_COLORS[type] }}
            >
              ● {label}
            </span>
          ))}
        </div>
      </div>

      <div className="wa-logs-controls">
        <select
          value={numLines}
          onChange={(e) => setNumLines(Number(e.target.value))}
          className="wa-select"
        >
          <option value={200}>Last 200 lines</option>
          <option value={500}>Last 500 lines</option>
          <option value={1000}>Last 1000 lines</option>
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="wa-select"
        >
          <option value="all">All Events</option>
          <option value="incoming">Incoming only</option>
          <option value="outgoing">Outgoing only</option>
          <option value="error">Errors/Skips</option>
          <option value="status">Status only</option>
        </select>

        <input
          type="text"
          placeholder="Search logs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="wa-search"
        />

        <label className="wa-toggle">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
          />
          Auto Refresh (3s)
        </label>

        <button onClick={fetchLogs} className="wa-btn" disabled={loading}>
          {loading ? "..." : "Refresh"}
        </button>
        <button onClick={scrollToBottom} className="wa-btn wa-btn-secondary">
          ↓ Bottom
        </button>
      </div>

      <div className="wa-stats">
        <span>
          Showing <strong>{filteredLogs.length}</strong> of{" "}
          <strong>{logs.length}</strong> WA events
        </span>
        {counts.incoming > 0 && (
          <span className="wa-stat-badge" style={{ color: TYPE_COLORS.incoming }}>
            ● {counts.incoming} incoming
          </span>
        )}
        {counts.outgoing > 0 && (
          <span className="wa-stat-badge" style={{ color: TYPE_COLORS.outgoing }}>
            ● {counts.outgoing} outgoing
          </span>
        )}
        {counts.error > 0 && (
          <span className="wa-stat-badge" style={{ color: TYPE_COLORS.error }}>
            ● {counts.error} errors
          </span>
        )}
        {counts.status > 0 && (
          <span className="wa-stat-badge" style={{ color: TYPE_COLORS.status }}>
            ● {counts.status} status
          </span>
        )}
      </div>

      <div className="wa-logs-container" ref={containerRef}>
        {filteredLogs.length === 0 ? (
          <div className="wa-empty">
            {loading ? "Loading WhatsApp logs..." : "No WhatsApp logs found"}
          </div>
        ) : (
          <div className="wa-logs-list">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className={`wa-log-line wa-log-${log.type}`}
                title={log.raw}
              >
                <span
                  className="wa-dot"
                  style={{ color: TYPE_COLORS[log.type] || TYPE_COLORS.info }}
                >
                  ●
                </span>
                <span className="wa-message">{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WALogsPage;
