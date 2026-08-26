import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar.jsx';
import { 
  getAdminOverviewData, 
  getAdminUsersList, 
  updateUserActiveStatus, 
  updateUserRoleType 
} from '../services/adminService.js';
import { getQuestionsList, deleteQuestionItem } from '../services/practiceService.js';
import { getCurrentAffairsList } from '../services/currentAffairsService.js';

export const AdminRoom = () => {
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Content managers states
  const [activeAdminTab, setActiveAdminTab] = useState('overview'); // 'overview', 'users', 'content'
  const [searchUserQuery, setSearchUserQuery] = useState('');

  // Content lists
  const [questions, setQuestions] = useState([]);
  const [news, setNews] = useState([]);

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    setLoading(true);
    const stats = await getAdminOverviewData();
    setOverview(stats);
    
    const userList = await getAdminUsersList(searchUserQuery);
    setUsers(userList || []);
    
    // Load content for manager
    const qList = await getQuestionsList();
    setQuestions(qList || []);
    const nList = await getCurrentAffairsList('all', 'All');
    setNews(nList || []);

    setLoading(false);
  };

  const handleSearchUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    const userList = await getAdminUsersList(searchUserQuery);
    setUsers(userList || []);
    setLoading(false);
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const updated = await updateUserActiveStatus(userId, !currentStatus);
      setUsers(prev => prev.map(u => u._id === userId ? updated : u));
    } catch (e) {
      console.error(e);
    }
  };

  const handleChangeUserRole = async (userId, newRole) => {
    try {
      const updated = await updateUserRoleType(userId, newRole);
      setUsers(prev => prev.map(u => u._id === userId ? updated : u));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteMCQ = async (qId) => {
    if (!window.confirm('Delete this MCQ permanently from public practice pools?')) return;
    try {
      await deleteQuestionItem(qId);
      setQuestions(prev => prev.filter(q => q._id !== qId));
      alert('Content deleted.');
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !overview) {
    return (
      <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Navbar />
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem', color: 'var(--accent-primary)' }}>
            <span className="visually-hidden">Loading Admin Console...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="container-fluid px-4 py-4 flex-grow-1" style={{ maxWidth: '1150px' }}>
        
        {/* HEADER */}
        <div className="mb-4 pb-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2" style={{ borderColor: 'var(--border-color)' }}>
          <div>
            <h2 className="gradient-text fw-bold mb-0">PrepPilot Secure Administration</h2>
            <p className="text-secondary small">Manage student accounts, verify content indexes, and audit database assets</p>
          </div>
          <span className="badge bg-danger-subtle text-danger border px-2.5 py-1">Role: Security Administrator</span>
        </div>

        {/* Tab Controls */}
        <div className="custom-card glass-panel p-2.5 mb-4 d-flex flex-wrap gap-1.5">
          {[
            { id: 'overview', label: 'Platform Overview' },
            { id: 'users', label: 'Student Management' },
            { id: 'content', label: 'Content Management (MCQs/PYQs)' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`btn btn-sm ${activeAdminTab === tab.id ? 'btn-primary-custom' : 'btn-secondary-custom'} py-1.5 px-3`}
              style={{ fontSize: '0.75rem' }}
              onClick={() => setActiveAdminTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW PANEL */}
        {activeAdminTab === 'overview' && (
          <div className="row g-3">
            {[
              { label: 'Registered Students', val: overview.usersCount, icon: '👥', color: 'var(--accent-primary)' },
              { label: 'Syllabus Topics', val: overview.syllabusCount, icon: '📋', color: 'var(--accent-success)' },
              { label: 'Indexed PYQs', val: overview.pyqCount, icon: '📜', color: 'var(--accent-info)' },
              { label: 'Mock MCQs solved', val: overview.mcqCount, icon: '🎯', color: 'var(--accent-warning)' },
              { label: 'Daily News Logs', val: overview.newsCount, icon: '📰', color: 'var(--text-primary)' },
              { label: 'Submissions Graded', val: overview.mainsSubmissionsCount, icon: '✍️', color: 'var(--accent-primary)' }
            ].map((card, i) => (
              <div key={i} className="col-6 col-md-4 col-lg-3">
                <div className="custom-card glass-panel p-4 text-center h-100 d-flex flex-column justify-content-between">
                  <span className="fs-3 d-block mb-1">{card.icon}</span>
                  <span className="text-muted small fw-semibold text-uppercase" style={{ fontSize: '0.65rem' }}>{card.label}</span>
                  <h3 className="fw-bold mt-2 mb-0" style={{ color: card.color }}>{card.val}</h3>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* STUDENT MANAGEMENT */}
        {activeAdminTab === 'users' && (
          <div className="custom-card glass-panel p-4 animate-fade-in">
            <h5 className="fw-semibold text-secondary mb-4">UPSC PrepPilot Student Directory</h5>

            <form onSubmit={handleSearchUser} className="d-flex gap-2 mb-4" style={{ maxWidth: '450px' }}>
              <input
                type="text"
                className="form-control-custom py-1.5 px-3 small"
                placeholder="Search by student name or email..."
                value={searchUserQuery}
                onChange={(e) => setSearchUserQuery(e.target.value)}
              />
              <button type="submit" className="btn btn-sm btn-primary-custom py-1 px-4">
                Search
              </button>
            </form>

            <div className="table-responsive">
              <table className="table table-dark table-hover mb-0" style={{ backgroundColor: 'transparent' }}>
                <thead>
                  <tr className="small text-muted" style={{ borderBottomColor: 'var(--border-color)' }}>
                    <th>Name</th>
                    <th>Email Address</th>
                    <th>Date Joined</th>
                    <th>System Role</th>
                    <th className="text-end">Account Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id} className="small" style={{ verticalAlign: 'middle', borderBottomColor: 'var(--border-color)' }}>
                      <td className="fw-semibold text-secondary" style={{ color: 'var(--text-primary)' }}>{user.name}</td>
                      <td className="text-muted">{user.email}</td>
                      <td className="text-muted">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <select
                          className="form-control-custom py-0.5 px-2 small form-select bg-dark-subtle"
                          style={{ fontSize: '0.7rem', width: '110px' }}
                          value={user.role}
                          onChange={(e) => handleChangeUserRole(user._id, e.target.value)}
                        >
                          <option value="student">Student</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="text-end">
                        <button
                          className={`btn btn-sm ${user.isActive ? 'btn-success' : 'btn-danger'} py-1 px-3`}
                          style={{ fontSize: '0.7rem' }}
                          onClick={() => handleToggleUserStatus(user._id, user.isActive)}
                        >
                          {user.isActive ? '✓ Active' : '✕ Suspended'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CONTENT MANAGEMENT */}
        {activeAdminTab === 'content' && (
          <div className="custom-card glass-panel p-4 animate-fade-in">
            <h5 className="fw-semibold text-secondary mb-4">MCQ & PYQ Question Bank Manager</h5>

            <div className="table-responsive">
              <table className="table table-dark table-hover mb-0" style={{ backgroundColor: 'transparent' }}>
                <thead>
                  <tr className="small text-muted" style={{ borderBottomColor: 'var(--border-color)' }}>
                    <th>Question Context</th>
                    <th>Subject</th>
                    <th>Correct Option</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map(q => (
                    <tr key={q._id} className="small animate-fade-in" style={{ verticalAlign: 'middle', borderBottomColor: 'var(--border-color)' }}>
                      <td>
                        <span className="fw-semibold text-secondary d-block text-truncate" style={{ maxWidth: '350px', color: 'var(--text-primary)' }}>
                          {q.questionText}
                        </span>
                        <span className="small text-muted d-block" style={{ fontSize: '0.65rem' }}>Source: {q.source}</span>
                      </td>
                      <td className="text-muted">{q.subject}</td>
                      <td className="text-muted">Option Index {q.correctOption}</td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <button className="btn btn-sm btn-secondary-custom text-danger py-1 px-3 border-0" onClick={() => handleDeleteMCQ(q._id)}>
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminRoom;
