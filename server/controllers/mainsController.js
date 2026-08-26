import MainsAnswer from '../models/MainsAnswer.js';
import { evaluateAnswer } from '../services/ai/evaluationEngine.js';

export const submitMainsAnswer = async (req, res, next) => {
  try {
    const { 
      questionText, 
      topicId, 
      answerText,
      questionYear,
      questionPaper,
      questionSubject,
      questionTopic,
      questionMarks,
      questionWordLimit,
      questionDirective
    } = req.body;
    
    const userId = req.user._id;

    if (!questionText || !answerText) {
      return res.status(400).json({
        success: false,
        message: 'Question and answer texts are required.'
      });
    }

    const evalReport = await evaluateAnswer(questionText, answerText);

    const mainsAnswer = await MainsAnswer.create({
      user: userId,
      questionText,
      topic: topicId || null,
      answerText,
      status: 'evaluated',

      questionYear,
      questionPaper,
      questionSubject,
      questionTopic,
      questionMarks,
      questionWordLimit,
      questionDirective,

      evaluation: {
        score: evalReport.score,
        introScore: evalReport.introScore,
        bodyScore: evalReport.bodyScore,
        conclusionScore: evalReport.conclusionScore,
        structureFeedback: evalReport.structureFeedback,
        contentFeedback: evalReport.contentFeedback,
        suggestions: evalReport.suggestions,
        evaluatedAt: new Date(),

        strengths: evalReport.strengths || [],
        weaknesses: evalReport.weaknesses || [],
        missingDimensions: evalReport.missingDimensions || [],
        improvementSuggestions: evalReport.improvementSuggestions || [],
        idealStructure: evalReport.idealStructure || '',
        suggestedExamples: evalReport.suggestedExamples || [],
        suggestedConclusion: evalReport.suggestedConclusion || '',
        estimatedWordCount: evalReport.estimatedWordCount || 0,
        modelAnswerOutline: evalReport.modelAnswerOutline || '',
        isAdvisory: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Mains answer evaluated successfully by PrepPilot AI.',
      mainsAnswer
    });
  } catch (error) {
    next(error);
  }
};

export const getAnswerHistory = async (req, res, next) => {
  try {
    const history = await MainsAnswer.find({ user: req.user._id })
      .populate('topic')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      history
    });
  } catch (error) {
    next(error);
  }
};

export const getEvaluationReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const report = await MainsAnswer.findOne({ _id: id, user: req.user._id }).populate('topic');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Evaluation report not found.'
      });
    }

    res.status(200).json({
      success: true,
      report
    });
  } catch (error) {
    next(error);
  }
};
