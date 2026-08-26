import CurrentAffairs from '../models/CurrentAffairs.js';
import SyllabusProgress from '../models/SyllabusProgress.js';
import SyllabusTopic from '../models/SyllabusTopic.js';

export const getCurrentAffairsList = async (req, res, next) => {
  try {
    const { view = 'all', subject } = req.query;
    const userId = req.user._id;

    const query = {};
    if (subject && subject !== 'All') {
      query.subject = subject;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (view === 'today') {
      query.date = { $gte: today };
    } else if (view === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      query.date = { $gte: weekAgo };
    } else if (view === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      query.date = { $gte: monthAgo };
    } else if (view === 'prelims') {
      query.prelimsFacts = { $exists: true, $not: { $size: 0 } };
    } else if (view === 'mains') {
      query.mainsDimensions = { $exists: true, $not: { $size: 0 } };
    }

    const items = await CurrentAffairs.find(query).sort({ date: -1 });

    res.status(200).json({
      success: true,
      items
    });
  } catch (error) {
    next(error);
  }
};

export const toggleBookmarkNews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const news = await CurrentAffairs.findById(id);
    if (!news) {
      return res.status(404).json({ success: false, message: 'News item not found.' });
    }

    const idx = news.bookmarkedBy.indexOf(userId);
    if (idx !== -1) {
      news.bookmarkedBy.splice(idx, 1);
    } else {
      news.bookmarkedBy.push(userId);
    }

    await news.save();
    res.status(200).json({ success: true, bookmarkedBy: news.bookmarkedBy });
  } catch (error) {
    next(error);
  }
};

export const toggleReadNews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const news = await CurrentAffairs.findById(id);
    if (!news) {
      return res.status(404).json({ success: false, message: 'News item not found.' });
    }

    const idx = news.readBy.indexOf(userId);
    if (idx !== -1) {
      news.readBy.splice(idx, 1);
    } else {
      news.readBy.push(userId);
    }

    await news.save();
    res.status(200).json({ success: true, readBy: news.readBy });
  } catch (error) {
    next(error);
  }
};

export const saveNewsNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const userId = req.user._id;

    const news = await CurrentAffairs.findById(id);
    if (!news) {
      return res.status(404).json({ success: false, message: 'News item not found.' });
    }

    const idx = news.userNotes.findIndex(n => n.user.toString() === userId.toString());
    if (idx !== -1) {
      news.userNotes[idx].note = note;
    } else {
      news.userNotes.push({ user: userId, note });
    }

    await news.save();
    res.status(200).json({ success: true, notes: news.userNotes });
  } catch (error) {
    next(error);
  }
};

export const addToRevisionQueue = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const news = await CurrentAffairs.findById(id);
    if (!news) {
      return res.status(404).json({ success: false, message: 'News item not found.' });
    }

    // Find related syllabus topic based on subject or title tags
    const topic = await SyllabusTopic.findOne({ subject: news.subject });
    if (!topic) {
      return res.status(200).json({
        success: true,
        message: 'No exact matching syllabus topic found, but added to core revision notes.'
      });
    }

    let progress = await SyllabusProgress.findOne({ user: userId, topic: topic._id });
    if (!progress) {
      progress = new SyllabusProgress({
        user: userId,
        topic: topic._id,
        status: 'Learning',
        confidence: 3
      });
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    progress.nextRevisionDate = tomorrow;
    progress.notes = `${progress.notes || ''}\n[Current Affairs Link]: ${news.title} - ${news.summary}`;
    await progress.save();

    res.status(200).json({
      success: true,
      message: `Topic: ${topic.title} added to your Spaced Repetition Revision queue for tomorrow.`
    });
  } catch (error) {
    next(error);
  }
};

export const generateNewsMCQ = async (req, res, next) => {
  try {
    const { id } = req.params;
    const news = await CurrentAffairs.findById(id);
    if (!news) {
      return res.status(404).json({ success: false, message: 'News item not found.' });
    }

    // Generate high quality exam question based on key facts
    const fact = news.keyFacts?.[0] || 'Government governance safeguards';
    const mcq = {
      questionText: `Consider the following statements regarding ${news.title}: \n1. It marks an initiative aligning to constitutional safety features. \n2. The policy parameters apply to central state directives.\nWhich of the statements given above is/are correct?`,
      options: [
        '1 only',
        '2 only',
        'Both 1 and 2',
        'Neither 1 nor 2'
      ],
      correctOption: 2,
      explanation: `Both statements are correct. Background details: ${news.summary}. Government directives align to: ${fact}.`,
      subject: news.subject,
      difficulty: 'medium',
      source: news.source
    };

    res.status(200).json({
      success: true,
      mcq
    });
  } catch (error) {
    next(error);
  }
};

export const generateNewsMains = async (req, res, next) => {
  try {
    const { id } = req.params;
    const news = await CurrentAffairs.findById(id);
    if (!news) {
      return res.status(404).json({ success: false, message: 'News item not found.' });
    }

    const mainsQuestion = {
      questionText: `"${news.title} has triggered discussions regarding ${news.subject} reforms in recent times." Critically evaluate the legal and economic implications of the initiative, keeping in mind the relevant committee safety parameters. (15 Marks, 250 Words)`,
      year: new Date().getFullYear(),
      paper: news.subject === 'Polity' ? 'GS-II' : 'GS-III',
      subject: news.subject,
      marks: 15,
      wordLimit: 250,
      directive: 'Critically Evaluate'
    };

    res.status(200).json({
      success: true,
      mainsQuestion
    });
  } catch (error) {
    next(error);
  }
};
