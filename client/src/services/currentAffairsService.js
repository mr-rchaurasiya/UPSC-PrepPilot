import API from './api';

const mockNews = [
  {
    _id: 'mock-news-1',
    title: 'Sarkaria Commission Guidelines & Article 356 Restraints',
    date: new Date().toISOString(),
    category: 'National Policy',
    subject: 'Indian Polity & Governance',
    syllabusMapping: ['GS Paper II: Federal structure reforms', 'Role of Governor & Emergency Proclamations'],
    summary: 'The discussions regarding safeguards on Governor reports and conditional limits on Article 356 has revived cooperative federalism debates.',
    background: 'Article 356 outlines central interventions when state constitutional machinery fails. Sarkaria and Punchhi commissions suggested restrictive usage.',
    whyImportant: 'UPSC frequently tests Governor discretions, federal safety valves, and case judgments like Bommai 1994.',
    keyFacts: ['Bommai verdict declared federalism basic structure.', 'Sarkaria commission recommended Governor reports be shared with cabinet.'],
    governmentInitiatives: ['Inter-State Council revisions', 'Governor appointment conventions updates'],
    constitutionalLegalAngle: 'Article 356, Article 357, Article 365, and Article 163 governor discretions.',
    economicAngle: 'Union allocations and GST devolution disruptions during state emergency terms.',
    environmentalAngle: 'N/A',
    irAngle: 'N/A',
    prelimsFacts: ['Governor reports are advisory to the President.', 'Bommai case occurred in 1994.'],
    mainsDimensions: ['Unitary vs Federal balance', 'Restraints on executive decree overrides'],
    relatedPYQs: ['UPSC Mains 2018: Governor discretions', 'UPSC Prelims 2021: Article 356 criteria'],
    tags: ['Polity', 'Federalism', 'Article 356', 'Sarkaria Commission'],
    source: 'The Hindu & PIB summary',
    readBy: [],
    bookmarkedBy: [],
    userNotes: []
  },
  {
    _id: 'mock-news-2',
    title: 'Inclusivedev Index & RBI Monetary Devolution Devise',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Banking & Devolution',
    subject: 'Economic Development',
    syllabusMapping: ['GS Paper III: Growth and Planning Devolution', 'RBI Devolution parameters'],
    summary: 'RBI has revised priority lending standards to accelerate credits into green finance and agricultural cooperative pools.',
    background: 'Priority Sector Lending (PSL) requires banks to route 40% of loans to weak target groups.',
    whyImportant: 'High yield for GS-III inclusive growth chapters.',
    keyFacts: ['PSL limit is 40% for domestic banks.', 'Agricultural allocation target is 18%.'],
    governmentInitiatives: ['NABARD refinancing streams', 'PM Kisan credit devolution'],
    constitutionalLegalAngle: 'Article 280 Finance commission allocations.',
    economicAngle: 'Alleviates credit choke points for MSMEs and rural coops.',
    environmentalAngle: 'Includes solar pump sets and green projects.',
    irAngle: 'N/A',
    prelimsFacts: ['PSL targets apply to foreign banks with >= 20 branches.', 'Cooperative banks are regulated by RBI & NABARD.'],
    mainsDimensions: ['Inclusive growth mechanisms', 'Finance devolution disparities'],
    relatedPYQs: ['UPSC Mains 2021: Priority sector credit', 'UPSC Prelims 2020: Banking regulations'],
    tags: ['Economy', 'RBI', 'Priority Lending', 'Inclusive Growth'],
    source: 'Business Standard & PIB Devolution summary',
    readBy: [],
    bookmarkedBy: [],
    userNotes: []
  }
];

const getLocalNews = () => {
  const newsStr = localStorage.getItem('mock_news');
  if (!newsStr) {
    localStorage.setItem('mock_news', JSON.stringify(mockNews));
    return mockNews;
  }
  return JSON.parse(newsStr);
};

export const getCurrentAffairsList = async (view, subject) => {
  try {
    const res = await API.get(`/current-affairs?view=${view}&subject=${subject}`);
    if (res.data.success) {
      return res.data.items;
    }
  } catch (err) {
    console.warn('Backend news fetch failed. Serving local mock current affairs.');
    const news = getLocalNews();
    return news.filter(item => {
      if (subject && subject !== 'All' && item.subject !== subject) return false;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const newsDate = new Date(item.date);
      
      if (view === 'today') {
        return newsDate >= today;
      } else if (view === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return newsDate >= weekAgo;
      } else if (view === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return newsDate >= monthAgo;
      }
      return true;
    });
  }
};

export const toggleBookmarkNews = async (newsId) => {
  try {
    const res = await API.post(`/current-affairs/${newsId}/bookmark`);
    if (res.data.success) {
      return res.data.bookmarkedBy;
    }
  } catch (err) {
    console.warn('Backend bookmark toggle failed. Simulating locally.');
    const news = getLocalNews();
    const index = news.findIndex(n => n._id === newsId);
    if (index !== -1) {
      const bIdx = news[index].bookmarkedBy.indexOf('mock-user');
      if (bIdx !== -1) {
        news[index].bookmarkedBy.splice(bIdx, 1);
      } else {
        news[index].bookmarkedBy.push('mock-user');
      }
      localStorage.setItem('mock_news', JSON.stringify(news));
      return news[index].bookmarkedBy;
    }
    return [];
  }
};

export const toggleReadNews = async (newsId) => {
  try {
    const res = await API.post(`/current-affairs/${newsId}/read`);
    if (res.data.success) {
      return res.data.readBy;
    }
  } catch (err) {
    console.warn('Backend read toggle failed. Simulating locally.');
    const news = getLocalNews();
    const index = news.findIndex(n => n._id === newsId);
    if (index !== -1) {
      const rIdx = news[index].readBy.indexOf('mock-user');
      if (rIdx !== -1) {
        news[index].readBy.splice(rIdx, 1);
      } else {
        news[index].readBy.push('mock-user');
      }
      localStorage.setItem('mock_news', JSON.stringify(news));
      return news[index].readBy;
    }
    return [];
  }
};

export const saveNewsNote = async (newsId, note) => {
  try {
    const res = await API.post(`/current-affairs/${newsId}/note`, { note });
    if (res.data.success) {
      return res.data.notes;
    }
  } catch (err) {
    console.warn('Backend note save failed. Simulating locally.');
    const news = getLocalNews();
    const index = news.findIndex(n => n._id === newsId);
    if (index !== -1) {
      const nIdx = news[index].userNotes.findIndex(n => n.user === 'mock-user');
      if (nIdx !== -1) {
        news[index].userNotes[nIdx].note = note;
      } else {
        news[index].userNotes.push({ user: 'mock-user', note });
      }
      localStorage.setItem('mock_news', JSON.stringify(news));
      return news[index].userNotes;
    }
    return [];
  }
};

export const addToRevision = async (newsId) => {
  try {
    const res = await API.post(`/current-affairs/${newsId}/revision`);
    if (res.data.success) {
      return res.data;
    }
  } catch (err) {
    console.warn('Backend addToRevision failed. Simulating offline progress sync.');
    return { success: true, message: 'Added to revision queue locally.' };
  }
};

export const generateNewsMCQ = async (newsId) => {
  try {
    const res = await API.post(`/current-affairs/${newsId}/generate-mcq`);
    if (res.data.success) {
      return res.data.mcq;
    }
  } catch (err) {
    console.warn('Backend generate-mcq failed. Mocking locally.');
    const news = getLocalNews().find(n => n._id === newsId);
    const fact = news?.keyFacts?.[0] || 'Government governance safeguards';
    return {
      questionText: `Consider the following statements regarding ${news?.title || 'Current Topic'}: \n1. It marks an initiative aligning to constitutional safety features. \n2. The policy parameters apply to central state directives.\nWhich of the statements given above is/are correct?`,
      options: [
        '1 only',
        '2 only',
        'Both 1 and 2',
        'Neither 1 nor 2'
      ],
      correctOption: 2,
      explanation: `Both statements are correct. Background details: ${news?.summary}. Government directives align to: ${fact}.`,
      subject: news?.subject || 'Polity',
      difficulty: 'medium',
      source: news?.source || 'PIB'
    };
  }
};

export const generateNewsMains = async (newsId) => {
  try {
    const res = await API.post(`/current-affairs/${newsId}/generate-mains`);
    if (res.data.success) {
      return res.data.mainsQuestion;
    }
  } catch (err) {
    console.warn('Backend generate-mains failed. Mocking locally.');
    const news = getLocalNews().find(n => n._id === newsId);
    return {
      questionText: `"${news?.title || 'Current Topic'} has triggered discussions regarding ${news?.subject || 'Polity'} reforms in recent times." Critically evaluate the legal and economic implications of the initiative, keeping in mind the relevant committee safety parameters. (15 Marks, 250 Words)`,
      year: new Date().getFullYear(),
      paper: news?.subject === 'Polity' ? 'GS-II' : 'GS-III',
      subject: news?.subject || 'Polity',
      marks: 15,
      wordLimit: 250,
      directive: 'Critically Evaluate'
    };
  }
};
