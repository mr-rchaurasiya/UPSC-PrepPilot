import API from './api';

const mockNotifs = [
  { _id: 'n1', title: 'Overdue Revision Reminder', message: 'You have 3 syllabus topics due for spaced repetition revision review today.', category: 'revision', status: 'unread', createdAt: new Date().toISOString() },
  { _id: 'n2', title: 'Study Streak Milestone', message: 'Excellent consistency! You are on a 5-day daily study study streak. Activate focus mode to keep it alive.', category: 'streak', status: 'unread', createdAt: new Date().toISOString() },
  { _id: 'n3', title: 'Weak Topic Alert: Indian Economy', message: 'Your accuracy under Economic Development has dropped below 60%. Attempt weak topic MCQ drill.', category: 'weak_topic', status: 'unread', createdAt: new Date().toISOString() },
  { _id: 'n4', title: 'Mains Practice Target', message: 'You have not submitted a Mains answer response in the last 3 days. Write a practice prompt today.', category: 'mains', status: 'read', createdAt: new Date().toISOString() }
];

const mockPrefs = {
  revision: true,
  goal: true,
  test: true,
  streak: true,
  weak_topic: true,
  mains: true,
  recommendation: true
};

const getLocalNotifs = () => {
  const notifsStr = localStorage.getItem('mock_notifs');
  if (!notifsStr) {
    localStorage.setItem('mock_notifs', JSON.stringify(mockNotifs));
    return mockNotifs;
  }
  return JSON.parse(notifsStr);
};

const getLocalPrefs = () => {
  const prefsStr = localStorage.getItem('mock_notif_prefs');
  if (!prefsStr) {
    localStorage.setItem('mock_notif_prefs', JSON.stringify(mockPrefs));
    return mockPrefs;
  }
  return JSON.parse(prefsStr);
};

export const getNotificationsList = async () => {
  try {
    const res = await API.get('/notifications');
    if (res.data.success) {
      return res.data;
    }
  } catch (err) {
    console.warn('Backend notifications fetch failed. Serving local mock alerts.');
    const prefs = getLocalPrefs();
    const notifs = getLocalNotifs();
    const filtered = notifs.filter(n => prefs[n.category] === true);
    return {
      success: true,
      notifications: filtered,
      preferences: prefs
    };
  }
};

export const markNotificationRead = async (notifId) => {
  try {
    const res = await API.put(`/notifications/${notifId}/read`);
    if (res.data.success) {
      return res.data.notification;
    }
  } catch (err) {
    console.warn('Backend read update failed. Simulating locally.');
    const list = getLocalNotifs();
    const idx = list.findIndex(n => n._id === notifId);
    if (idx !== -1) {
      list[idx].status = 'read';
      localStorage.setItem('mock_notifs', JSON.stringify(list));
      return list[idx];
    }
    throw new Error('Notification not found');
  }
};

export const markAllRead = async () => {
  try {
    const res = await API.put('/notifications/read-all');
    if (res.data.success) {
      return res.data;
    }
  } catch (err) {
    console.warn('Backend markAllRead failed. Simulating locally.');
    const list = getLocalNotifs();
    list.forEach(n => { n.status = 'read'; });
    localStorage.setItem('mock_notifs', JSON.stringify(list));
    return { success: true };
  }
};

export const getPreferences = async () => {
  try {
    const res = await API.get('/notifications/preferences');
    if (res.data.success) {
      return res.data.preferences;
    }
  } catch (err) {
    console.warn('Backend preferences fetch failed. Serving local mock preferences.');
    return getLocalPrefs();
  }
};

export const updatePreferences = async (preferences) => {
  try {
    const res = await API.put('/notifications/preferences', { preferences });
    if (res.data.success) {
      return res.data.preferences;
    }
  } catch (err) {
    console.warn('Backend preferences update failed. Simulating locally.');
    localStorage.setItem('mock_notif_prefs', JSON.stringify(preferences));
    return preferences;
  }
};
