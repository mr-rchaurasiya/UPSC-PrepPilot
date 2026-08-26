import API from './api';

export const getDashboardData = async () => {
  try {
    const res = await API.get('/analytics/dashboard');
    if (res.data.success) {
      return res.data;
    }
  } catch (err) {
    console.warn('Backend dashboard service offline or returned error. Serving offline mock data.', err.message);
    
    // Serve rich mock dashboard data
    return {
      success: true,
      isMock: true,
      stats: {
        overallProgress: 34.5,
        prelimsProgress: 42.0,
        mainsProgress: 28.5,
        optionalProgress: 15.0,
        studyStreak: 5,
        totalStudyHours: 124.5,
        questionsSolved: 340,
        averageAccuracy: 78,
        studyTimeToday: 245
      },
      weeklyConsistency: [
        { day: 'Mon', hours: 4.5 },
        { day: 'Tue', hours: 6.2 },
        { day: 'Wed', hours: 5.0 },
        { day: 'Thu', hours: 7.5 },
        { day: 'Fri', hours: 4.0 },
        { day: 'Sat', hours: 8.5 },
        { day: 'Sun', hours: 5.5 }
      ],
      recentTasks: [
        { _id: 'mock-t1', title: 'Read Current Affairs summary for August 2026', status: 'completed', type: 'daily_task', date: new Date().toISOString() },
        { _id: 'mock-t2', title: 'Attempt 20 polity MCQs on President powers', status: 'completed', type: 'daily_task', date: new Date().toISOString() },
        { _id: 'mock-t3', title: 'Revise Geography maps (Himalayan passes)', status: 'pending', type: 'daily_task', date: new Date().toISOString() },
        { _id: 'mock-t4', title: 'Draft mains essay draft on Artificial Intelligence rules', status: 'pending', type: 'weekly_goal', date: new Date().toISOString() }
      ],
      weakTopics: [
        { topic: 'Fundamental Rights (Polity)', accuracy: 58, lastRevision: new Date().toISOString(), priority: 'GS1' },
        { topic: 'Inflation & GDP (Economy)', accuracy: 52, lastRevision: new Date().toISOString(), priority: 'GS3' }
      ],
      recommendations: [
        { id: 1, type: 'revision', text: 'Your Economy accuracy has fallen below 60%. Schedule a revision session.', actionPath: '/syllabus' },
        { id: 2, type: 'practice', text: 'Practice 10 PYQs on Indian Polity and Constitution features.', actionPath: '/practice' }
      ]
    };
  }
};
