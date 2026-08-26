import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar.jsx';
import { 
  getNotificationsList, 
  markNotificationRead, 
  markAllRead, 
  updatePreferences 
} from '../services/notificationService.js';

export const NotificationRoom = () => {
  const [notifications, setNotifications] = useState([]);
  const [preferences, setPreferences] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    const data = await getNotificationsList();
    if (data) {
      setNotifications(data.notifications || []);
      setPreferences(data.preferences || {});
    }
    setLoading(false);
  };

  const handleMarkRead = async (notifId) => {
    try {
      await markNotificationRead(notifId);
      setNotifications(prev => prev.map(n => n._id === notifId ? { ...n, status: 'read' } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })));
    } catch (e) {
      console.error(e);
    }
  };

  const handlePreferenceToggle = async (key) => {
    const updatedPrefs = {
      ...preferences,
      [key]: !preferences[key]
    };
    setPreferences(updatedPrefs);
    setSavingPrefs(true);
    try {
      await updatePreferences(updatedPrefs);
      // Reload alerts matching updated enabled preferences
      const data = await getNotificationsList();
      if (data) {
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingPrefs(false);
    }
  };

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  if (loading) {
    return (
      <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Navbar />
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem', color: 'var(--accent-primary)' }}>
            <span className="visually-hidden">Loading Alerts Center...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="container px-4 py-4 flex-grow-1" style={{ maxWidth: '1000px' }}>
        
        {/* HEADER */}
        <div className="mb-4 pb-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2" style={{ borderColor: 'var(--border-color)' }}>
          <div>
            <h2 className="gradient-text fw-bold mb-0">Alert Center</h2>
            <p className="text-secondary small">Spaced repetition logs, weak areas warnings, and study consistency streak alerts</p>
          </div>
          {unreadCount > 0 && (
            <button className="btn btn-sm btn-primary-custom py-1.5 px-4" onClick={handleMarkAllRead}>
              ✓ Mark All Read
            </button>
          )}
        </div>

        <div className="row g-4">
          
          {/* LEFT: Notification list */}
          <div className="col-12 col-md-7">
            <div className="custom-card glass-panel p-4 h-100">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-semibold text-secondary mb-0">Active Notifications</h5>
                <span className="badge bg-indigo-subtle text-indigo border px-2.5 py-1">{unreadCount} Unread Alerts</span>
              </div>

              {notifications.length === 0 ? (
                <div className="text-center py-5 text-muted small">
                  Clear! No active alerts logged. Verify preferences panel to enable alert categories.
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {notifications.map(notif => {
                    const isUnread = notif.status === 'unread';
                    return (
                      <div
                        key={notif._id}
                        className="p-3.5 rounded border d-flex justify-content-between align-items-start gap-3 animate-fade-in"
                        style={{
                          backgroundColor: 'var(--bg-tertiary)',
                          borderColor: isUnread ? 'var(--accent-primary)' : 'var(--border-color)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div className="text-start">
                          <div className="d-flex align-items-center gap-2 mb-2 flex-wrap" style={{ fontSize: '0.65rem' }}>
                            <span className="badge text-uppercase bg-secondary-subtle text-secondary border px-1.5 py-0.5">
                              {notif.category}
                            </span>
                            <span className="text-muted">
                              {new Date(notif.createdAt || Date.now()).toLocaleDateString()}
                            </span>
                            {isUnread && <span className="rounded-circle bg-primary" style={{ width: '8px', height: '8px' }}></span>}
                          </div>

                          <h6 className="small fw-semibold text-secondary mb-1" style={{ color: 'var(--text-primary)' }}>{notif.title}</h6>
                          <p className="small text-secondary mb-0 leading-relaxed" style={{ fontSize: '0.75rem' }}>{notif.message}</p>
                        </div>

                        {isUnread && (
                          <button className="btn btn-sm text-primary p-0 bg-transparent border-0 small" onClick={() => handleMarkRead(notif._id)}>
                            Mark Read
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Preferences toggle checklist */}
          <div className="col-12 col-md-5">
            <div className="custom-card glass-panel p-4">
              <h5 className="fw-semibold text-secondary mb-3">Alert Preferences</h5>
              <p className="text-secondary small mb-4">Choose which notifications you want to receive. Disabled options will not be triggered.</p>

              <div className="d-flex flex-column gap-3.5 border-top pt-3" style={{ borderColor: 'var(--border-color)' }}>
                {[
                  { key: 'revision', label: 'Spaced Repetition Revisions', desc: 'Overdue reviews and daily revision lists.' },
                  { key: 'goal', label: 'Calendar Study Goals', desc: 'Daily checklist items and weekly milestones.' },
                  { key: 'test', label: 'Mock Test Reminders', desc: 'Schedules and test result recommendations.' },
                  { key: 'streak', label: 'Consistency Streaks', desc: 'Daily focus streaks and study streak updates.' },
                  { key: 'weak_topic', label: 'Weak Topic Warnings', desc: 'Accuracy drops below 60% and mistake book reviews.' },
                  { key: 'mains', label: 'Mains Practice Reminders', desc: 'Reminders to submit mains answers regular evaluations.' },
                  { key: 'recommendation', label: 'AI Study Recommendations', desc: 'Dynamic AI suggestions and preparation score comments.' }
                ].map(opt => (
                  <div key={opt.key} className="d-flex align-items-start gap-3">
                    <input
                      type="checkbox"
                      className="form-check-input mt-1"
                      style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
                      checked={preferences[opt.key] === true}
                      onChange={() => handlePreferenceToggle(opt.key)}
                      disabled={savingPrefs}
                    />
                    <div>
                      <span className="small d-block fw-semibold text-secondary" style={{ color: 'var(--text-primary)' }}>{opt.label}</span>
                      <p className="small text-muted mb-0 leading-normal" style={{ fontSize: '0.7rem' }}>{opt.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default NotificationRoom;
