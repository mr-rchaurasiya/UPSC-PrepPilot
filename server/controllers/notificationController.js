import Notification from '../models/Notification.js';
import StudentProfile from '../models/StudentProfile.js';
import SyllabusProgress from '../models/SyllabusProgress.js';

export const getNotificationsList = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Check user preferences
    let profile = await StudentProfile.findOne({ user: userId });
    if (!profile) {
      profile = await StudentProfile.create({
        user: userId,
        targetExamYear: new Date().getFullYear() + 1,
        attemptNumber: 1,
        currentPreparationLevel: 'beginner',
        primaryPriority: 'Both',
        optionalSubject: 'Geography',
        availableStudyHoursPerDay: 6
      });
    }

    const prefs = profile.notificationPreferences || {
      revision: true,
      goal: true,
      test: true,
      streak: true,
      weak_topic: true,
      mains: true,
      recommendation: true
    };

    // Auto-generate helper notifications if empty (to avoid blank state)
    const count = await Notification.countDocuments({ user: userId });
    if (count === 0) {
      const initialNotifs = [];
      if (prefs.revision) {
        initialNotifs.push({
          user: userId,
          title: 'Overdue Revision Reminder',
          message: 'You have 3 syllabus topics due for spaced repetition revision review today.',
          category: 'revision'
        });
      }
      if (prefs.streak) {
        initialNotifs.push({
          user: userId,
          title: 'Study Streak Milestone',
          message: 'Excellent consistency! You are on a 5-day daily study streak. Activate focus mode to keep it alive.',
          category: 'streak'
        });
      }
      if (prefs.weak_topic) {
        initialNotifs.push({
          user: userId,
          title: 'Weak Topic Alert: Indian Economy',
          message: 'Your accuracy under Economic Development has dropped below 60%. Attempt weak topic MCQ drill.',
          category: 'weak_topic'
        });
      }
      if (prefs.mains) {
        initialNotifs.push({
          user: userId,
          title: 'Mains Practice Target',
          message: 'You have not submitted a Mains answer response in the last 3 days. Write a practice prompt today.',
          category: 'mains'
        });
      }

      if (initialNotifs.length > 0) {
        await Notification.insertMany(initialNotifs);
      }
    }

    // Filter query based on enabled categories
    const enabledCategories = [];
    Object.keys(prefs).forEach(key => {
      // Map preferences schema key to enum key (usually same)
      if (prefs[key] === true) {
        enabledCategories.push(key);
      }
    });

    const notifications = await Notification.find({
      user: userId,
      category: { $in: enabledCategories }
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      notifications,
      preferences: prefs
    });
  } catch (error) {
    next(error);
  }
};

export const markReadNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notif = await Notification.findOneAndUpdate(
      { _id: id, user: userId },
      { status: 'read' },
      { new: true }
    );

    if (!notif) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      notification: notif
    });
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;
    await Notification.updateMany({ user: userId, status: 'unread' }, { status: 'read' });

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read.'
    });
  } catch (error) {
    next(error);
  }
};

export const getNotificationPreferences = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const profile = await StudentProfile.findOne({ user: userId });
    
    res.status(200).json({
      success: true,
      preferences: profile?.notificationPreferences || {}
    });
  } catch (error) {
    next(error);
  }
};

export const updateNotificationPreferences = async (req, res, next) => {
  try {
    const { preferences } = req.body;
    const userId = req.user._id;

    const profile = await StudentProfile.findOneAndUpdate(
      { user: userId },
      { notificationPreferences: preferences },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Notification preferences updated successfully.',
      preferences: profile.notificationPreferences
    });
  } catch (error) {
    next(error);
  }
};
