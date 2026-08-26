import API from './api';

export const getRevisionDashboardData = async () => {
  try {
    const res = await API.get('/syllabus/revision/dashboard');
    if (res.data.success) {
      return res.data;
    }
  } catch (err) {
    console.warn('Backend revision dashboard fetch failed. Simulating offline.');
    const progressStr = localStorage.getItem('mock_syllabus_progress') || '[]';
    const progresses = JSON.parse(progressStr);

    const mockTopics = [
      { _id: 'mock-s1', subject: 'Indian Polity & Governance', code: 'GS2-POLITY-01', title: 'Indian Constitution - Historical Underpinnings & Features' },
      { _id: 'mock-s2', subject: 'Indian Polity & Governance', code: 'GS2-POLITY-02', title: 'Union and the States - Functions & Responsibilities' },
      { _id: 'mock-s3', subject: 'Modern Indian History & Culture', code: 'GS1-HISTORY-01', title: 'Indian Culture - Art Forms & Architecture' },
      { _id: 'mock-s4', subject: 'Economic Development', code: 'GS3-ECONOMY-01', title: 'Indian Economy & Issues Relating to Planning' },
      { _id: 'mock-s5', subject: 'Ethics, Integrity & Aptitude', code: 'GS4-ETHICS-01', title: 'Ethics and Human Interface' },
      { _id: 'mock-s6', subject: 'CSAT Aptitude', code: 'CSAT-QUANT-01', title: 'Quantitative Aptitude & Number Systems' }
    ];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueToday = [];
    const overdue = [];
    const upcoming = [];
    const completed = [];

    progresses.forEach(p => {
      const topicObj = mockTopics.find(t => t._id === p.topic);
      if (!topicObj) return;

      const populatedProgress = { ...p, topic: topicObj };

      if (!p.nextRevisionDate) {
        if (p.revisionCount > 0 || p.status === 'Completed' || p.status === 'Revised') {
          completed.push(populatedProgress);
        }
        return;
      }

      const revDate = new Date(p.nextRevisionDate);
      revDate.setHours(0, 0, 0, 0);

      if (revDate.getTime() === today.getTime()) {
        dueToday.push(populatedProgress);
      } else if (revDate.getTime() < today.getTime()) {
        overdue.push(populatedProgress);
      } else {
        upcoming.push(populatedProgress);
      }

      if (p.revisionCount > 0 || p.status === 'Completed' || p.status === 'Revised') {
        completed.push(populatedProgress);
      }
    });

    return {
      success: true,
      dueToday,
      overdue,
      upcoming,
      completed
    };
  }
};

export const rateTopicRevision = async (topicId, rating) => {
  try {
    const res = await API.post(`/syllabus/revision/${topicId}/rate`, { rating });
    if (res.data.success) {
      return res.data.progress;
    }
  } catch (err) {
    console.warn('Backend rate topic revision failed. Simulating offline.');
    const progressStr = localStorage.getItem('mock_syllabus_progress') || '[]';
    let progresses = JSON.parse(progressStr);

    let idx = progresses.findIndex(p => p.topic === topicId);
    let intervalDays = 1;
    let confidence = 3;
    let status = 'Learning';

    if (rating === 'Forgot') {
      intervalDays = 1;
      confidence = 1;
      status = 'Weak';
    } else if (rating === 'Partially Remembered') {
      intervalDays = 3;
      confidence = 3;
      status = 'Learning';
    } else if (rating === 'Remembered') {
      intervalDays = 7;
      confidence = 4;
      status = 'Revised';
    } else if (rating === 'Strong') {
      intervalDays = 30;
      confidence = 5;
      status = 'Strong';
    }

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + intervalDays);

    const updated = {
      topic: topicId,
      status,
      confidence,
      revisionCount: idx !== -1 ? (progresses[idx].revisionCount || 0) + 1 : 1,
      lastRevisedAt: new Date().toISOString(),
      nextRevisionDate: nextDate.toISOString(),
      notes: idx !== -1 ? progresses[idx].notes : ''
    };

    if (idx !== -1) {
      progresses[idx] = { ...progresses[idx], ...updated };
    } else {
      progresses.push(updated);
    }

    localStorage.setItem('mock_syllabus_progress', JSON.stringify(progresses));
    return updated;
  }
};
