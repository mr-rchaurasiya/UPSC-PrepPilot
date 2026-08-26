import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar.jsx';
import { getCompleteAnalyticsData } from '../services/analyticsService.js';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';

export const AnalyticsRoom = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('score'); // 'score', 'study', 'mcq', 'subjects'

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    const data = await getCompleteAnalyticsData();
    if (data) {
      setAnalytics(data);
    }
    setLoading(false);
  };

  if (loading || !analytics) {
    return (
      <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Navbar />
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem', color: 'var(--accent-primary)' }}>
            <span className="visually-hidden">Loading Analytics metrics...</span>
          </div>
        </div>
      </div>
    );
  }

  // Study hours bar chart mock data
  const studyChartData = [
    { name: 'Mon', hours: 4.5 },
    { name: 'Tue', hours: 6.2 },
    { name: 'Wed', hours: 5.8 },
    { name: 'Thu', hours: 7.0 },
    { name: 'Fri', hours: 6.5 },
    { name: 'Sat', hours: 8.0 },
    { name: 'Sun', hours: 4.5 }
  ];

  // MCQ correct vs incorrect pie chart data
  const mcqPieData = [
    { name: 'Correct Hits', value: analytics.question?.correct || 259, color: 'var(--accent-success)' },
    { name: 'Incorrect Options', value: analytics.question?.incorrect || 91, color: 'var(--accent-danger)' },
    { name: 'Skipped Items', value: analytics.question?.skipped || 15, color: 'var(--accent-info)' }
  ];

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="container px-4 py-4 flex-grow-1" style={{ maxWidth: '1000px' }}>
        
        {/* HEADER */}
        <div className="mb-4 pb-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2" style={{ borderColor: 'var(--border-color)' }}>
          <div>
            <h2 className="gradient-text fw-bold mb-0">Platform Performance Audit</h2>
            <p className="text-secondary small">Weighted preparation indexes, syllabus coverage rates, and mock mains scorecard audits</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="custom-card glass-panel p-2.5 mb-4 d-flex flex-wrap gap-1.5">
          {[
            { id: 'score', label: 'Weighted Preparation Score' },
            { id: 'study', label: 'Study & Revisions Track' },
            { id: 'mcq', label: 'MCQ & Mains Performance' },
            { id: 'subjects', label: 'Subject-wise Strengths' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`btn btn-sm ${activeTab === tab.id ? 'btn-primary-custom' : 'btn-secondary-custom'} py-1.5 px-3`}
              style={{ fontSize: '0.75rem' }}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENTS */}
        <div className="animate-fade-in">
          
          {/* TAB 1: Weighted Preparation Score */}
          {activeTab === 'score' && (
            <div className="row g-4">
              
              {/* Left gauge */}
              <div className="col-12 col-md-5">
                <div className="custom-card glass-panel p-5 text-center h-100 d-flex flex-column justify-content-center align-items-center">
                  <span className="text-muted small fw-semibold text-uppercase tracking-wider">PrepPilot Prep Index</span>
                  
                  {/* Big gauge circle */}
                  <div className="my-4 rounded-circle border d-flex flex-column align-items-center justify-content-center" style={{ width: '180px', height: '180px', borderWidth: '8px', borderColor: 'var(--accent-primary)', boxShadow: '0 0 15px rgba(99, 102, 241, 0.15)' }}>
                    <h1 className="display-4 fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>{analytics.preparationScore}%</h1>
                    <span className="small text-muted mt-1">Weighted Score</span>
                  </div>

                  <p className="small text-secondary mb-0 leading-relaxed">
                    This score aggregates syllabus progress, active mock accuracy ratings, subjective mains answers, and spaced repetition queues.
                  </p>
                </div>
              </div>

              {/* Right factors and suggestions */}
              <div className="col-12 col-md-7 d-flex flex-column gap-4">
                
                {/* Contributing factors card */}
                <div className="custom-card glass-panel p-4">
                  <h6 className="fw-semibold text-secondary mb-3">Contributing Index Weights</h6>
                  
                  <div className="d-flex flex-column gap-3">
                    {analytics.factors?.map((f, idx) => (
                      <div key={idx}>
                        <div className="d-flex justify-content-between small text-secondary mb-1">
                          <span>{f.name} <strong className="text-muted">({f.weight} Weight)</strong></span>
                          <strong>{f.score}%</strong>
                        </div>
                        <div className="progress" style={{ height: '6px', backgroundColor: 'var(--bg-tertiary)' }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ width: `${f.score}%`, backgroundColor: f.color }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations card */}
                <div className="custom-card glass-panel p-4">
                  <h6 className="fw-semibold text-secondary mb-3">Actionable AI Recommendations</h6>
                  <div className="d-flex flex-column gap-2.5">
                    {analytics.recommendations?.map((rec, idx) => (
                      <div key={idx} className="p-3 rounded border text-start small bg-dark-subtle" style={{ borderColor: 'var(--border-color)' }}>
                        💡 {rec.text}
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: Study and Revisions */}
          {activeTab === 'study' && (
            <div className="row g-4">
              
              {/* Study Stats columns */}
              <div className="col-12 col-lg-6">
                <div className="custom-card glass-panel p-4 mb-4">
                  <h6 className="fw-semibold text-secondary mb-4">Study Time Allocations</h6>
                  <div className="row g-3">
                    {[
                      { label: 'Total hours', val: `${analytics.study?.totalStudyHours} hrs`, color: 'var(--text-primary)' },
                      { label: 'Daily hours', val: `${analytics.study?.dailyHours} hrs`, color: 'var(--accent-primary)' },
                      { label: 'Weekly hours', val: `${analytics.study?.weeklyHours} hrs`, color: 'var(--accent-success)' },
                      { label: 'Monthly hours', val: `${analytics.study?.monthlyHours} hrs`, color: 'var(--accent-info)' }
                    ].map((stat, i) => (
                      <div key={i} className="col-6">
                        <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                          <span className="text-muted small d-block" style={{ fontSize: '0.65rem' }}>{stat.label}</span>
                          <h4 className="fw-bold mt-1 mb-0" style={{ color: stat.color }}>{stat.val}</h4>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Revision logs */}
                <div className="custom-card glass-panel p-4">
                  <h6 className="fw-semibold text-secondary mb-3">Spaced Repetition Audits</h6>
                  <div className="row g-3 text-center">
                    <div className="col-4">
                      <span className="text-muted small d-block" style={{ fontSize: '0.65rem' }}>Completed</span>
                      <h4 className="fw-bold text-success mt-1.5 mb-0">{analytics.revision?.completedRevisions}</h4>
                    </div>
                    <div className="col-4">
                      <span className="text-muted small d-block" style={{ fontSize: '0.65rem' }}>Overdue</span>
                      <h4 className="fw-bold text-danger mt-1.5 mb-0">{analytics.revision?.overdueRevisions}</h4>
                    </div>
                    <div className="col-4">
                      <span className="text-muted small d-block" style={{ fontSize: '0.65rem' }}>Recall Success</span>
                      <h4 className="fw-bold text-primary mt-1.5 mb-0">{analytics.revision?.revisionSuccessRate}%</h4>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekly study hours chart */}
              <div className="col-12 col-lg-6">
                <div className="custom-card glass-panel p-4 h-100">
                  <h6 className="fw-semibold text-secondary mb-4">Study Consistency (Last 7 Days)</h6>
                  <div style={{ width: '100%', height: 260 }}>
                    <ResponsiveContainer>
                      <BarChart data={studyChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
                        <YAxis stroke="var(--text-muted)" fontSize={11} />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }} />
                        <Bar dataKey="hours" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: MCQ and Mains */}
          {activeTab === 'mcq' && (
            <div className="row g-4">
              
              {/* Question analytics */}
              <div className="col-12 col-lg-6">
                <div className="custom-card glass-panel p-4 mb-4">
                  <h6 className="fw-semibold text-secondary mb-4">Prelims MCQ Performance</h6>
                  <div className="row g-3">
                    {[
                      { label: 'Attempted', val: analytics.question?.questionsAttempted, color: 'var(--text-primary)' },
                      { label: 'Accuracy Rate', val: `${analytics.question?.accuracy}%`, color: 'var(--accent-primary)' },
                      { label: 'Avg Time/MCQ', val: `${analytics.question?.avgTimePerQuestion}s`, color: 'var(--accent-info)' },
                      { label: 'Correct Hits', val: analytics.question?.correct, color: 'var(--accent-success)' }
                    ].map((stat, i) => (
                      <div key={i} className="col-6">
                        <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                          <span className="text-muted small d-block" style={{ fontSize: '0.65rem' }}>{stat.label}</span>
                          <h4 className="fw-bold mt-1 mb-0" style={{ color: stat.color }}>{stat.val}</h4>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mains metrics */}
                <div className="custom-card glass-panel p-4">
                  <h6 className="fw-semibold text-secondary mb-3">Mains Answer Writing Audits</h6>
                  <div className="row g-3 text-center">
                    <div className="col-4">
                      <span className="text-muted small d-block" style={{ fontSize: '0.65rem' }}>Answers Written</span>
                      <h4 className="fw-bold text-success mt-1.5 mb-0">{analytics.mains?.answersWritten}</h4>
                    </div>
                    <div className="col-4">
                      <span className="text-muted small d-block" style={{ fontSize: '0.65rem' }}>Average Rating</span>
                      <h4 className="fw-bold text-primary mt-1.5 mb-0">{analytics.mains?.avgMainsScore} <span className="fs-6 text-muted">/10</span></h4>
                    </div>
                    <div className="col-4">
                      <span className="text-muted small d-block" style={{ fontSize: '0.65rem' }}>Word Compliance</span>
                      <h4 className="fw-bold text-warning mt-1.5 mb-0">{analytics.mains?.wordComplianceRate}%</h4>
                    </div>
                  </div>
                </div>
              </div>

              {/* Correct/Incorrect Distribution Pie Chart */}
              <div className="col-12 col-lg-6">
                <div className="custom-card glass-panel p-4 h-100 d-flex flex-column justify-content-between">
                  <h6 className="fw-semibold text-secondary mb-2">MCQ Option Distribution</h6>
                  
                  <div className="d-flex justify-content-center py-3">
                    <PieChart width={220} height={220}>
                      <Pie
                        data={mcqPieData}
                        cx={105}
                        cy={100}
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {mcqPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </div>

                  {/* Legend list */}
                  <div className="d-flex flex-column gap-2 small text-secondary border-top pt-3" style={{ borderColor: 'var(--border-color)' }}>
                    {mcqPieData.map((item, idx) => (
                      <div key={idx} className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                          <span className="rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: item.color }}></span>
                          <span>{item.name}</span>
                        </div>
                        <strong>{item.value} questions</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: Subject progress, weak topics */}
          {activeTab === 'subjects' && (
            <div className="row g-4">
              
              {/* Left progress bars */}
              <div className="col-12 col-md-6">
                <div className="custom-card glass-panel p-4 h-100">
                  <h6 className="fw-semibold text-secondary mb-4">Subject-wise Syllabus Coverage</h6>
                  
                  <div className="d-flex flex-column gap-4">
                    {[
                      { name: 'Indian Polity & Governance', percent: analytics.subject?.progress, color: 'var(--accent-primary)' },
                      { name: 'Modern Indian History', percent: 45, color: 'var(--accent-success)' },
                      { name: 'Economic Development', percent: 35, color: 'var(--accent-warning)' },
                      { name: 'Ethics & Case study models', percent: 15, color: 'var(--accent-info)' }
                    ].map((sub, i) => (
                      <div key={i}>
                        <div className="d-flex justify-content-between small text-secondary mb-1">
                          <span>{sub.name}</span>
                          <strong>{sub.percent}%</strong>
                        </div>
                        <div className="progress" style={{ height: '7px', backgroundColor: 'var(--bg-tertiary)' }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ width: `${sub.percent}%`, backgroundColor: sub.color }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right weak vs strong lists */}
              <div className="col-12 col-md-6 d-flex flex-column gap-4">
                
                {/* Weak Topics */}
                <div className="custom-card glass-panel p-4">
                  <h6 className="fw-semibold text-danger mb-3">⚠️ Weakest Topic Modules</h6>
                  <div className="d-flex flex-column gap-2">
                    {analytics.subject?.weakTopics?.map((topic, idx) => (
                      <div key={idx} className="p-2.5 rounded border d-flex justify-content-between align-items-center" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}>
                        <div className="small text-secondary">
                          <span className="fw-semibold d-block text-truncate" style={{ maxWidth: '240px', color: 'var(--text-primary)' }}>{topic.title}</span>
                          <span className="text-muted" style={{ fontSize: '0.65rem' }}>Subject: {topic.subject}</span>
                        </div>
                        <span className="badge bg-danger-subtle text-danger border small">Confidence Rating: {topic.score}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strong Topics */}
                <div className="custom-card glass-panel p-4">
                  <h6 className="fw-semibold text-success mb-3">★ Strongest Topic Modules</h6>
                  <div className="d-flex flex-column gap-2">
                    {analytics.subject?.strongTopics?.map((topic, idx) => (
                      <div key={idx} className="p-2.5 rounded border d-flex justify-content-between align-items-center" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}>
                        <div className="small text-secondary">
                          <span className="fw-semibold d-block text-truncate" style={{ maxWidth: '240px', color: 'var(--text-primary)' }}>{topic.title}</span>
                          <span className="text-muted" style={{ fontSize: '0.65rem' }}>Subject: {topic.subject}</span>
                        </div>
                        <span className="badge bg-success-subtle text-success border small">Confidence Rating: {topic.score}%</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default AnalyticsRoom;
