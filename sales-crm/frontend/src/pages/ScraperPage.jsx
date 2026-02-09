import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { scraperAPI } from '../services/api';
import './ScraperPage.css';

const ScraperPage = () => {
  const navigate = useNavigate();
  
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentSessions();
  }, []);

  const fetchRecentSessions = async () => {
    try {
      const response = await scraperAPI.getSessions({ limit: 5 });
      const sessions = response?.data?.sessions || response?.sessions || [];
      setRecentSessions(sessions);
    } catch (error) {
      console.error('Failed to fetch recent sessions:', error);
      setRecentSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString() + ' ' + new Date(dateStr).toLocaleTimeString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'var(--color-success)';
      case 'RUNNING': return 'var(--color-primary)';
      case 'FAILED': return 'var(--color-danger)';
      case 'CANCELLED': return 'var(--color-warning)';
      default: return 'var(--color-gray)';
    }
  };

  return (
    <div className="scraper-page">
      <div className="page-header">
        <div className="header-left">
          <h1>Instagram Event Scraper</h1>
          <p>Extract event details and phone numbers from Instagram profiles</p>
        </div>
        <div className="header-actions">
          <button className="action-btn" onClick={() => navigate('/scraper/history')}>View History</button>
        </div>
      </div>

      <div className="scraper-layout">
        <div className="recent-sessions-container full-width">
          <div className="section-header">
            <h2>Recent Sessions</h2>
            <button className="link-btn" onClick={() => navigate('/scraper/history')}>View All →</button>
          </div>

          {loading ? (
            <div className="loading">Loading sessions...</div>
          ) : recentSessions.length === 0 ? (
            <div className="empty-state">
              <p>No scraping sessions yet.</p>
              <p>Run the local scraper to see results here!</p>
            </div>
          ) : (
            <div className="sessions-list">
              {recentSessions.map((session) => (
                <div key={session.id} className="session-card" onClick={() => navigate('/scraper/history/' + session.slug)}>
                  <div className="session-header-row">
                    <span className="session-account">@{session.username}</span>
                    <span className="session-status-badge" style={{ backgroundColor: getStatusColor(session.status) }}>{session.status}</span>
                  </div>
                  <div className="session-info-row">
                    <span>Posts: {session.successfulPosts}/{session.totalPosts}</span>
                    <span>📱 {session.postsWithPhone}</span>
                  </div>
                  <div className="session-date">{formatDate(session.createdAt)}</div>
                  {session.status === 'RUNNING' && (
                    <button className="live-btn" onClick={(e) => { e.stopPropagation(); navigate('/scraper/live?sessionId=' + session.id); }}>View Live →</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScraperPage;
