import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const menuItems = [
    { section: 'CRM', items: [
      { path: '/crm', label: 'Clients', icon: '👥' },
      { path: '/crm/templates', label: 'Templates', icon: '📋' },
      { path: '/crm/flow', label: 'Flow Builder', icon: '🔀' },
    ]},
    { section: 'Tools', items: [
      { path: '/scraper', label: 'Web Scraper', icon: '📸' },
      { path: 'external', label: 'LP Builder', icon: '🎨', external: 'https://webbuild.arachnova.id' },
    ]},
    { section: 'System', items: [
      { path: '/logs', label: 'Logs', icon: '📄' },
      { path: '/monitor', label: 'Monitor', icon: '📊' },
      ...(user?.role === 'SUPERADMIN' ? [{ path: '/superadmin', label: 'Superadmin', icon: '⚙️' }] : []),
    ]},
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <button className="collapse-btn" onClick={toggleCollapse} title={isCollapsed ? 'Expand' : 'Collapse'}>
          {isCollapsed ? '▶' : '◀'}
        </button>
        {!isCollapsed && (
          <div className="logo">
            <span className="logo-icon">🕸️</span>
            <div className="logo-text">
              <span className="logo-title">Sales Weapon</span>
              <span className="logo-subtitle">ArachnoVa</span>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="logo-collapsed">
            <span className="logo-icon">🕸️</span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((group) => (
          <div key={group.section} className="nav-group">
            {!isCollapsed && (
              <span className="nav-group-label">{group.section}</span>
            )}
            {group.items.map((item) => (
              <button
                key={item.path}
                className={`nav-item ${isActive(item.path) && !item.external ? 'active' : ''}`}
                onClick={() => item.external ? window.open(item.external, '_blank') : navigate(item.path)}
                title={item.label}
              >
                <span className="nav-icon">{item.icon}</span>
                {!isCollapsed && <span className="nav-label">{item.label}</span>}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn" title="Logout">
          <span className="nav-icon">🚪</span>
          {!isCollapsed && <span className="nav-label">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
