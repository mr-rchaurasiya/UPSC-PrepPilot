import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar.jsx';

export const AdminDashboard = () => {
  const [users, setUsers] = useState([
    { id: 'u1', name: 'Aspirant Dev', email: 'dev@preppilot.com', role: 'student', year: 2027, date: '2026-08-25' },
    { id: 'u2', name: 'Anjali Sharma', email: 'anjali@preppilot.com', role: 'student', year: 2026, date: '2026-08-24' },
    { id: 'u3', name: 'Rohan Verma', email: 'rohan@preppilot.com', role: 'student', year: 2027, date: '2026-08-22' }
  ]);
  const [seedingSyllabus, setSeedingSyllabus] = useState(false);
  const [seedingQuestions, setSeedingQuestions] = useState(false);
  const [syllabusSuccess, setSyllabusSuccess] = useState(false);
  const [questionsSuccess, setQuestionsSuccess] = useState(false);

  const handleSeedSyllabus = () => {
    setSeedingSyllabus(true);
    setSyllabusSuccess(false);
    
    // Simulate database seeding success
    setTimeout(() => {
      setSeedingSyllabus(false);
      setSyllabusSuccess(true);
    }, 1500);
  };

  const handleSeedQuestions = () => {
    setSeedingQuestions(true);
    setQuestionsSuccess(false);
    
    // Simulate database questions seeding success
    setTimeout(() => {
      setSeedingQuestions(false);
      setQuestionsSuccess(true);
    }, 1500);
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="container px-4 py-4 flex-grow-1" style={{ maxWidth: '1000px' }}>
        
        <div className="mb-4">
          <h2 className="gradient-text fw-bold mb-0">Admin Command Deck</h2>
          <p className="text-secondary small">Seed database abstractions, examine platform accounts, and audit reports</p>
        </div>

        <div className="row g-4">
          {/* Seeding tools */}
          <div className="col-12 col-md-4">
            <div className="custom-card glass-panel p-4 mb-4">
              <h5 className="mb-4 fw-semibold text-secondary">Database Seeds</h5>
              
              <div className="d-flex flex-column gap-3">
                <div>
                  <button
                    className="btn-primary-custom w-100 py-2 btn-sm"
                    onClick={handleSeedSyllabus}
                    disabled={seedingSyllabus}
                  >
                    {seedingSyllabus ? 'Seeding Syllabus...' : 'Seed Core UPSC Syllabus'}
                  </button>
                  {syllabusSuccess && (
                    <span className="text-success small fw-semibold text-center d-block mt-2">✓ 6 syllabus topics loaded</span>
                  )}
                </div>

                <div>
                  <button
                    className="btn-primary-custom w-100 py-2 btn-sm"
                    onClick={handleSeedQuestions}
                    disabled={seedingQuestions}
                  >
                    {seedingQuestions ? 'Seeding Questions...' : 'Seed Practice Questions'}
                  </button>
                  {questionsSuccess && (
                    <span className="text-success small fw-semibold text-center d-block mt-2">✓ 3 practice questions loaded</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* User management list */}
          <div className="col-12 col-md-8">
            <div className="custom-card glass-panel p-4 h-100">
              <h5 className="mb-4 fw-semibold text-secondary">Aspirant Registrations</h5>
              <div className="table-responsive">
                <table className="table table-dark table-hover mb-0" style={{ backgroundColor: 'transparent' }}>
                  <thead>
                    <tr className="small text-muted" style={{ borderBottomColor: 'var(--border-color)' }}>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Target Yr</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="small" style={{ verticalAlign: 'middle', borderBottomColor: 'var(--border-color)' }}>
                        <td className="fw-semibold text-secondary" style={{ color: 'var(--text-primary)' }}>{u.name}</td>
                        <td className="text-muted">{u.email}</td>
                        <td>
                          <span className="badge bg-secondary-subtle text-secondary small border" style={{ borderColor: 'var(--border-color)' }}>{u.year}</span>
                        </td>
                        <td className="text-muted">{u.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
