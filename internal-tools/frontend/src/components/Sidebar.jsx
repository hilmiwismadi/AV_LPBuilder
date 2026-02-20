import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import '../styles/sidebar.css';

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebar-collapsed') === 'true');
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Sync collapsed state to body class + localStorage
  useEffect(() => {
    document.body.classList.toggle('sidebar-collapsed', collapsed);
    localStorage.setItem('sidebar-collapsed', collapsed);
  }, [collapsed]);

  // Close on escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <>
      <button className="sidebar-toggle" onClick={() => setOpen(o => !o)} aria-label="Toggle menu">
        <span className={`hamburger ${open ? 'open' : ''}`}>
          <span /><span /><span />
        </span>
      </button>

      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}

      <aside className={`sidebar ${open ? 'sidebar-open' : ''} ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-logo">
          <h1>{collapsed ? 'OC' : 'OpenClaw'}</h1>
          {!collapsed && <span>Internal Operating System</span>}
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-section">
            {!collapsed && <div className="sidebar-section-label">Tools</div>}
            <NavLink to="/cci" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="CCI">
              <span className="sidebar-icon">🏢</span>
              {!collapsed && <span>CCI</span>}
            </NavLink>
            <NavLink to="/techsprint" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="TechSprint">
              <span className="sidebar-icon">⚡</span>
              {!collapsed && <span>TechSprint</span>}
            </NavLink>
            <NavLink to="/mou" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="MoU Maker">
              <span className="sidebar-icon">📄</span>
              {!collapsed && <span>MoU Maker</span>}
            </NavLink>
          </div>
        </nav>
        <button className="sidebar-collapse-btn" onClick={() => setCollapsed(c => !c)} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          <span className={`collapse-arrow ${collapsed ? 'flipped' : ''}`}>‹</span>
        </button>
      </aside>
    </>
  );
}
