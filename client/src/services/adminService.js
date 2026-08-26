import API from './api';

const mockUsers = [
  { _id: 'u1', name: 'Aarav Sharma', email: 'aarav@gmail.com', role: 'student', isActive: true, createdAt: '2026-08-01T10:00:00Z' },
  { _id: 'u2', name: 'Aditi Patel', email: 'aditi@gmail.com', role: 'student', isActive: true, createdAt: '2026-08-05T10:00:00Z' },
  { _id: 'u3', name: 'Karan Malhotra', email: 'karan@gmail.com', role: 'admin', isActive: true, createdAt: '2026-08-10T10:00:00Z' },
  { _id: 'u4', name: 'Riya Gupta', email: 'riya@gmail.com', role: 'student', isActive: false, createdAt: '2026-08-15T10:00:00Z' }
];

const getLocalUsers = () => {
  const usersStr = localStorage.getItem('mock_admin_users');
  if (!usersStr) {
    localStorage.setItem('mock_admin_users', JSON.stringify(mockUsers));
    return mockUsers;
  }
  return JSON.parse(usersStr);
};

export const getAdminOverviewData = async () => {
  try {
    const res = await API.get('/admin/overview');
    if (res.data.success) {
      return res.data.stats;
    }
  } catch (err) {
    console.warn('Backend admin overview fetch failed. Serving local mock stats.');
    return {
      usersCount: 4,
      syllabusCount: 35,
      pyqCount: 20,
      mcqCount: 50,
      newsCount: 15,
      docsCount: 8,
      mockAttemptsCount: 24,
      mainsSubmissionsCount: 12,
      focusSessionsCount: 45,
      reportedCount: 1
    };
  }
};

export const getAdminUsersList = async (search) => {
  try {
    const searchQuery = search ? `?search=${search}` : '';
    const res = await API.get(`/admin/users${searchQuery}`);
    if (res.data.success) {
      return res.data.users;
    }
  } catch (err) {
    console.warn('Backend admin users fetch failed. Serving local mock list.');
    let list = getLocalUsers();
    if (search) {
      list = list.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
    }
    return list;
  }
};

export const updateUserActiveStatus = async (userId, isActive) => {
  try {
    const res = await API.put(`/admin/users/${userId}/status`, { isActive });
    if (res.data.success) {
      return res.data.user;
    }
  } catch (err) {
    console.warn('Backend user active toggle failed. Simulating locally.');
    const list = getLocalUsers();
    const idx = list.findIndex(u => u._id === userId);
    if (idx !== -1) {
      list[idx].isActive = isActive;
      localStorage.setItem('mock_admin_users', JSON.stringify(list));
      return list[idx];
    }
    throw new Error('User not found');
  }
};

export const updateUserRoleType = async (userId, role) => {
  try {
    const res = await API.put(`/admin/users/${userId}/role`, { role });
    if (res.data.success) {
      return res.data.user;
    }
  } catch (err) {
    console.warn('Backend user role update failed. Simulating locally.');
    const list = getLocalUsers();
    const idx = list.findIndex(u => u._id === userId);
    if (idx !== -1) {
      list[idx].role = role;
      localStorage.setItem('mock_admin_users', JSON.stringify(list));
      return list[idx];
    }
    throw new Error('User not found');
  }
};
