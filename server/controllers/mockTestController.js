import MockTestHistory from '../models/MockTestHistory.js';
import Question from '../models/Question.js';
import Mistake from '../models/Mistake.js';

export const submitMockTest = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { mode, answers, timeSpentSeconds } = req.body;

    let correct = 0;
    let wrong = 0;
    let skipped = 0;
    const totalQuestions = answers.length;

    const subjectMap = {};

    for (const ans of answers) {
      const { questionId, selectedOption } = ans;
      const question = await Question.findById(questionId);
      if (!question) continue;

      const sub = question.subject;
      if (!subjectMap[sub]) {
        subjectMap[sub] = { total: 0, correct: 0 };
      }
      subjectMap[sub].total += 1;

      if (selectedOption === null || selectedOption === undefined || selectedOption === -1) {
        skipped += 1;
      } else {
        const isCorrect = question.correctOption === selectedOption;
        if (isCorrect) {
          correct += 1;
          subjectMap[sub].correct += 1;
        } else {
          wrong += 1;
          await Mistake.findOneAndUpdate(
            { user: userId, question: questionId, status: 'unresolved' },
            { selectedOption },
            { upsert: true, new: true }
          );
        }
      }
    }

    const attempted = correct + wrong;
    const score = parseFloat(((correct * 2.0) - (wrong * 0.66)).toFixed(2));
    const negativeMarks = parseFloat((wrong * 0.66).toFixed(2));
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

    const subjectBreakdown = Object.keys(subjectMap).map(sub => ({
      subject: sub,
      total: subjectMap[sub].total,
      correct: subjectMap[sub].correct
    }));

    const history = await MockTestHistory.create({
      user: userId,
      mode,
      score,
      totalQuestions,
      attempted,
      correct,
      wrong,
      skipped,
      negativeMarks,
      accuracy,
      timeSpentSeconds,
      subjectBreakdown
    });

    res.status(201).json({
      success: true,
      message: 'Mock test evaluation complete.',
      history
    });
  } catch (error) {
    next(error);
  }
};

export const getMockTestHistory = async (req, res, next) => {
  try {
    const history = await MockTestHistory.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      history
    });
  } catch (error) {
    next(error);
  }
};
