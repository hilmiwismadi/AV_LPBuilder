import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import '../styles/sidebar.css';

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

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

      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="sidebar-logo">
          <h1>OpenClaw</h1>
          <span>Internal Operating System</span>
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-section">
            <div className="sidebar-section-label">Tools</div>
            <NavLink to="/cci" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <span className="sidebar-icon">🏢</span>
              <span>CCI</span>
            </NavLink>
            <NavLink to="/techsprint" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <span className="sidebar-icon">⚡</span>
              <span>TechSprint</span>
            </NavLink>
            <NavLink to="/mou" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <span className="sidebar-icon">📄</span>
              <span>MoU Maker</span>
            </NavLink>
          </div>
        </nav>
      </aside>
    </>
  );
}
