import API from './api';

// Fallback mock syllabus topics
const mockTopics = [
  {
    _id: 'mock-s1',
    subject: 'Indian Polity & Governance',
    paper: 'GS2',
    code: 'GS2-POLITY-01',
    title: 'Indian Constitution - Historical Underpinnings & Features',
    description: 'Historical underpinnings, evolution, features, amendments, significant provisions and basic structure.',
    subtopics: [
      'Regulating Act 1773 & Charter Acts',
      'Government of India Acts 1919 & 1935',
      'Constituent Assembly and Making of Constitution',
      'Preamble & Salient Features',
      'Amendments & Basic Structure Doctrine'
    ]
  },
  {
    _id: 'mock-s2',
    subject: 'Indian Polity & Governance',
    paper: 'GS2',
    code: 'GS2-POLITY-02',
    title: 'Union and the States - Functions & Responsibilities',
    description: 'Functions and responsibilities of the Union and the States, federal structure challenges, and local devolution.',
    subtopics: [
      'Federal vs Unitary features',
      'Seventh Schedule division of powers',
      'Inter-state councils & relations',
      'Panchayati Raj & Devolution of funds',
      'Emergency provisions'
    ]
  },
  {
    _id: 'mock-s3',
    subject: 'Modern Indian History & Culture',
    paper: 'GS1',
    code: 'GS1-HISTORY-01',
    title: 'Indian Culture - Art Forms & Architecture',
    description: 'Salient aspects of Art Forms, Literature and Architecture from ancient to modern times.',
    subtopics: [
      'Mauryan & Temple Architecture',
      'Classical Dance Forms and Music',
      'Bhakti & Sufi movements',
      'Indus Valley Civilization sites'
    ]
  },
  {
    _id: 'mock-s4',
    subject: 'Economic Development',
    paper: 'GS3',
    code: 'GS3-ECONOMY-01',
    title: 'Indian Economy & Issues Relating to Planning',
    description: 'Indian Economy and issues relating to planning, mobilization of resources, growth, development and employment.',
    subtopics: [
      'Five-Year Plans history',
      'Inclusive Growth indices',
      'Capital mobilization methods',
      'Job creation & unemployment trends'
    ]
  },
  {
    _id: 'mock-s5',
    subject: 'Ethics, Integrity & Aptitude',
    paper: 'GS4',
    code: 'GS4-ETHICS-01',
    title: 'Ethics and Human Interface',
    description: 'Essence, determinants and consequences of Ethics in-human actions; dimensions of ethics; ethics in private and public relationships.',
    subtopics: [
      'Moral philosophies & thinkers',
      'Values in public administration',
      'Emotional intelligence utilities',
      'Case study approaches'
    ]
  },
  {
    _id: 'mock-s6',
    subject: 'CSAT Aptitude',
    paper: 'CSAT',
    code: 'CSAT-QUANT-01',
    title: 'Quantitative Aptitude & Number Systems',
    description: 'Basic numeracy (numbers and their relations, orders of magnitude, etc. - Class X level).',
    subtopics: [
      'Prime numbers and Divisibility rules',
      'HCF and LCM structures',
      'Percentages & Profit and Loss',
      'Ratios, Proportions & Averages'
    ]
  }
];

// Helper to get local mock progress
const getLocalMockProgress = () => {
  const progressStr = localStorage.getItem('mock_syllabus_progress');
  if (!progressStr) {
    const initialProgress = mockTopics.map(topic => ({
      topic: topic._id,
      status: 'Not Started',
      confidence: 3,
      revisionCount: 0,
      notes: '',
      nextRevisionDate: null
    }));
    localStorage.setItem('mock_syllabus_progress', JSON.stringify(initialProgress));
    return initialProgress;
  }
  return JSON.parse(progressStr);
};

export const getSyllabusList = async () => {
  try {
    const res = await API.get('/syllabus');
    if (res.data.success && res.data.topics?.length > 0) {
      return res.data.topics;
    }
    return mockTopics;
  } catch (err) {
    console.warn('Backend syllabus retrieval failed. Using mock syllabus topics.');
    return mockTopics;
  }
};

export const getSyllabusProgress = async () => {
  try {
    const res = await API.get('/syllabus/progress');
    if (res.data.success) {
      return res.data.progress;
    }
    return getLocalMockProgress();
  } catch (err) {
    console.warn('Backend syllabus progress retrieval failed. Using mock localStorage progress.');
    return getLocalMockProgress();
  }
};

export const updateSyllabusProgress = async (topicId, progressData) => {
  try {
    const res = await API.put(`/syllabus/progress/${topicId}`, progressData);
    if (res.data.success) {
      return res.data.progress;
    }
  } catch (err) {
    console.warn('Backend syllabus progress update failed. Updating mock localStorage progress.');
    const localProgress = getLocalMockProgress();
    const index = localProgress.findIndex(p => p.topic === topicId);
    
    const updatedRecord = {
      topic: topicId,
      status: progressData.status || 'Not Started',
      confidence: progressData.confidence !== undefined ? progressData.confidence : 3,
      revisionCount: progressData.status === 'Completed' ? 1 : 0,
      notes: progressData.notes || '',
      nextRevisionDate: progressData.nextRevisionDate || null,
      lastRevisedAt: progressData.status === 'Completed' ? new Date().toISOString() : null
    };

    if (index !== -1) {
      localProgress[index] = { ...localProgress[index], ...updatedRecord };
    } else {
      localProgress.push(updatedRecord);
    }
    
    localStorage.setItem('mock_syllabus_progress', JSON.stringify(localProgress));
    return updatedRecord;
  }
};
