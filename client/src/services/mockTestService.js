import API from './api';

export const submitMockAttempt = async (payload) => {
  try {
    const res = await API.post('/mock-test/submit', payload);
    if (res.data.success) {
      return res.data;
    }
  } catch (err) {
    console.warn('Backend mock test submission failed. Evaluating offline.');
    const { mode, answers, timeSpentSeconds } = payload;
    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    const mockQuestions = [
      { _id: 'mock-q1', subject: 'Indian Polity & Governance', correctOption: 1 },
      { _id: 'mock-q2', subject: 'Indian Polity & Governance', correctOption: 1 },
      { _id: 'mock-q3', subject: 'CSAT Aptitude', correctOption: 1 }
    ];

    const subjectMap = {};

    for (const ans of answers) {
      const q = mockQuestions.find(mq => mq._id === ans.questionId) || { subject: 'Polity', correctOption: 0 };
      const sub = q.subject;
      if (!subjectMap[sub]) {
        subjectMap[sub] = { total: 0, correct: 0 };
      }
      subjectMap[sub].total += 1;

      if (ans.selectedOption === null || ans.selectedOption === undefined || ans.selectedOption === -1) {
        skipped += 1;
      } else {
        const isCorrect = q.correctOption === ans.selectedOption;
        if (isCorrect) {
          correct += 1;
          subjectMap[sub].correct += 1;
        } else {
          wrong += 1;
        }
      }
    }

    const attempted = correct + wrong;
    const score = parseFloat(((correct * 2.0) - (wrong * 0.66)).toFixed(2));
    const negativeMarks = parseFloat((wrong * 0.66).toFixed(2));
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

    const subjectBreakdown = Object.keys(subjectMap).map(sub => ({
      subject: sub,
      total: subjectMap[sub].total,
      correct: subjectMap[sub].correct
    }));

    const resultRecord = {
      _id: `mock-history-${Date.now()}`,
      mode,
      score,
      totalQuestions: answers.length,
      attempted,
      correct,
      wrong,
      skipped,
      negativeMarks,
      accuracy,
      timeSpentSeconds,
      subjectBreakdown,
      createdAt: new Date().toISOString()
    };

    const historyStr = localStorage.getItem('mock_test_history') || '[]';
    const history = JSON.parse(historyStr);
    history.unshift(resultRecord);
    localStorage.setItem('mock_test_history', JSON.stringify(history));

    return {
      success: true,
      history: resultRecord
    };
  }
};

export const getMockAttemptsHistory = async () => {
  try {
    const res = await API.get('/mock-test/history');
    if (res.data.success) {
      return res.data.history;
    }
  } catch (err) {
    console.warn('Backend mock test history fetch failed. Fetching offline.');
    const historyStr = localStorage.getItem('mock_test_history') || '[]';
    return JSON.parse(historyStr);
  }
};
