import API from './api';

const defaultTasks = [
  { _id: 'mock-t1', title: 'Read Current Affairs summary for August 2026', status: 'completed', date: new Date().toISOString() },
  { _id: 'mock-t2', title: 'Attempt 20 polity MCQs on President powers', status: 'completed', date: new Date().toISOString() },
  { _id: 'mock-t3', title: 'Revise Geography maps (Himalayan passes)', status: 'pending', date: new Date().toISOString() },
  { _id: 'mock-t4', title: 'Draft mains essay draft on Artificial Intelligence rules', status: 'pending', date: new Date().toISOString() }
];

const getLocalTasks = () => {
  const tasksStr = localStorage.getItem('mock_tasks');
  if (!tasksStr) {
    localStorage.setItem('mock_tasks', JSON.stringify(defaultTasks));
    return defaultTasks;
  }
  return JSON.parse(tasksStr);
};

export const getTasksList = async () => {
  try {
    const res = await API.get('/tasks');
    if (res.data.success) {
      return res.data.tasks;
    }
    return getLocalTasks();
  } catch (err) {
    console.warn('Backend tasks retrieval failed. Servicing offline tasks checklist.');
    return getLocalTasks();
  }
};

export const createNewTask = async (taskData) => {
  try {
    const res = await API.post('/tasks', taskData);
    if (res.data.success) {
      return res.data.task;
    }
  } catch (err) {
    console.warn('Backend task creation failed. Creating locally.');
    const tasks = getLocalTasks();
    const newTask = {
      _id: `mock-t-${Date.now()}`,
      title: taskData.title,
      description: taskData.description || '',
      type: taskData.type || 'daily_task',
      date: taskData.date || new Date().toISOString(),
      status: 'pending',
      durationMinutes: taskData.durationMinutes || 0
    };
    tasks.push(newTask);
    localStorage.setItem('mock_tasks', JSON.stringify(tasks));
    return newTask;
  }
};

export const toggleTaskStatusItem = async (taskId) => {
  try {
    const res = await API.put(`/tasks/${taskId}/toggle`);
    if (res.data.success) {
      return res.data.task;
    }
  } catch (err) {
    console.warn('Backend task toggle failed. Toggling locally.');
    const tasks = getLocalTasks();
    const index = tasks.findIndex(t => t._id === taskId);
    if (index !== -1) {
      tasks[index].status = tasks[index].status === 'completed' ? 'pending' : 'completed';
      localStorage.setItem('mock_tasks', JSON.stringify(tasks));
      return tasks[index];
    }
    throw new Error('Task not found');
  }
};

export const updateTaskItem = async (taskId, taskData) => {
  try {
    const res = await API.put(`/tasks/${taskId}`, taskData);
    if (res.data.success) {
      return res.data.task;
    }
  } catch (err) {
    console.warn('Backend task update failed. Updating locally.');
    const tasks = getLocalTasks();
    const index = tasks.findIndex(t => t._id === taskId);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...taskData };
      localStorage.setItem('mock_tasks', JSON.stringify(tasks));
      return tasks[index];
    }
    throw new Error('Task not found');
  }
};

export const deleteTaskItem = async (taskId) => {
  try {
    const res = await API.delete(`/tasks/${taskId}`);
    if (res.data.success) {
      return res.data;
    }
  } catch (err) {
    console.warn('Backend task deletion failed. Deleting locally.');
    const tasks = getLocalTasks();
    const filtered = tasks.filter(t => t._id !== taskId);
    localStorage.setItem('mock_tasks', JSON.stringify(filtered));
    return { success: true };
  }
};

export const generateStudyPlanAI = async (availableHours) => {
  try {
    const res = await API.post('/tasks/generate-plan', { availableHours });
    if (res.data.success) {
      return res.data;
    }
  } catch (err) {
    console.warn('Backend plan generation failed. Simulating offline planner.');
    
    const dailyPlan = [
      {
        subject: 'Indian Polity & Governance',
        title: 'Revision Spaced Repetition Review: Indian Constitution Features',
        activity: 'Revision Spaced Repetition Review',
        durationMinutes: 60,
        priority: 'high',
        reason: 'Overdue spaced repetition schedule',
        date: new Date().toISOString(),
        status: 'pending'
      },
      {
        subject: 'Economic Development',
        title: 'Deep Concept Learning: Inflation & GDP Mobilization',
        activity: 'Deep Concept Learning',
        durationMinutes: 90,
        priority: 'high',
        reason: 'Weak topic reinforcement focus',
        date: new Date().toISOString(),
        status: 'pending'
      },
      {
        subject: 'Modern Indian History',
        title: 'Core Concept Learning: Revolt of 1857 & Leaders',
        activity: 'Core Concept Learning',
        durationMinutes: 120,
        priority: 'medium',
        reason: 'Uncompleted syllabus target progression',
        date: new Date().toISOString(),
        status: 'pending'
      }
    ];

    const weeklyPlan = [
      {
        subject: 'Polity & Governance',
        title: 'Solve 50 MCQ Mock Test and Review Explanations',
        activity: 'Solve 50 MCQ Mock Test',
        durationMinutes: 180,
        priority: 'high',
        reason: 'Weekly performance validation',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending'
      }
    ];

    const monthlyPlan = [
      {
        subject: 'GS Paper II Complete',
        title: 'Finish all 12 core polity chapters & verify confidence levels',
        activity: 'Finish 12 Core Chapters',
        durationMinutes: 600,
        priority: 'high',
        reason: 'Syllabus milestone deadline',
        date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending'
      }
    ];

    return {
      success: true,
      dailyPlan,
      weeklyPlan,
      monthlyPlan
    };
  }
};

export const acceptStudyPlanAI = async (planTasks) => {
  try {
    const res = await API.post('/tasks/bulk-accept', { planTasks });
    if (res.data.success) {
      return res.data.tasks;
    }
  } catch (err) {
    console.warn('Backend bulk accept plan failed. Appending locally.');
    const tasks = getLocalTasks();
    const addedTasks = planTasks.map((t, idx) => ({
      _id: `mock-t-bulk-${Date.now()}-${idx}`,
      title: t.title,
      description: t.description || '',
      type: t.type || 'daily_task',
      date: t.date || new Date().toISOString(),
      status: 'pending',
      durationMinutes: t.durationMinutes || 0,
      subject: t.subject,
      activity: t.activity,
      priority: t.priority,
      reason: t.reason
    }));
    const merged = [...tasks, ...addedTasks];
    localStorage.setItem('mock_tasks', JSON.stringify(merged));
    return addedTasks;
  }
};
