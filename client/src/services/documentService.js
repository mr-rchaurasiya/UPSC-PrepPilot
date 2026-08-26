import API from './api';

const defaultDocs = [
  { _id: 'r1', fileName: 'Polity_Laxmikanth_Notes.pdf', fileSize: '1.2 MB', fileType: 'PDF', category: 'Indian Polity & Governance', createdAt: '2026-08-20T10:00:00Z' },
  { _id: 'r2', fileName: 'Modern_History_Timeline.pdf', fileSize: '0.8 MB', fileType: 'PDF', category: 'Modern Indian History', createdAt: '2026-08-22T10:00:00Z' },
  { _id: 'r3', fileName: 'August_Current_Affairs_Brief.pdf', fileSize: '2.1 MB', fileType: 'PDF', category: 'Current Affairs', createdAt: '2026-08-25T10:00:00Z' }
];

const getLocalDocs = () => {
  const docsStr = localStorage.getItem('mock_vault_docs');
  if (!docsStr) {
    localStorage.setItem('mock_vault_docs', JSON.stringify(defaultDocs));
    return defaultDocs;
  }
  return JSON.parse(docsStr);
};

export const getDocumentsList = async (category, search) => {
  try {
    const catQuery = category ? `&category=${category}` : '';
    const searchQuery = search ? `&search=${search}` : '';
    const res = await API.get(`/documents?${catQuery}${searchQuery}`);
    if (res.data.success) {
      return res.data.docs;
    }
  } catch (err) {
    console.warn('Backend documents list fetch failed. Serving local mock vault.');
    let list = getLocalDocs();
    if (category && category !== 'All') {
      list = list.filter(d => d.category === category);
    }
    if (search) {
      list = list.filter(d => d.fileName.toLowerCase().includes(search.toLowerCase()));
    }
    return list;
  }
};

export const uploadDocumentItem = async (fileName, fileSize, fileType, category) => {
  try {
    const res = await API.post('/documents', { fileName, fileSize, fileType, category });
    if (res.data.success) {
      return res.data.doc;
    }
  } catch (err) {
    console.warn('Backend upload failed. Simulating locally.');
    const list = getLocalDocs();
    const newDoc = {
      _id: `mock-doc-${Date.now()}`,
      fileName,
      fileSize: `${parseFloat(fileSize).toFixed(1)} MB`,
      fileType,
      category: category || 'General',
      createdAt: new Date().toISOString()
    };
    list.unshift(newDoc);
    localStorage.setItem('mock_vault_docs', JSON.stringify(list));
    return newDoc;
  }
};

export const renameDocumentItem = async (docId, fileName) => {
  try {
    const res = await API.put(`/documents/${docId}/rename`, { fileName });
    if (res.data.success) {
      return res.data.doc;
    }
  } catch (err) {
    console.warn('Backend rename failed. Simulating locally.');
    const list = getLocalDocs();
    const idx = list.findIndex(d => d._id === docId);
    if (idx !== -1) {
      list[idx].fileName = fileName;
      localStorage.setItem('mock_vault_docs', JSON.stringify(list));
      return list[idx];
    }
    throw new Error('Document not found');
  }
};

export const categorizeDocumentItem = async (docId, category) => {
  try {
    const res = await API.put(`/documents/${docId}/categorize`, { category });
    if (res.data.success) {
      return res.data.doc;
    }
  } catch (err) {
    console.warn('Backend categorization failed. Simulating locally.');
    const list = getLocalDocs();
    const idx = list.findIndex(d => d._id === docId);
    if (idx !== -1) {
      list[idx].category = category;
      localStorage.setItem('mock_vault_docs', JSON.stringify(list));
      return list[idx];
    }
    throw new Error('Document not found');
  }
};

export const deleteDocumentItem = async (docId) => {
  try {
    const res = await API.delete(`/documents/${docId}`);
    if (res.data.success) {
      return res.data;
    }
  } catch (err) {
    console.warn('Backend deletion failed. Simulating locally.');
    const list = getLocalDocs();
    const filtered = list.filter(d => d._id !== docId);
    localStorage.setItem('mock_vault_docs', JSON.stringify(filtered));
    return { success: true };
  }
};

export const askDocumentAssistantAI = async (docId, prompt) => {
  try {
    const res = await API.post(`/documents/${docId}/assistant`, { prompt });
    if (res.data.success) {
      return res.data.reply;
    }
  } catch (err) {
    console.warn('Backend document assistant failed. Running offline mock analysis.');
    const doc = getLocalDocs().find(d => d._id === docId);
    const lower = prompt.toLowerCase();
    
    if (lower.includes('summarize')) {
      return `Document Summary: This resource outlines core themes concerning ${doc?.category || 'general studies'}. It structures major context directives and key commission findings.`;
    } else if (lower.includes('explain this chapter') || lower.includes('explain chapter')) {
      return `Chapter Analysis: The selected section defines foundational constitutional articles, details historical challenges, and suggestions relative to the Sarkaria commission guidelines.`;
    } else if (lower.includes('mcq') || lower.includes('question')) {
      return `Here are 2 Practice Questions grounded in ${doc?.fileName || 'document'}:\n1. Consider governor appointment safeguards in cooperative federalism. Which commission outlined these?\n2. What is the impact of financial devolution indices?`;
    } else if (lower.includes('mains')) {
      return `Grounded Mains Question: 'Critically analyze the administrative frictions in Centre-State relations as highlighted in "${doc?.fileName || 'document'}". Suggest safeguards.'`;
    } else if (lower.includes('fact')) {
      return `Key Facts Found: \n- article safeguards limits\n- sarkaria commission appointment recommendation parameters.`;
    } else if (lower.includes('hindi') || lower.includes('samjhao')) {
      return `विवरण (Hindi Explanation): यह दस्तावेज़ ${doc?.category || 'विषय'} से संबंधित मुख्य संवैधानिक मुद्दों और आयोग के सुझावों का संक्षेप में विश्लेषण करता है।`;
    } else {
      return `Based on the content index of "${doc?.fileName || 'document'}", it discusses Articles and rules relative to ${doc?.category || 'General'}. Feel free to ask details about summaries, fact sheets, or MCQs.`;
    }
  }
};
