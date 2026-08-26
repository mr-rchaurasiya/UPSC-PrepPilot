import User from '../models/User.js';
import SyllabusTopic from '../models/SyllabusTopic.js';
import Question from '../models/Question.js';
import CurrentAffairs from '../models/CurrentAffairs.js';
import DocumentModel from '../models/Document.js';
import MockTestHistory from '../models/MockTestHistory.js';
import MainsAnswer from '../models/MainsAnswer.js';
import StudySession from '../models/StudySession.js';

export const getAdminOverview = async (req, res, next) => {
  try {
    const usersCount = await User.countDocuments({});
    const syllabusCount = await SyllabusTopic.countDocuments({});
    
    // PYQs are Questions with an exam stage, MCQs are standard questions
    const pyqCount = await Question.countDocuments({ examStage: { $exists: true } });
    const mcqCount = await Question.countDocuments({ examStage: { $exists: false } });
    
    const newsCount = await CurrentAffairs.countDocuments({});
    const docsCount = await DocumentModel.countDocuments({});
    const mockAttemptsCount = await MockTestHistory.countDocuments({});
    const mainsSubmissionsCount = await MainsAnswer.countDocuments({});
    const focusSessionsCount = await StudySession.countDocuments({});

    res.status(200).json({
      success: true,
      stats: {
        usersCount,
        syllabusCount,
        pyqCount,
        mcqCount,
        newsCount,
        docsCount,
        mockAttemptsCount,
        mainsSubmissionsCount,
        focusSessionsCount,
        reportedCount: 2 // Simulated reported content
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminUsers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account ${isActive ? 'activated' : 'deactivated'} successfully.`,
      user
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['student', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User role updated successfully.',
      user
    });
  } catch (error) {
    next(error);
  }
};
