import React from 'react';
import { useNavigate } from 'react-router-dom';

export const QuickActionsPanel = () => {
  const navigate = useNavigate();

  const actions = [
    { label: 'Start Study Session', icon: '⏱️', path: '/focus' },
    { label: 'Practice PYQs', icon: '🎯', path: '/practice?source=pyq' },
    { label: 'Practice MCQs', icon: '📝', path: '/practice?source=mcq' },
    { label: 'Write Mains Answer', icon: '✍️', path: '/mains' },
    { label: 'Revise Today', icon: '📋', path: '/syllabus' },
    { label: 'Ask AI Mentor', icon: '🤖', path: '/resources' }
  ];

  return (
    <div className="custom-card glass-panel p-4 mb-4">
      <h5 className="mb-4 fw-semibold text-secondary">Quick Action Command Deck</h5>
      <div className="row g-3">
        {actions.map((act, i) => (
          <div key={i} className="col-6 col-md-4 col-lg-2">
            <button
              key={i}
              className="w-100 py-3 rounded border text-center d-flex flex-column align-items-center justify-content-center gap-2"
              style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', transition: 'all 0.2s ease', cursor: 'pointer' }}
              onClick={() => navigate(act.path)}
            >
              <span className="fs-3">{act.icon}</span>
              <span className="small fw-semibold text-secondary" style={{ fontSize: '0.75rem' }}>{act.label}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickActionsPanel;
