import { NavLink } from 'react-router-dom';
import '../styles/sidebar.css';

export default function Sidebar() {
  return (
    <aside className="sidebar">
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
  );
}
