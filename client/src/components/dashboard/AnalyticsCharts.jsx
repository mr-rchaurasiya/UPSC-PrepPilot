import React, { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';

export const AnalyticsCharts = ({ weeklyData }) => {
  const [activeTab, setActiveTab] = useState('study');

  const subjectProgressData = [
    { subject: 'Polity', completed: 65 },
    { subject: 'Economy', completed: 48 },
    { subject: 'History', completed: 32 },
    { subject: 'Geography', completed: 55 },
    { subject: 'CSAT', completed: 80 },
    { subject: 'Optional', completed: 25 }
  ];

  const questionAccuracyData = [
    { week: 'Wk 1', accuracy: 68 },
    { week: 'Wk 2', accuracy: 72 },
    { week: 'Wk 3', accuracy: 70 },
    { week: 'Wk 4', accuracy: 75 },
    { week: 'Wk 5', accuracy: 78 }
  ];

  const revisionProgressData = [
    { name: 'Completed', value: 45, color: 'var(--accent-success)' },
    { name: 'Due', value: 15, color: 'var(--accent-danger)' },
    { name: 'Scheduled', value: 20, color: 'var(--accent-primary)' }
  ];

  const mainsScoreData = [
    { test: 'Test 1', score: 4.5 },
    { test: 'Test 2', score: 5.0 },
    { test: 'Test 3', score: 5.5 },
    { test: 'Test 4', score: 6.2 },
    { test: 'Test 5', score: 6.8 }
  ];

  const renderChart = () => {
    switch (activeTab) {
      case 'study':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={weeklyData || []}>
              <defs>
                <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="hours" stroke="var(--accent-primary)" strokeWidth={2} fillOpacity={1} fill="url(#hoursGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'subject':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={subjectProgressData} layout="vertical">
              <XAxis type="number" stroke="var(--text-muted)" fontSize={11} tickLine={false} domain={[0, 100]} />
              <YAxis dataKey="subject" type="category" stroke="var(--text-muted)" fontSize={11} tickLine={false} width={80} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} />
              <Bar dataKey="completed" fill="var(--accent-primary)" radius={[0, 4, 4, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'accuracy':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={questionAccuracyData}>
              <XAxis dataKey="week" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} domain={[50, 100]} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="accuracy" stroke="var(--accent-info)" strokeWidth={3} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'revision':
        return (
          <div className="d-flex align-items-center justify-content-center" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revisionProgressData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {revisionProgressData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
      case 'mains':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mainsScoreData}>
              <XAxis dataKey="test" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} domain={[0, 10]} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="score" stroke="var(--accent-success)" strokeWidth={3} dot={{ strokeWidth: 2, r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  const tabs = [
    { id: 'study', label: 'Study Hours' },
    { id: 'subject', label: 'Subject Completion' },
    { id: 'accuracy', label: 'MCQ Accuracy' },
    { id: 'revision', label: 'Revision Deck' },
    { id: 'mains', label: 'Mains Scores' }
  ];

  return (
    <div className="custom-card glass-panel p-4 h-100">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h5 className="fw-semibold text-secondary mb-0">Preparation Progress Analytics</h5>
        <div className="d-flex flex-wrap gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`btn btn-sm ${activeTab === tab.id ? 'btn-primary-custom' : 'btn-secondary-custom'} py-1 px-2.5`}
              style={{ fontSize: '0.75rem' }}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      {renderChart()}
    </div>
  );
};

export default AnalyticsCharts;
