import SyllabusTopic from '../models/SyllabusTopic.js';
import SyllabusProgress from '../models/SyllabusProgress.js';

export const getSyllabus = async (req, res, next) => {
  try {
    const topics = await SyllabusTopic.find({});
    res.status(200).json({
      success: true,
      topics
    });
  } catch (error) {
    next(error);
  }
};

export const getProgress = async (req, res, next) => {
  try {
    const progressList = await SyllabusProgress.find({ user: req.user._id });
    res.status(200).json({
      success: true,
      progress: progressList
    });
  } catch (error) {
    next(error);
  }
};

export const updateProgress = async (req, res, next) => {
  try {
    const { topicId } = req.params;
    const { status, confidence, studyTime, notes, nextRevisionDate } = req.body;

    // Check if topic exists
    const topicExists = await SyllabusTopic.findById(topicId);
    if (!topicExists) {
      return res.status(404).json({
        success: false,
        message: 'Syllabus topic not found.'
      });
    }

    // Find or create progress record
    let progress = await SyllabusProgress.findOne({ user: req.user._id, topic: topicId });

    if (!progress) {
      progress = new SyllabusProgress({
        user: req.user._id,
        topic: topicId
      });
    }

    if (status) {
      if (status === 'Completed' && progress.status !== 'Completed') {
        progress.revisionCount += 1;
        progress.lastRevisedAt = new Date();
      }
      progress.status = status;
    }
    
    if (confidence !== undefined) progress.confidence = confidence;
    if (studyTime !== undefined) progress.studyTime += studyTime; // Add incremental study time
    if (notes !== undefined) progress.notes = notes;
    if (nextRevisionDate !== undefined) progress.nextRevisionDate = nextRevisionDate ? new Date(nextRevisionDate) : null;

    await progress.save();

    res.status(200).json({
      success: true,
      message: 'Syllabus progress updated successfully.',
      progress
    });
  } catch (error) {
    next(error);
  }
};

export const getRevisionDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const progresses = await SyllabusProgress.find({ user: userId }).populate('topic');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueToday = [];
    const overdue = [];
    const upcoming = [];
    const completed = [];

    progresses.forEach(p => {
      if (!p.nextRevisionDate) {
        if (p.revisionCount > 0 || p.status === 'Completed' || p.status === 'Revised') {
          completed.push(p);
        }
        return;
      }

      const revDate = new Date(p.nextRevisionDate);
      revDate.setHours(0, 0, 0, 0);

      if (revDate.getTime() === today.getTime()) {
        dueToday.push(p);
      } else if (revDate.getTime() < today.getTime()) {
        overdue.push(p);
      } else {
        upcoming.push(p);
      }

      if (p.revisionCount > 0 || p.status === 'Completed' || p.status === 'Revised') {
        completed.push(p);
      }
    });

    res.status(200).json({
      success: true,
      dueToday,
      overdue,
      upcoming,
      completed
    });
  } catch (error) {
    next(error);
  }
};

export const rateRevisionTopic = async (req, res, next) => {
  try {
    const { topicId } = req.params;
    const { rating } = req.body; // 'Forgot', 'Partially Remembered', 'Remembered', 'Strong'
    const userId = req.user._id;

    let progress = await SyllabusProgress.findOne({ user: userId, topic: topicId });
    if (!progress) {
      progress = new SyllabusProgress({
        user: userId,
        topic: topicId
      });
    }

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

    progress.status = status;
    progress.confidence = confidence;
    progress.revisionCount += 1;
    progress.lastRevisedAt = new Date();
    progress.nextRevisionDate = nextDate;

    await progress.save();

    res.status(200).json({
      success: true,
      message: 'Revision rating applied successfully.',
      progress
    });
  } catch (error) {
    next(error);
  }
};
