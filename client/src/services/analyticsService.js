import API from './api';

export const getCompleteAnalyticsData = async () => {
  try {
    const res = await API.get('/analytics/complete');
    if (res.data.success) {
      return res.data;
    }
  } catch (err) {
    console.warn('Backend complete analytics fetch failed. Serving local mock analytics.');
    
    return {
      success: true,
      preparationScore: 72,
      factors: [
        { name: 'Syllabus Completion', weight: '30%', score: 68, color: 'var(--accent-primary)' },
        { name: 'Mock MCQ Accuracy', weight: '30%', score: 74, color: 'var(--accent-success)' },
        { name: 'Mains Evaluation Rating', weight: '20%', score: 78, color: 'var(--accent-warning)' },
        { name: 'Revision Success Rate', weight: '20%', score: 70, color: 'var(--accent-info)' }
      ],
      study: {
        totalStudyHours: 145.5,
        dailyHours: 6.2,
        weeklyHours: 42.5,
        monthlyHours: 135.0,
        focusedSessions: 45
      },
      question: {
        questionsAttempted: 350,
        accuracy: 74,
        correct: 259,
        incorrect: 91,
        skipped: 15,
        avgTimePerQuestion: 48
      },
      subject: {
        progress: 68,
        weakTopics: [
          { title: 'Directive Principles (DPSP)', subject: 'Polity', score: 55 },
          { title: 'Inflation & Resource Mobilization', subject: 'Economy', score: 58 }
        ],
        strongTopics: [
          { title: 'Fundamental Rights (FR)', subject: 'Polity', score: 88 },
          { title: 'East India Company Expansion', subject: 'History', score: 85 }
        ]
      },
      mains: {
        answersWritten: 12,
        avgMainsScore: 6.8,
        wordComplianceRate: 75
      },
      revision: {
        completedRevisions: 14,
        overdueRevisions: 3,
        revisionSuccessRate: 78
      },
      recommendations: [
        { type: 'syllabus', text: 'Prioritize uncompleted Polity chapters to raise your preparation index score.' },
        { type: 'revision', text: 'Schedule a revision block for overdue topics to improve memory recall.' },
        { type: 'practice', text: 'Draft case study responses under Mains portal to build compliance indicators.' }
      ]
    };
  }
};
