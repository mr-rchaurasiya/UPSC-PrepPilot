import Question from '../models/Question.js';
import Mistake from '../models/Mistake.js';

export const getPracticeQuestions = async (req, res, next) => {
  try {
    const { subject, paper, source, difficulty } = req.query;

    const filter = {};
    if (subject) filter.subject = subject;
    if (paper) filter.paper = paper;
    if (source) filter.source = source;
    if (difficulty) filter.difficulty = difficulty;

    const questions = await Question.find(filter).populate('topic');
    res.status(200).json({
      success: true,
      questions
    });
  } catch (error) {
    next(error);
  }
};

export const submitPracticeAnswer = async (req, res, next) => {
  try {
    const { questionId, selectedOption } = req.body;
    const userId = req.user._id;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found.'
      });
    }

    const isCorrect = question.correctOption === selectedOption;

    if (!isCorrect) {
      // Log to Mistake Book if not already active
      const existingMistake = await Mistake.findOne({
        user: userId,
        question: questionId,
        status: 'unresolved'
      });

      if (!existingMistake) {
        await Mistake.create({
          user: userId,
          question: questionId,
          selectedOption,
          repeatedCount: 1
        });
      } else {
        existingMistake.repeatedCount = (existingMistake.repeatedCount || 1) + 1;
        existingMistake.selectedOption = selectedOption;
        await existingMistake.save();
      }
    }

    res.status(200).json({
      success: true,
      isCorrect,
      correctOption: question.correctOption,
      explanation: question.explanation
    });
  } catch (error) {
    next(error);
  }
};

export const getMistakes = async (req, res, next) => {
  try {
    const { category, subject, status, search } = req.query;

    const filter = { user: req.user._id };
    if (status) {
      filter.status = status;
    } else {
      filter.status = 'unresolved';
    }
    if (category) filter.category = category;

    let mistakes = await Mistake.find(filter)
      .populate({
        path: 'question',
        populate: { path: 'topic' }
      });

    if (subject) {
      mistakes = mistakes.filter(m => m.question && m.question.subject === subject);
    }
    if (search) {
      const q = search.toLowerCase();
      mistakes = mistakes.filter(m => 
        m.question && 
        (m.question.questionText.toLowerCase().includes(q) || 
         (m.personalNote && m.personalNote.toLowerCase().includes(q)))
      );
    }

    res.status(200).json({
      success: true,
      mistakes
    });
  } catch (error) {
    next(error);
  }
};

export const updateMistake = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, category, personalNote, confidenceLevel } = req.body;

    const mistake = await Mistake.findOne({ _id: id, user: req.user._id });
    if (!mistake) {
      return res.status(404).json({
        success: false,
        message: 'Mistake record not found.'
      });
    }

    if (status) mistake.status = status;
    if (category) mistake.category = category;
    if (personalNote !== undefined) mistake.personalNote = personalNote;
    if (confidenceLevel !== undefined) mistake.confidenceLevel = confidenceLevel;

    await mistake.save();

    res.status(200).json({
      success: true,
      message: 'Mistake updated successfully.',
      mistake
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMistake = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mistake = await Mistake.findOneAndDelete({ _id: id, user: req.user._id });
    if (!mistake) {
      return res.status(404).json({
        success: false,
        message: 'Mistake record not found.'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Mistake removed successfully.'
    });
  } catch (error) {
    next(error);
  }
};

export const resolveMistake = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mistake = await Mistake.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { status: 'resolved' },
      { new: true }
    );

    if (!mistake) {
      return res.status(404).json({
        success: false,
        message: 'Mistake record not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Mistake resolved successfully.',
      mistake
    });
  } catch (error) {
    next(error);
  }
};

export const toggleBookmark = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found.'
      });
    }

    const isBookmarked = question.bookmarkedBy.includes(userId);
    if (isBookmarked) {
      question.bookmarkedBy = question.bookmarkedBy.filter(u => u.toString() !== userId.toString());
    } else {
      question.bookmarkedBy.push(userId);
    }

    await question.save();

    res.status(200).json({
      success: true,
      message: isBookmarked ? 'Bookmark removed.' : 'Question bookmarked.',
      isBookmarked: !isBookmarked
    });
  } catch (error) {
    next(error);
  }
};

export const getBookmarks = async (req, res, next) => {
  try {
    const bookmarks = await Question.find({ bookmarkedBy: req.user._id }).populate('topic');
    res.status(200).json({
      success: true,
      bookmarks
    });
  } catch (error) {
    next(error);
  }
};

export const createQuestion = async (req, res, next) => {
  try {
    const { subject, paper, topic, questionText, options, correctOption, explanation, difficulty, source, year, reference, tags } = req.body;
    
    const question = await Question.create({
      subject,
      paper,
      topic: topic || null,
      questionText,
      options,
      correctOption,
      explanation,
      difficulty,
      source,
      year,
      reference,
      tags
    });

    res.status(201).json({
      success: true,
      message: 'Question created successfully.',
      question
    });
  } catch (error) {
    next(error);
  }
};

export const updateQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const question = await Question.findByIdAndUpdate(id, updates, { new: true });
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Question updated successfully.',
      question
    });
  } catch (error) {
    next(error);
  }
};

export const deleteQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;

    const question = await Question.findByIdAndDelete(id);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
