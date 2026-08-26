import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';

export const Sidebar = () => {
  const { user } = useContext(AuthContext);

  const menuItems = [
    { path: '/', label: 'Command Deck', icon: '📊' },
    { path: '/analytics', label: 'Performance Audit', icon: '📈' },
    { path: '/syllabus', label: 'Syllabus Tracker', icon: '📋' },
    { path: '/notifications', label: 'Alert Center', icon: '🔔' },
    { path: '/practice', label: 'Practice Room', icon: '🎯' },
    { path: '/mock', label: 'Mock Test Room', icon: '📝' },
    { path: '/revision', label: 'Smart Revision Room', icon: '🔁' },
    { path: '/current-affairs', label: 'Current Affairs', icon: '📰' },
    { path: '/mentor', label: 'AI Study Mentor', icon: '🤖' },
    { path: '/mistakes', label: 'Mistake Book', icon: '📕' },
    { path: '/mains', label: 'Mains Evaluation', icon: '✍️' },
    { path: '/focus', label: 'Zen Focus Chamber', icon: '⏱️' },
    { path: '/resources', label: 'Notes Vault', icon: '📁' },
    { path: '/planner', label: 'Study Planner', icon: '📅' }
  ];

  return (
    <div className="d-flex flex-column p-3 text-secondary" style={{ width: '260px', height: '100vh', backgroundColor: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)', position: 'fixed', top: 0, left: 0, zIndex: 100 }}>
      <div className="mb-4 text-center pb-3 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
        <h4 className="gradient-text fw-bold mb-0">PrepPilot</h4>
        <span className="small text-muted" style={{ fontSize: '0.7rem' }}>UPSC Preparation Engine</span>
      </div>

      <ul className="nav nav-pills flex-column mb-auto gap-1">
        {menuItems.map(item => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) => `nav-link d-flex align-items-center gap-3 py-2.5 px-3 rounded small text-decoration-none ${isActive ? 'btn-primary-custom text-light' : 'text-secondary'}`}
              style={{ transition: 'var(--transition-smooth)' }}
            >
              <span>{item.icon}</span>
              <span className="fw-medium">{item.label}</span>
            </NavLink>
          </li>
        ))}
        
        {user?.role === 'admin' && (
          <li>
            <NavLink
              to="/admin"
              className={({ isActive }) => `nav-link d-flex align-items-center gap-3 py-2.5 px-3 rounded small text-decoration-none ${isActive ? 'btn-primary-custom text-light' : 'text-secondary'}`}
              style={{ transition: 'var(--transition-smooth)' }}
            >
              <span>⚙️</span>
              <span className="fw-medium">Admin Deck</span>
            </NavLink>
          </li>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;
