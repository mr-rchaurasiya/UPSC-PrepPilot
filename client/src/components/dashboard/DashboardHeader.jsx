import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';

export const DashboardHeader = ({ overallProgress }) => {
  const { user, logout } = useContext(AuthContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning';
    if (hr < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const notificationsPreset = [
    'Your weekly consistency target is 90% completed!',
    'Mains answer writing AI feedback is ready for view.',
    'Revision task due: Laxmikanth Polity Chapters 1-4.'
  ];

  return (
    <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3 pb-3 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
      <div>
        <h2 className="gradient-text fw-bold mb-1">
          {getGreeting()}, {user?.name || 'Aspirant'}!
        </h2>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span className="badge bg-secondary-subtle text-secondary border small px-2.5 py-1">
            Target: UPSC Civil Services {user?.profile?.targetYear || 2027}
          </span>
          <span className="badge bg-info-subtle text-info border small px-2.5 py-1">
            Syllabus Completion: {overallProgress || 0}%
          </span>
        </div>
      </div>

      <div className="d-flex align-items-center gap-3">
        {/* Notification Icon */}
        <div className="position-relative">
          <button
            className="btn btn-secondary-custom p-2 rounded-circle d-flex align-items-center justify-content-center border"
            style={{ width: '40px', height: '40px', position: 'relative' }}
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
          >
            🔔
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
              3
            </span>
          </button>

          {showNotifications && (
            <div className="position-absolute end-0 mt-2 p-3 rounded shadow-lg glass-panel text-start" style={{ width: '300px', zIndex: 110, backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <h6 className="fw-bold mb-2 text-secondary small">Notifications</h6>
              <div className="d-flex flex-column gap-2">
                {notificationsPreset.map((n, i) => (
                  <div key={i} className="small text-secondary p-2 rounded" style={{ fontSize: '0.75rem', backgroundColor: 'var(--bg-tertiary)', cursor: 'default' }}>
                    {n}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu */}
        <div className="position-relative">
          <button
            className="btn btn-secondary-custom py-1.5 px-3 rounded d-flex align-items-center gap-2 border"
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
          >
            <span className="fw-semibold small">{user?.name?.substring(0, 2).toUpperCase()}</span>
            <span>▼</span>
          </button>

          {showProfileMenu && (
            <div className="position-absolute end-0 mt-2 p-2 rounded shadow-lg glass-panel text-start" style={{ width: '180px', zIndex: 110, backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <div className="px-2 py-1.5 border-bottom mb-1" style={{ borderColor: 'var(--border-color)' }}>
                <span className="small d-block fw-semibold text-secondary">{user?.name}</span>
                <span className="small text-muted d-block text-truncate" style={{ fontSize: '0.7rem' }}>{user?.email}</span>
              </div>
              <button
                className="w-100 text-start bg-transparent border-0 py-1.5 px-2 rounded hover-bg small text-secondary text-decoration-none"
                onClick={logout}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
