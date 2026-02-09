import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { scraperAPI } from '../services/api';
import './ScraperLivePage.css';

const ScraperLivePage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const navigate = useNavigate();
  
  const [status, setStatus] = useState('starting');
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ total: 0, successful: 0, withPhone: 0 });
  const [currentPost, setCurrentPost] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  
  const logsEndRef = useRef(null);
  const eventSourceRef = useRef(null);
  
  useEffect(() => {
    if (!sessionId) {
      navigate('/scraper');
      return;
    }
    
    const eventSource = scraperAPI.connectLive(
      sessionId,
      (data) => handleMessage(data),
      (error) => {
        console.error('SSE error:', error);
        setStatus('error');
        setErrorMessage('Connection lost');
      }
    );
    
    eventSourceRef.current = eventSource;
    
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [sessionId, navigate]);
  
  useEffect(() => {
    scrollToBottom();
  }, [logs]);
  
  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleMessage = (data) => {
    switch (data.type) {
      case 'status':
        setStatus(data.status.toLowerCase());
        setStats(data.stats);
        break;
      case 'log':
        addLog(data.message, data.level);
        break;
      case 'progress':
        setStatus('running');
        break;
      case 'post_scraped':
        setCurrentPost({
          index: data.postIndex,
          title: data.eventTitle,
          hasPhone: data.hasPhone
        });
        setStats(data.stats);
        addLog('Scraped post ' + (data.postIndex + 1) + ': ' + (data.eventTitle || 'Untitled'), data.hasPhone ? 'success' : 'info');
        break;
      case 'completed':
        setStatus('completed');
        setIsCompleted(true);
        setStats(data.stats);
        addLog('Scraping completed! Total: ' + data.stats.successful + ', With phone: ' + data.stats.withPhone, 'success');
        break;
      case 'error':
        setStatus('error');
        setErrorMessage(data.message);
        addLog('Error: ' + data.message, 'error');
        break;
      case 'cancelled':
        setStatus('cancelled');
        addLog('Scraping was cancelled', 'warning');
        break;
      default:
        break;
    }
  };
  
  const addLog = (message, level) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, level }]);
  };
  
  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this scraping session?')) {
      try {
        await scraperAPI.cancelSession(sessionId);
        addLog('Cancelling session...', 'warning');
      } catch (error) {
        addLog('Failed to cancel: ' + error.message, 'error');
      }
    }
  };
  
  const handleViewHistory = () => {
    navigate('/scraper/history');
  };
  
  const getStatusColor = () => {
    switch (status) {
      case 'running': return 'var(--color-primary)';
      case 'completed': return 'var(--color-success)';
      case 'error': return 'var(--color-danger)';
      case 'cancelled': return 'var(--color-warning)';
      default: return 'var(--color-gray)';
    }
  };
  
  const getProgressPercentage = () => {
    if (stats.total === 0) return 0;
    return Math.round((stats.successful / stats.total) * 100);
  };
  
  return (
    <div className="scraper-live-page">
      <div className="page-header">
        <div className="header-left">
          <h1>Live Scraping Monitor</h1>
          <p>Real-time scraping progress and logs</p>
        </div>
        <div className="header-actions">
          <button className="action-btn" onClick={handleViewHistory} disabled={!isCompleted}>View History</button>
          <button className="action-btn danger" onClick={handleCancel} disabled={isCompleted || status === 'error' || status === 'cancelled'}>Cancel</button>
        </div>
      </div>
      
      <div className="live-dashboard">
        <div className="status-panel">
          <div className="status-indicator" style={{ backgroundColor: getStatusColor() }}></div>
          <div className="status-info">
            <div className="status-label">Status</div>
            <div className="status-value">{status.toUpperCase()}</div>
          </div>
        </div>
        
        <div className="stats-panel">
          <div className="stat-item"><div className="stat-value">{stats.total}</div><div className="stat-label">Total Posts</div></div>
          <div className="stat-item"><div className="stat-value">{stats.successful}</div><div className="stat-label">Scraped</div></div>
          <div className="stat-item"><div className="stat-value">{stats.withPhone}</div><div className="stat-label">With Phone</div></div>
          <div className="stat-item"><div className="stat-value">{getProgressPercentage()}%</div><div className="stat-label">Progress</div></div>
        </div>
        
        {currentPost && !isCompleted && (
          <div className="current-post-panel">
            <div className="current-post-label">Currently Scraping:</div>
            <div className="current-post-title">
              Post #{currentPost.index + 1}: {currentPost.title || 'Untitled'}
              {currentPost.hasPhone && <span className="phone-badge">📱 Has Phone</span>}
            </div>
          </div>
        )}
        
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: getProgressPercentage + '%' }}></div>
        </div>
      </div>
      
      <div className="logs-container">
        <div className="logs-header">
          <h2>Execution Logs</h2>
          <span className="log-count">{logs.length} messages</span>
        </div>
        <div className="logs-content">
          {logs.length === 0 ? (
            <div className="logs-empty">Waiting for logs...</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className={'log-entry log-' + log.level}>
                <span className="log-timestamp">{log.timestamp}</span>
                <span className="log-message">{log.message}</span>
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </div>
      
      {isCompleted && (
        <div className="completion-banner">
          <h2>✓ Scraping Completed!</h2>
          <p>Successfully scraped {stats.successful} posts. {stats.withPhone} posts contained phone numbers.</p>
          <button className="action-btn primary" onClick={handleViewHistory}>View All Scraped Data</button>
        </div>
      )}
      
      {status === 'error' && (
        <div className="error-banner">
          <h2>✗ Scraping Failed</h2>
          <p>{errorMessage}</p>
          <button className="action-btn" onClick={() => navigate('/scraper')}>Try Again</button>
        </div>
      )}
    </div>
  );
};

export default ScraperLivePage;
