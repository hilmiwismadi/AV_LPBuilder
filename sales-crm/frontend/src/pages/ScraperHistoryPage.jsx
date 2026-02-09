import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { scraperAPI } from "../services/api";
import "./ScraperHistoryPage.css";

const ScraperHistoryPage = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [manageMode, setManageMode] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    fetchSessions();
  }, [page]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await scraperAPI.getSessions({
        limit,
        offset: page * limit
      });
      const data = response?.data || response;
      setSessions(data?.sessions || []);
      setTotal(data?.total || 0);
      setSelectedIds(new Set());
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
      setSessions([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(sessions.map(s => s.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    const count = selectedIds.size;
    if (!window.confirm("Are you sure you want to delete " + count + " session(s)?")) {
      return;
    }

    setDeleting(true);
    let successCount = 0;
    let failCount = 0;

    for (const sessionId of Array.from(selectedIds)) {
      try {
        await scraperAPI.deleteSession(sessionId);
        successCount++;
      } catch (error) {
        console.error("Failed to delete session:", sessionId, error);
        failCount++;
      }
    }

    setDeleting(false);
    setSelectedIds(new Set());
    setManageMode(false);

    if (failCount > 0) {
      alert("Deleted " + successCount + " session(s). " + failCount + " failed.");
    }

    fetchSessions();
  };

  const handleDelete = async (sessionId, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this session?")) {
      try {
        await scraperAPI.deleteSession(sessionId);
        fetchSessions();
      } catch (error) {
        alert("Failed to delete session: " + error.message);
      }
    }
  };

  const handleView = (slug) => {
    navigate("/scraper/history/" + slug);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString();
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="scraper-history-page">
      <div className="page-header">
        <div className="header-left">
          <h1>Scraping History</h1>
          <p>View and manage past scraping sessions</p>
        </div>
        <div className="header-actions">
          <button
            className={"action-btn " + (manageMode ? "danger" : "")}
            onClick={() => {
              setManageMode(!manageMode);
              setSelectedIds(new Set());
            }}
          >
            {manageMode ? "Cancel" : "Manage"}
          </button>
          <button className="action-btn primary" onClick={() => navigate("/scraper")}>
            + New Scrape
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading sessions...</div>
      ) : sessions.length === 0 ? (
        <div className="empty-state">
          <p>No scraping sessions found.</p>
          <button className="action-btn primary" onClick={() => navigate("/scraper")}>
            Start Your First Scrape
          </button>
        </div>
      ) : (
        <>
          {manageMode && selectedIds.size > 0 && (
            <div className="bulk-actions-bar">
              <span className="selected-count">{selectedIds.size} session(s) selected</span>
              <button
                className="action-btn danger"
                onClick={handleBulkDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete Selected"}
              </button>
            </div>
          )}

          <div className="sessions-table-container">
            <table className="sessions-table">
              <thead>
                <tr>
                  {manageMode && (
                    <th className="checkbox-column">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === sessions.length && sessions.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                  )}
                  <th>Date</th>
                  <th>Instagram Account</th>
                  <th>Post Range</th>
                  <th>Results</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr
                    key={session.id}
                    className={"session-row" + (selectedIds.has(session.id) ? " selected" : "")}
                    onClick={() => handleView(session.slug)}
                  >
                    {manageMode && (
                      <td className="checkbox-column" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(session.id)}
                          onChange={() => handleSelectRow(session.id)}
                        />
                      </td>
                    )}
                    <td>{formatDate(session.createdAt)}</td>
                    <td>@{session.username}</td>
                    <td>{session.startPostIndex} - {session.endPostIndex}</td>
                    <td>
                      {session.totalPosts > 0 || session.successfulPosts > 0 ? (
                        <span>
                          {session.successfulPosts || 0}/{session.totalPosts || 0} scraped
                          {session.postsWithPhone > 0 && (
                            <span className="phone-count"> 📱 {session.postsWithPhone}</span>
                          )}
                        </span>
                      ) : (
                        <span className="no-results">No results</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="table-action-btn"
                        onClick={(e) => { e.stopPropagation(); handleView(session.slug); }}
                      >
                        View
                      </button>
                      <button
                        className="table-action-btn delete"
                        onClick={(e) => handleDelete(session.id, e)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {page + 1} of {totalPages}
              </span>
              <button
                className="pagination-btn"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ScraperHistoryPage;