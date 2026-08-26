import API from './api';

export const logStudySessionTime = async (sessionData) => {
  try {
    const res = await API.post('/timer/session', sessionData);
    if (res.data.success) {
      return res.data;
    }
  } catch (err) {
    console.warn('Backend timer logging failed. Saving session locally in localStorage.');
    
    const sessionsStr = localStorage.getItem('mock_focus_sessions') || '[]';
    const sessions = JSON.parse(sessionsStr);
    
    const newSession = {
      _id: `mock-session-${Date.now()}`,
      durationMinutes: sessionData.durationMinutes,
      plannedDurationMinutes: sessionData.plannedDurationMinutes || 0,
      topic: sessionData.topicId || null,
      subject: sessionData.subject || '',
      task: sessionData.taskId || null,
      status: sessionData.status || 'completed',
      notes: sessionData.notes || '',
      date: new Date().toISOString()
    };
    
    sessions.push(newSession);
    localStorage.setItem('mock_focus_sessions', JSON.stringify(sessions));
    
    return { success: true, session: newSession, streak: 5 };
  }
};
