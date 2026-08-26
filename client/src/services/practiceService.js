import API from './api';

// Fallback mock questions
const mockQuestions = [
  {
    _id: 'mock-q1',
    subject: 'Indian Polity & Governance',
    paper: 'GS1',
    questionText: 'Which of the following parts of the Constitution of India describes India as a Secular State?',
    options: [
      'Fundamental Rights',
      'Preamble to the Constitution',
      'Directive Principles of State Policy',
      'Ninth Schedule'
    ],
    correctOption: 1,
    explanation: 'The Preamble to the Constitution of India declares India to be a "Sovereign Socialist Secular Democratic Republic". The word "Secular" was added by the 42nd Constitutional Amendment Act of 1976.',
    difficulty: 'easy',
    source: 'pyq',
    year: 2015
  },
  {
    _id: 'mock-q2',
    subject: 'Indian Polity & Governance',
    paper: 'GS1',
    questionText: 'Under the Indian Constitution, concentration of wealth violates which of the following principles?',
    options: [
      'The Right to Equality',
      'Directive Principles of State Policy',
      'The Right to Freedom',
      'The Concept of Welfare'
    ],
    correctOption: 1,
    explanation: 'According to Article 39(c) of the Constitution (Directive Principles of State Policy), the State shall direct its policy towards securing that the operation of the economic system does not result in the concentration of wealth and means of production to the common detriment.',
    difficulty: 'medium',
    source: 'pyq',
    year: 2021
  },
  {
    _id: 'mock-q3',
    subject: 'CSAT Aptitude',
    paper: 'CSAT',
    questionText: 'Two numbers are in the ratio 3:4. If 8 is added to both, the ratio becomes 4:5. What is the sum of the numbers?',
    options: [
      '48',
      '56',
      '64',
      '72'
    ],
    correctOption: 1,
    explanation: 'Let numbers be 3x and 4x. (3x + 8)/(4x + 8) = 4/5 => 5(3x + 8) = 4(4x + 8) => 15x + 40 = 16x + 32 => x = 8. Sum of numbers = 3x + 4x = 7x = 7(8) = 56.',
    difficulty: 'medium',
    source: 'mcq'
  }
];

const getLocalMockMistakes = () => {
  const mistakesStr = localStorage.getItem('mock_mistakes');
  if (!mistakesStr) {
    localStorage.setItem('mock_mistakes', JSON.stringify([]));
    return [];
  }
  return JSON.parse(mistakesStr);
};

export const getQuestionsList = async (filters = {}) => {
  try {
    const res = await API.get('/practice/questions', { params: filters });
    if (res.data.success && res.data.questions?.length > 0) {
      return res.data.questions;
    }
    return mockQuestions;
  } catch (err) {
    console.warn('Backend questions fetch failed. Servicing offline mock questions.');
    return mockQuestions;
  }
};

export const submitQuestionAnswer = async (questionId, selectedOption) => {
  try {
    const res = await API.post('/practice/questions/submit', { questionId, selectedOption });
    if (res.data.success) {
      return res.data;
    }
  } catch (err) {
    console.warn('Backend answer submission failed. Grading response offline.');
    const question = mockQuestions.find(q => q._id === questionId);
    if (!question) {
      throw new Error('Question not found');
    }
    
    const isCorrect = question.correctOption === selectedOption;
    
    if (!isCorrect) {
      const mistakes = getLocalMockMistakes();
      const existing = mistakes.find(m => m.question._id === questionId);
      if (!existing) {
        mistakes.push({
          _id: `mock-m-${Date.now()}`,
          question,
          selectedOption,
          status: 'unresolved',
          repeatedCount: 1,
          createdAt: new Date().toISOString()
        });
      } else {
        existing.repeatedCount = (existing.repeatedCount || 1) + 1;
        existing.selectedOption = selectedOption;
      }
      localStorage.setItem('mock_mistakes', JSON.stringify(mistakes));
    }

    return {
      success: true,
      isCorrect,
      correctOption: question.correctOption,
      explanation: question.explanation
    };
  }
};

export const getMistakesList = async () => {
  try {
    const res = await API.get('/practice/mistakes');
    if (res.data.success) {
      return res.data.mistakes;
    }
    return getLocalMockMistakes();
  } catch (err) {
    console.warn('Backend mistakes fetch failed. Servicing offline localStorage mistakes.');
    return getLocalMockMistakes();
  }
};

export const resolveMistakeItem = async (mistakeId) => {
  try {
    const res = await API.put(`/practice/mistakes/${mistakeId}/resolve`);
    if (res.data.success) {
      return res.data.mistake;
    }
  } catch (err) {
    console.warn('Backend mistake resolve failed. Resolving locally.');
    const mistakes = getLocalMockMistakes();
    const index = mistakes.findIndex(m => m._id === mistakeId);
    if (index !== -1) {
      mistakes.splice(index, 1);
      localStorage.setItem('mock_mistakes', JSON.stringify(mistakes));
    }
    return { success: true };
  }
};

export const toggleBookmarkItem = async (id) => {
  try {
    const res = await API.put(`/practice/questions/${id}/bookmark`);
    if (res.data.success) {
      return res.data;
    }
  } catch (err) {
    console.warn('Backend bookmark toggle failed. Simulating locally.');
    const bookmarksStr = localStorage.getItem('mock_bookmarks') || '[]';
    let bookmarks = JSON.parse(bookmarksStr);
    const index = bookmarks.indexOf(id);
    let isBookmarked = false;
    if (index !== -1) {
      bookmarks.splice(index, 1);
    } else {
      bookmarks.push(id);
      isBookmarked = true;
    }
    localStorage.setItem('mock_bookmarks', JSON.stringify(bookmarks));
    return { success: true, isBookmarked };
  }
};

export const getBookmarksList = async () => {
  try {
    const res = await API.get('/practice/questions/bookmarks');
    if (res.data.success) {
      return res.data.bookmarks;
    }
  } catch (err) {
    console.warn('Backend bookmarks list fetch failed. Simulating locally.');
    const bookmarksStr = localStorage.getItem('mock_bookmarks') || '[]';
    const bookmarks = JSON.parse(bookmarksStr);
    return mockQuestions.filter(q => bookmarks.includes(q._id));
  }
};

export const updateMistakeItem = async (id, payload) => {
  try {
    const res = await API.put(`/practice/mistakes/${id}`, payload);
    if (res.data.success) {
      return res.data.mistake;
    }
  } catch (err) {
    console.warn('Backend update mistake item failed. Simulating offline.');
    const mistakes = getLocalMockMistakes();
    const idx = mistakes.findIndex(m => m._id === id);
    if (idx !== -1) {
      mistakes[idx] = { ...mistakes[idx], ...payload };
      localStorage.setItem('mock_mistakes', JSON.stringify(mistakes));
      return mistakes[idx];
    }
    throw new Error('Mistake not found locally.');
  }
};

export const deleteMistakeItem = async (id) => {
  try {
    const res = await API.delete(`/practice/mistakes/${id}`);
    if (res.data.success) {
      return res.data;
    }
  } catch (err) {
    console.warn('Backend delete mistake item failed. Simulating offline.');
    const mistakes = getLocalMockMistakes();
    const filtered = mistakes.filter(m => m._id !== id);
    localStorage.setItem('mock_mistakes', JSON.stringify(filtered));
    return { success: true };
  }
};

export const deleteQuestionItem = async (qId) => {
  try {
    const res = await API.delete(`/practice/questions/${qId}`);
    if (res.data.success) {
      return res.data;
    }
  } catch (err) {
    console.warn('Backend delete question failed. Simulating locally.');
    return { success: true };
  }
};
