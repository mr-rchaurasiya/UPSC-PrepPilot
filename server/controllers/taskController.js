import Task from '../models/Task.js';
import SyllabusProgress from '../models/SyllabusProgress.js';
import SyllabusTopic from '../models/SyllabusTopic.js';
import StudentProfile from '../models/StudentProfile.js';

export const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).populate('topic');
    res.status(200).json({
      success: true,
      tasks
    });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const { title, description, type, date, topicId, durationMinutes, subject, activity, priority, reason } = req.body;
    const userId = req.user._id;

    if (!title || !date) {
      return res.status(400).json({
        success: false,
        message: 'Task title and date are required.'
      });
    }

    const task = await Task.create({
      user: userId,
      title,
      description,
      type: type || 'daily_task',
      date: new Date(date),
      topic: topicId || null,
      subject,
      activity,
      priority: priority || 'medium',
      reason,
      durationMinutes: durationMinutes || 0
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      task
    });
  } catch (error) {
    next(error);
  }
};

export const toggleTaskStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const task = await Task.findOne({ _id: id, user: req.user._id });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.'
      });
    }

    task.status = task.status === 'completed' ? 'pending' : 'completed';
    if (task.status === 'completed' && task.actualDurationMinutes === 0) {
      task.actualDurationMinutes = task.durationMinutes; // match planned duration by default
    }
    await task.save();

    res.status(200).json({
      success: true,
      message: 'Task status updated successfully.',
      task
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const task = await Task.findOneAndUpdate({ _id: id, user: req.user._id }, updates, { new: true });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      task
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findOneAndDelete({ _id: id, user: req.user._id });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

export const generateStudyPlan = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { availableHours = 6 } = req.body;

    const userProfile = await StudentProfile.findOne({ user: userId });
    const dailyLimitMinutes = (userProfile?.dailyHours || availableHours) * 60;

    // Fetch overdue revisions
    const overdueRevisions = await SyllabusProgress.find({
      user: userId,
      nextRevisionDate: { $lte: new Date() }
    }).populate('topic');

    // Fetch weak topics
    const weakProgresses = await SyllabusProgress.find({
      user: userId,
      confidenceLevel: { $lte: 2 }
    }).populate('topic');

    const allTopics = await SyllabusTopic.find({});
    const completedTopicIds = (await SyllabusProgress.find({
      user: userId,
      status: 'Completed'
    })).map(p => p.topic.toString());

    const uncompletedTopics = allTopics.filter(t => !completedTopicIds.includes(t._id.toString()));

    const dailyPlan = [];
    const weeklyPlan = [];
    const monthlyPlan = [];
    
    let dailyAllocatedMinutes = 0;

    const addDailyTask = (subject, topicName, activity, duration, priority, reason, topicId = null) => {
      if (dailyAllocatedMinutes + duration <= dailyLimitMinutes) {
        dailyPlan.push({
          subject,
          title: `${activity}: ${topicName}`,
          activity,
          durationMinutes: duration,
          priority,
          reason,
          topic: topicId,
          date: new Date().toISOString(),
          status: 'pending'
        });
        dailyAllocatedMinutes += duration;
      }
    };

    // Revision Priority
    const maxRevisionMinutes = dailyLimitMinutes * 0.40;
    let revisionAllocated = 0;
    for (const rev of overdueRevisions) {
      if (revisionAllocated + 60 <= maxRevisionMinutes) {
        addDailyTask(
          rev.topic?.subject || 'Polity',
          rev.topic?.title || 'Constitutional Provisions',
          'Revision Spaced Repetition Review',
          60,
          'high',
          'Overdue spaced repetition schedule',
          rev.topic?._id
        );
        revisionAllocated += 60;
      }
    }

    // Weak Topics
    const maxWeakMinutes = dailyLimitMinutes * 0.40;
    let weakAllocated = 0;
    for (const wp of weakProgresses) {
      if (weakAllocated + 90 <= maxWeakMinutes) {
        addDailyTask(
          wp.topic?.subject || 'Economy',
          wp.topic?.title || 'GDP Mobilization',
          'Deep Concept Learning & Mistakes Review',
          90,
          'high',
          'Weak topic reinforcement focus',
          wp.topic?._id
        );
        weakAllocated += 90;
      }
    }

    // Next Syllabus Target
    for (const ut of uncompletedTopics) {
      if (dailyAllocatedMinutes + 120 <= dailyLimitMinutes) {
        addDailyTask(
          ut.subject,
          ut.title,
          'Core Concept Learning',
          120,
          'medium',
          'Uncompleted syllabus target progression',
          ut._id
        );
      }
    }

    if (dailyPlan.length === 0) {
      addDailyTask(
        'Indian Polity & Governance',
        'Fundamental Rights',
        'Read Laxmikanth Chapters 7-8',
        120,
        'medium',
        'Baseline default syllabus progression'
      );
    }

    weeklyPlan.push({
      subject: 'Polity & Governance',
      title: 'Solve 50 MCQ Mock Test and Review Explanations',
      activity: 'Solve 50 MCQ Mock Test',
      durationMinutes: 180,
      priority: 'high',
      reason: 'Weekly performance validation',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    });

    monthlyPlan.push({
      subject: 'GS Paper II Complete',
      title: 'Finish all 12 core polity chapters & verify confidence levels',
      activity: 'Finish 12 Core Chapters',
      durationMinutes: 600,
      priority: 'high',
      reason: 'Syllabus deadline target',
      date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString()
    });

    res.status(200).json({
      success: true,
      dailyPlan,
      weeklyPlan,
      monthlyPlan
    });
  } catch (error) {
    next(error);
  }
};

export const acceptBulkPlan = async (req, res, next) => {
  try {
    const { planTasks } = req.body;
    const userId = req.user._id;

    const createdTasks = [];
    for (const t of planTasks) {
      const task = await Task.create({
        user: userId,
        title: t.title,
        description: t.description || '',
        type: t.type || 'daily_task',
        date: new Date(t.date),
        topic: t.topic || null,
        subject: t.subject,
        activity: t.activity,
        priority: t.priority || 'medium',
        reason: t.reason,
        durationMinutes: t.durationMinutes || 0
      });
      createdTasks.push(task);
    }

    res.status(201).json({
      success: true,
      message: 'AI plan accepted and saved to calendar.',
      tasks: createdTasks
    });
  } catch (error) {
    next(error);
  }
};
