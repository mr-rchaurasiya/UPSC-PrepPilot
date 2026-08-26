import React from 'react';

export const StatsGrid = ({ stats }) => {
  const {
    overallProgress,
    prelimsProgress,
    mainsProgress,
    optionalProgress,
    studyStreak,
    totalStudyHours,
    questionsSolved,
    averageAccuracy
  } = stats;

  const cardItems = [
    { label: 'Overall Preparation', value: `${overallProgress || 0}%`, sub: 'Syllabus tree completion', color: 'var(--accent-primary)' },
    { label: 'Prelims Progress', value: `${prelimsProgress || 0}%`, sub: 'GS1 & CSAT items', color: 'var(--accent-primary)' },
    { label: 'Mains Progress', value: `${mainsProgress || 0}%`, sub: 'GS2, GS3 & GS4 papers', color: 'var(--accent-primary)' },
    { label: 'Optional Progress', value: `${optionalProgress || 0}%`, sub: 'Optional subject topics', color: 'var(--accent-primary)' },
    { label: 'Study Streak', value: `${studyStreak || 0} Days`, sub: 'Consecutive active study', color: 'var(--accent-success)' },
    { label: 'Total Study Hours', value: `${totalStudyHours || 0} hrs`, sub: 'Aggregated focus session timer', color: 'var(--accent-success)' },
    { label: 'Questions Solved', value: `${questionsSolved || 0}`, sub: 'Prelims questions solved', color: 'var(--accent-info)' },
    { label: 'Average Accuracy', value: `${averageAccuracy || 0}%`, sub: 'Practice answer correctness', color: 'var(--accent-info)' }
  ];

  return (
    <div className="row g-3 mb-4">
      {cardItems.map((item, idx) => (
        <div key={idx} className="col-12 col-sm-6 col-md-4 col-lg-3">
          <div className="custom-card glass-panel h-100 p-3.5 d-flex flex-column justify-content-between">
            <div>
              <span className="text-muted small fw-semibold text-uppercase" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>
                {item.label}
              </span>
              <h3 className="fw-bold mt-2 mb-0" style={{ color: item.color }}>
                {item.value}
              </h3>
            </div>
            <span className="text-secondary mt-2" style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
              {item.sub}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;
