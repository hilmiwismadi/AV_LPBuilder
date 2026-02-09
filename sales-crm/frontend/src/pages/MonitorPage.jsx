import React, { useEffect, useState } from "react";
import { monitorAPI } from "../services/api";
import "./MonitorPage.css";

const MonitorPage = () => {
  const [metrics, setMetrics] = useState({
    memory: null,
    disk: null,
    cpu: null,
    system: null,
    processes: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await monitorAPI.getAllMetrics();
        setMetrics({ ...response.data, loading: false, error: null });
      } catch (error) {
        console.error("Failed to fetch metrics:", error);
        setMetrics(prev => ({ ...prev, error: error.message, loading: false }));
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes) => {
    if (!bytes) return "N/A";
    const gb = bytes / 1024 / 1024 / 1024;
    if (gb >= 1) return gb.toFixed(2) + " GB";
    const mb = bytes / 1024 / 1024;
    if (mb >= 1) return mb.toFixed(2) + " MB";
    return bytes.toFixed(0) + " B";
  };

  const getPercentage = (used, total) => {
    if (total === 0) return 0;
    return ((used / total) * 100).toFixed(1);
  };

  const getColorClass = (percentage) => {
    if (percentage >= 80) return "critical";
    if (percentage >= 60) return "warning";
    return "normal";
  };

  const cpuValue = parseFloat(metrics.cpu?.current || 0);

  return (
    <div className="monitor-page">
      <div className="monitor-header">
        <h1>System Monitor</h1>
        <p>Your VPS health dashboard</p>
      </div>

      {metrics.loading && !metrics.error && (
        <div className="loading">Loading system metrics...</div>
      )}

      {metrics.error && (
        <div className="error-message">Error: {metrics.error}</div>
      )}

      {!metrics.loading && !metrics.error && metrics.memory && (
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-icon">💾</span>
              <h3>Memory</h3>
            </div>
            <div className="metric-body">
              <div className="metric-main">
                <div className="metric-value">
                  {formatBytes(metrics.memory.used)}
                  <span className="metric-total"> / {formatBytes(metrics.memory.total)}</span>
                </div>
                <div className="metric-progress">
                  <div className="progress-bar">
                    <div
                      className={"progress-fill " + getColorClass(getPercentage(metrics.memory.used, metrics.memory.total))}
                      style={{ width: getPercentage(metrics.memory.used, metrics.memory.total) + "%" }}
                    ></div>
                  </div>
                  <div className="metric-label">
                    {getPercentage(metrics.memory.used, metrics.memory.total)}% Used
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-icon">💿</span>
              <h3>Disk</h3>
            </div>
            <div className="metric-body">
              <div className="metric-main">
                <div className="metric-value">
                  {formatBytes(metrics.disk.used)}
                  <span className="metric-total"> / {formatBytes(metrics.disk.total)}</span>
                </div>
                <div className="metric-progress">
                  <div className="progress-bar">
                    <div
                      className={"progress-fill " + getColorClass(getPercentage(metrics.disk.used, metrics.disk.total))}
                      style={{ width: getPercentage(metrics.disk.used, metrics.disk.total) + "%" }}
                    ></div>
                  </div>
                  <div className="metric-label">
                    {getPercentage(metrics.disk.used, metrics.disk.total)}% Used
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-icon">⚡</span>
              <h3>CPU</h3>
            </div>
            <div className="metric-body">
              <div className="metric-main">
                <div className="metric-value">
                  {metrics.cpu?.current || "N/A"}
                  <span className="metric-label-small">
                    {metrics.cpu?.cores || "Unknown"} cores
                  </span>
                </div>
                <div className="metric-progress">
                  <div className="progress-bar">
                    <div
                      className={"progress-fill " + getColorClass(cpuValue)}
                      style={{ width: cpuValue + "%" }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="metric-info">
                {metrics.cpu?.model || "Unknown CPU"}
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-icon">⏱</span>
              <h3>System</h3>
            </div>
            <div className="metric-body">
              <div className="info-row">
                <span className="info-label">Uptime:</span>
                <span className="info-value">{metrics.system?.uptime || "N/A"}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Load Average:</span>
                <span className="info-value">{metrics.system?.loadaverage || "N/A"}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Processes:</span>
                <span className="info-value">{metrics.system?.processes || "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="metric-card full-width">
            <div className="metric-header">
              <span className="metric-icon">⚙</span>
              <h3>Running Processes</h3>
            </div>
            <div className="process-list">
              {metrics.processes && metrics.processes.map((proc) => (
                <div key={proc.pid} className="process-item">
                  <div className="process-info">
                    <span className="process-name">{proc.name}</span>
                    <span className={"process-status " + (proc.status || "unknown")}>
                      {(proc.status || "unknown").toUpperCase()}
                    </span>
                  </div>
                  <div className="process-metrics">
                    <span>Mem: {formatBytes(proc.memory)}</span>
                    <span>CPU: {proc.cpu ? proc.cpu.toFixed(1) : "N/A"}%</span>
                    <span>PID: {proc.pid}</span>
                    <span>Restarts: {proc.restarts || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!metrics.loading && !metrics.error && !metrics.memory && (
        <div className="no-data">No metrics available.</div>
      )}
    </div>
  );
};

export default MonitorPage;
