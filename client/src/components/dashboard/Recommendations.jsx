import React from 'react';
import { Link } from 'react-router-dom';

export const Recommendations = ({ recommendations }) => {
  const getBadgeClass = (type) => {
    switch (type) {
      case 'revision':
        return 'bg-warning-subtle text-warning';
      case 'practice':
        return 'bg-info-subtle text-info';
      case 'writing':
        return 'bg-success-subtle text-success';
      default:
        return 'bg-secondary-subtle text-secondary';
    }
  };

  return (
    <div className="custom-card glass-panel h-100">
      <h5 className="mb-4 fw-semibold text-secondary">AI Study Recommendations</h5>
      {recommendations.length === 0 ? (
        <div className="text-center py-4 text-muted small">
          AI Personal Mentor is analyzing your progress to generate recommendations...
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {recommendations.map(rec => (
            <div key={rec.id} className="d-flex flex-column p-3 rounded" style={{ backgroundColor: 'var(--bg-tertiary)', borderLeft: '3px solid var(--accent-primary)' }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className={`badge text-uppercase ${getBadgeClass(rec.type)}`} style={{ fontSize: '0.7rem' }}>
                  {rec.type}
                </span>
              </div>
              <p className="small text-secondary mb-3">{rec.text}</p>
              <Link to={rec.actionPath} className="btn-primary-custom py-1 px-3 mt-auto align-self-start" style={{ fontSize: '0.8rem' }}>
                Take Action
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommendations;
