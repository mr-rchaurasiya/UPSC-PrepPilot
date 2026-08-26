import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import { ThemeContext } from '../../context/ThemeContext.jsx';

export const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <nav className="navbar navbar-expand-lg border-bottom px-4 py-3 sticky-top" style={{ backgroundColor: 'var(--bg-secondary)', borderBottomColor: 'var(--border-color)' }}>
      <div className="container-fluid p-0 d-flex justify-content-between align-items-center">
        <div>
          <h4 className="gradient-text fw-bold mb-0">UPSC PrepPilot</h4>
        </div>
        
        <div className="d-flex align-items-center gap-3">
          {user && (
            <>
              {user.profile?.optionalSubject && (
                <span className="badge bg-secondary-subtle text-secondary border px-2.5 py-1.5 rounded-pill small d-none d-md-inline" style={{ borderColor: 'var(--border-color) !important' }}>
                  Optional: {user.profile.optionalSubject}
                </span>
              )}
              <span className="text-secondary small d-none d-sm-inline">
                Aspirant: <strong>{user.name}</strong>
              </span>
            </>
          )}
          
          <button className="btn-secondary-custom py-1.5 px-3 btn-sm" onClick={toggleTheme}>
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          
          <button className="btn-primary-custom py-1.5 px-3 btn-sm" onClick={logout}>
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
