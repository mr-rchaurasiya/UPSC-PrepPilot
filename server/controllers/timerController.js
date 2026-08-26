import StudySession from '../models/StudySession.js';
import StudentProfile from '../models/StudentProfile.js';
import Task from '../models/Task.js';

export const logStudySession = async (req, res, next) => {
  try {
    const { durationMinutes, topicId, notes, plannedDurationMinutes, subject, taskId, status } = req.body;
    const userId = req.user._id;

    if (!durationMinutes || durationMinutes <= 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid study session duration in minutes is required.'
      });
    }

    const session = await StudySession.create({
      user: userId,
      topic: topicId || null,
      subject: subject || '',
      task: taskId || null,
      durationMinutes,
      plannedDurationMinutes: plannedDurationMinutes || 0,
      status: status || 'completed',
      notes: notes || ''
    });

    // Mark task completed in database if matched
    if (taskId && status === 'completed') {
      await Task.findOneAndUpdate({ _id: taskId, user: userId }, { status: 'completed', actualDurationMinutes: durationMinutes });
    }

    // Increment Study Streak
    let profile = await StudentProfile.findOne({ user: userId });
    if (!profile) {
      profile = new StudentProfile({
        user: userId,
        streak: 1,
        lastStudyDate: new Date()
      });
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const lastDate = profile.lastStudyDate ? new Date(profile.lastStudyDate) : null;
      if (lastDate) {
        lastDate.setHours(0, 0, 0, 0);
        const diffTime = today.getTime() - lastDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          profile.streak += 1;
        } else if (diffDays > 1) {
          profile.streak = 1;
        }
      } else {
        profile.streak = 1;
      }
      profile.lastStudyDate = new Date();
    }
    await profile.save();

    res.status(201).json({
      success: true,
      message: 'Study session logged successfully.',
      session,
      streak: profile.streak
    });
  } catch (error) {
    next(error);
  }
};
