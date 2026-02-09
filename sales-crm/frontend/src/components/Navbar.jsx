import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ selectedStartup, onSelectStartup }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="logo">
            <span className="logo-icon">🕸️</span>
            <span className="logo-text">Sales Weapon</span>
          </div>
          <span className="navbar-subtitle">ArachnoVa</span>
        </div>

        <div className="navbar-tabs">
          {/* CRM Section */}
          <div className="nav-section">
            <span className="nav-section-label">CRM</span>
            <button
              className={`nav-tab ${isActive('/crm') && !isActive('/crm/templates') ? 'active' : ''}`}
              onClick={() => navigate('/crm')}
            >
              👥 Clients
            </button>
            <button
              className={`nav-tab ${isActive('/crm/templates') ? 'active' : ''}`}
              onClick={() => navigate('/crm/templates')}
            >
              📋 Templates
            </button>
          </div>

          {/* Tools Section */}
          <div className="nav-section">
            <span className="nav-section-label">Tools</span>
            <button
              className={`nav-tab ${isActive('/scraper') ? 'active' : ''}`}
              onClick={() => navigate('/scraper')}
            >
              📸 Web Scraper
            </button>
            <button
              className="nav-tab"
              onClick={() => window.open('https://webbuild.arachnova.id', '_blank')}
              title="Landing Page Builder"
            >
              🎨 LP Builder
            </button>
          </div>

          {/* System Section */}
          <div className="nav-section">
            <span className="nav-section-label">System</span>
            <button
              className={`nav-tab ${isActive('/logs') ? 'active' : ''}`}
              onClick={() => navigate('/logs')}
            >
              📄 Logs
            </button>
          </div>
        </div>

        <div className="navbar-user">
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
