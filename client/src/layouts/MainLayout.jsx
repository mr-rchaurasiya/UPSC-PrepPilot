import React, { useState } from 'react';
import Sidebar from '../components/layout/Sidebar.jsx';

export const MainLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Desktop Sidebar */}
      <div className="d-none d-lg-block" style={{ width: '260px', flexShrink: 0 }}>
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 99, backdropFilter: 'blur(2px)' }}
          onClick={toggleMobileMenu}
        >
          <div
            className="h-100"
            style={{ width: '260px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-grow-1 d-flex flex-column" style={{ marginLeft: '0px' }}>
        {/* Mobile menu trigger */}
        <div className="d-lg-none p-3 border-bottom d-flex align-items-center justify-content-between" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <h5 className="gradient-text fw-bold mb-0">PrepPilot</h5>
          <button className="btn btn-sm btn-secondary-custom py-1 px-3" onClick={toggleMobileMenu}>
            Menu
          </button>
        </div>

        <div style={{ marginLeft: 'var(--sidebar-margin-offset)' }} className="flex-grow-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
