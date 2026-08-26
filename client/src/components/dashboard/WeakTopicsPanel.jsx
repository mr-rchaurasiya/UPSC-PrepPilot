import React from 'react';

export const WeakTopicsPanel = ({ weakTopics }) => {
  const upcomingRevisions = [
    { subject: 'Polity', topic: 'Directive Principles (DPSP)', due: 'Today' },
    { subject: 'History', topic: 'Non-Cooperation Movement', due: 'Tomorrow' },
    { subject: 'Economy', topic: 'Monetary Policy Committee (MPC)', due: 'In 2 days' }
  ];

  return (
    <div className="row g-4">
      {/* Weak Topics Table */}
      <div className="col-12 col-md-8">
        <div className="custom-card glass-panel p-4 h-100">
          <h5 className="mb-4 fw-semibold text-secondary">Weak Areas / Topics</h5>
          <div className="table-responsive">
            <table className="table table-dark table-hover mb-0" style={{ backgroundColor: 'transparent' }}>
              <thead>
                <tr className="small text-muted" style={{ borderBottomColor: 'var(--border-color)' }}>
                  <th>Topic</th>
                  <th>Accuracy</th>
                  <th>Last Revision</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {weakTopics && weakTopics.length > 0 ? (
                  weakTopics.map((item, i) => (
                    <tr key={i} className="small" style={{ verticalAlign: 'middle', borderBottomColor: 'var(--border-color)' }}>
                      <td className="fw-semibold text-secondary" style={{ color: 'var(--text-primary)' }}>{item.topic}</td>
                      <td>
                        <span className="text-danger fw-bold">{item.accuracy}%</span>
                      </td>
                      <td className="text-muted">{new Date(item.lastRevision).toLocaleDateString()}</td>
                      <td>
                        <span className="badge bg-danger-subtle text-danger border small" style={{ borderColor: 'rgba(239,68,68,0.1)' }}>
                          {item.priority}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="small text-muted">
                    <td colSpan="4" className="text-center py-4">No weak areas identified. Good job!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Upcoming Revisions */}
      <div className="col-12 col-md-4">
        <div className="custom-card glass-panel p-4 h-100">
          <h5 className="mb-4 fw-semibold text-secondary">Upcoming Revisions</h5>
          <div className="d-flex flex-column gap-3">
            {upcomingRevisions.map((rev, idx) => (
              <div key={idx} className="p-3 rounded border d-flex justify-content-between align-items-center gap-2" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}>
                <div>
                  <span className="badge bg-secondary-subtle text-secondary small border px-1.5 py-0.5 mb-1.5">
                    {rev.subject}
                  </span>
                  <h6 className="small fw-semibold text-primary mb-0" style={{ color: 'var(--text-primary)' }}>
                    {rev.topic}
                  </h6>
                </div>
                <span className="small text-danger fw-bold" style={{ fontSize: '0.75rem' }}>{rev.due}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeakTopicsPanel;
