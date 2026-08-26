import API from './api';

const getLocalMainsHistory = () => {
  const historyStr = localStorage.getItem('mock_mains_history');
  if (!historyStr) {
    localStorage.setItem('mock_mains_history', JSON.stringify([]));
    return [];
  }
  return JSON.parse(historyStr);
};

export const submitAnswerToEvaluator = async (questionText, topicId, answerText, questionMeta = {}) => {
  try {
    const payload = { questionText, topicId, answerText, ...questionMeta };
    const res = await API.post('/mains/submit', payload);
    if (res.data.success) {
      return res.data.mainsAnswer;
    }
  } catch (err) {
    console.warn('Backend evaluation failed. Running offline mock grading evaluation.');
    
    const wordCount = answerText.trim().split(/\s+/).length;
    let score = 5.5;
    let introScore = 6;
    let bodyScore = 5;
    let conclusionScore = 6;
    const suggestions = [];

    const hasArticles = /article|amendment|schedule/i.test(answerText);
    const hasCases = /court|judgment|case/i.test(answerText);
    const hasWayForward = /way forward|conclusion|summary/i.test(answerText);

    if (hasArticles) bodyScore += 1.5;
    else suggestions.push('Incorporate specific Constitutional Articles to support statements.');

    if (hasCases) bodyScore += 1.5;
    else suggestions.push('Reference relevant Supreme Court cases or committee reports.');

    if (hasWayForward) conclusionScore += 2;
    else suggestions.push('Conclude with a progressive "Way Forward" suggesting viable recommendations.');

    const weighted = (introScore * 0.2) + (bodyScore * 0.5) + (conclusionScore * 0.2) + (6 * 0.1);
    score = parseFloat(weighted.toFixed(1));

    const mockAnswer = {
      _id: `mock-ans-${Date.now()}`,
      questionText,
      answerText,
      status: 'evaluated',
      questionYear: questionMeta.questionYear || 2025,
      questionPaper: questionMeta.questionPaper || 'GS-II',
      questionSubject: questionMeta.questionSubject || 'Polity',
      questionMarks: questionMeta.questionMarks || 15,
      questionWordLimit: questionMeta.questionWordLimit || 250,
      questionDirective: questionMeta.questionDirective || 'Critically Analyze',
      
      evaluation: {
        score,
        introScore,
        bodyScore,
        conclusionScore,
        structureFeedback: 'The structure matches general essay standards. Introduction states context. Headings are legible.',
        contentFeedback: 'The response lists core points. Add historical context and Sarkaria Commission guidelines.',
        suggestions: suggestions.length > 0 ? suggestions : ['Include statistical datasets to validate statements.', 'Keep sentences crisp to improve presentation.'],
        strengths: ['Logical presentation flow', 'Legible arguments breakdown'],
        weaknesses: ['Lack of statistical data points', 'Fewer committee recommendations'],
        missingDimensions: ['Constitutional safety safeguards', 'Sarkaria commission report benchmarks'],
        improvementSuggestions: ['Reference NCRWC suggestions', 'Create point-wise list blocks'],
        idealStructure: 'Intro: Define federalism -> Body: Detail federal features vs unitary characters -> Conclusion: Way forward cooperations',
        suggestedExamples: ['Bommai Judgment 1994', 'Finance Commission report datasets'],
        suggestedConclusion: 'A strong federal union requires healthy cooperative mechanisms balancing central governance with state interests.',
        estimatedWordCount: wordCount,
        modelAnswerOutline: '1. Introduction mapping federal definition. 2. Unitary characteristics analysis. 3. Safe checks & Way Forward.',
        isAdvisory: true,
        evaluatedAt: new Date().toISOString()
      },
      createdAt: new Date().toISOString()
    };

    const history = getLocalMainsHistory();
    history.unshift(mockAnswer);
    localStorage.setItem('mock_mains_history', JSON.stringify(history));

    return mockAnswer;
  }
};

export const getMainsHistory = async () => {
  try {
    const res = await API.get('/mains/history');
    if (res.data.success) {
      return res.data.history;
    }
    return getLocalMainsHistory();
  } catch (err) {
    console.warn('Backend mains history fetch failed. Serving local mock history.');
    return getLocalMainsHistory();
  }
};
