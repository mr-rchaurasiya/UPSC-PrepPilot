import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar.jsx';
import DashboardHeader from '../components/dashboard/DashboardHeader.jsx';
import QuickActionsPanel from '../components/dashboard/QuickActionsPanel.jsx';
import StatsGrid from '../components/dashboard/StatsGrid.jsx';
import AnalyticsCharts from '../components/dashboard/AnalyticsCharts.jsx';
import QuickTasks from '../components/dashboard/QuickTasks.jsx';
import WeakTopicsPanel from '../components/dashboard/WeakTopicsPanel.jsx';
import Recommendations from '../components/dashboard/Recommendations.jsx';
import { getDashboardData } from '../services/dashboardService.js';

export const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await getDashboardData();
      setData(res);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Navbar />
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem', color: 'var(--accent-primary)' }}>
            <span className="visually-hidden">Loading Dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="container-fluid px-4 py-4 flex-grow-1">
        {data?.isMock && (
          <div className="alert alert-info py-2 small text-center mb-4 border-0 rounded-3" role="alert" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)' }}>
            PrepPilot is running in Offline Fallback Mock Mode. Live database features are disabled, but all interactions are simulated.
          </div>
        )}

        {/* Dashboard Header */}
        {data && <DashboardHeader overallProgress={data.stats.overallProgress} />}

        {/* Quick Actions Panel */}
        <QuickActionsPanel />

        {/* Stats Grid Dashboard Cards */}
        {data && <StatsGrid stats={data.stats} />}

        <div className="row g-4 mb-4">
          {/* Progress Charts (Weekly, Subject, Accuracy, Revision, Mains Trends) */}
          <div className="col-12 col-xl-8">
            {data && <AnalyticsCharts weeklyData={data.weeklyConsistency} />}
          </div>

          {/* Today's Quick Tasks Checklist */}
          <div className="col-12 col-xl-4">
            {data && <QuickTasks tasks={data.recentTasks} />}
          </div>
        </div>

        {/* Weak Areas & Revisions table */}
        <div className="mb-4">
          {data && <WeakTopicsPanel weakTopics={data.weakTopics} />}
        </div>

        <div className="row g-4">
          {/* AI Advisor Recommendations */}
          <div className="col-12">
            {data && <Recommendations recommendations={data.recommendations} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
