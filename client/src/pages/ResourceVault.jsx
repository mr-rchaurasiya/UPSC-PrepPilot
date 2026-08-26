import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar.jsx';
import { 
  getDocumentsList, 
  uploadDocumentItem, 
  renameDocumentItem, 
  categorizeDocumentItem, 
  deleteDocumentItem, 
  askDocumentAssistantAI 
} from '../services/documentService.js';

export const ResourceVault = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Active document query
  const [activePdf, setActivePdf] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sendingAI, setSendingAI] = useState(false);

  // File uploads
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Category and search lists
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Inline edits
  const [editingId, setEditingId] = useState(null);
  const [renameText, setRenameText] = useState('');

  useEffect(() => {
    loadDocuments();
  }, [activeCategory, searchQuery]);

  const loadDocuments = async () => {
    setLoading(true);
    const data = await getDocumentsList(activeCategory, searchQuery);
    setResources(data || []);
    setLoading(false);
  };

  const handleFileUpload = async (e) => {
    setUploadError('');
    setUploadSuccess(false);
    const file = e.target.files[0];
    if (!file) return;

    // Check size < 5MB
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds the 5MB limit.');
      return;
    }

    // Check file type
    const allowedExtensions = ['.pdf', '.txt', '.png', '.jpg', '.jpeg', '.docx'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      setUploadError('Invalid file format. Only PDF, TXT, Word, and images are supported.');
      return;
    }

    setUploading(true);
    try {
      const sizeMb = file.size / (1024 * 1024);
      const typeLabel = ext === '.pdf' ? 'PDF' : ext === '.txt' ? 'TXT' : ext === '.docx' ? 'DOCX' : 'IMAGE';
      
      const added = await uploadDocumentItem(
        file.name,
        sizeMb,
        typeLabel,
        activeCategory !== 'All' ? activeCategory : 'General'
      );

      setResources(prev => [added, ...prev]);
      setUploadSuccess(true);
    } catch (err) {
      setUploadError('Failed to upload and index document.');
    } finally {
      setUploading(false);
    }
  };

  const handleStartRename = (res) => {
    setEditingId(res._id);
    setRenameText(res.fileName);
  };

  const handleSaveRename = async (docId) => {
    try {
      const updated = await renameDocumentItem(docId, renameText);
      setResources(prev => prev.map(d => d._id === docId ? updated : d));
      setEditingId(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCategorize = async (docId, newCategory) => {
    try {
      const updated = await categorizeDocumentItem(docId, newCategory);
      setResources(prev => prev.map(d => d._id === docId ? updated : d));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteDoc = async (docId) => {
    if (!window.confirm('Delete this study document permanently from vault?')) return;
    try {
      await deleteDocumentItem(docId);
      setResources(prev => prev.filter(d => d._id !== docId));
      if (activePdf?._id === docId) {
        setActivePdf(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAskAI = (res) => {
    setActivePdf(res);
    setChatMessages([
      { sender: 'ai', text: `Hello! I have indexed your document "${res.fileName}". Ask me anything about its contents or select a quick action trigger below!` }
    ]);
  };

  const handleSendMessage = async (e, customText = null) => {
    if (e) e.preventDefault();
    const queryText = customText || inputMessage;
    if (!queryText.trim() || !activePdf) return;

    setChatMessages(prev => [...prev, { sender: 'user', text: queryText }]);
    setInputMessage('');
    setSendingAI(true);

    try {
      const reply = await askDocumentAssistantAI(activePdf._id, queryText);
      setChatMessages(prev => [...prev, { sender: 'ai', text: reply }]);
    } catch (err) {
      console.error(err);
    } finally {
      setSendingAI(false);
    }
  };

  const categories = [
    'General',
    'Indian Polity & Governance',
    'Modern Indian History',
    'Economic Development',
    'Current Affairs'
  ];

  const quickPrompts = [
    'Summarize this document.',
    'Explain this chapter.',
    'Generate 20 MCQs.',
    'Generate flashcards.',
    'Give Mains questions.',
    'Find important facts.',
    'Explain this in Hindi.'
  ];

  if (loading) {
    return (
      <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Navbar />
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem', color: 'var(--accent-primary)' }}>
            <span className="visually-hidden">Loading Vault Portal...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="container-fluid px-4 py-4 flex-grow-1" style={{ maxWidth: '1200px' }}>
        
        <div className="mb-4">
          <h2 className="gradient-text fw-bold mb-0">Study Material Vault</h2>
          <p className="text-secondary small">Upload personal study briefs or PDFs, and query them using our AI document assistant</p>
        </div>

        <div className="row g-4">
          {/* Library and uploads */}
          <div className={activePdf ? "col-12 col-lg-7" : "col-12"}>
            <div className="row g-3 mb-4">
              {/* Uploader Box */}
              <div className="col-12 col-md-6">
                <div className="custom-card glass-panel p-4 h-100 d-flex flex-column justify-content-between">
                  <h5 className="mb-3 fw-semibold text-secondary">Upload Material</h5>
                  
                  <div className="mb-3">
                    <input
                      type="file"
                      className="form-control form-control-custom"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                      id="upload-file-trigger"
                      accept=".pdf,.txt,.docx,.png,.jpg,.jpeg"
                      disabled={uploading}
                    />
                    <label
                      htmlFor="upload-file-trigger"
                      className="w-100 py-4 rounded border border-dashed border-secondary text-center text-secondary small hover-bg d-flex flex-column align-items-center justify-content-center"
                      style={{ cursor: 'pointer', borderStyle: 'dashed', backgroundColor: 'var(--bg-tertiary)', minHeight: '120px' }}
                    >
                      {uploading ? (
                        <span>Indexing file...</span>
                      ) : (
                        <>
                          <span className="fs-3 mb-1">📁</span>
                          <span>Click to select PDF, TXT, Word or Images (max 5MB)</span>
                        </>
                      )}
                    </label>
                  </div>

                  {uploadError && <div className="alert alert-danger py-1.5 small text-center mb-0">{uploadError}</div>}
                  {uploadSuccess && <div className="alert alert-success py-1.5 small text-center mb-0">✓ Document uploaded and indexed successfully!</div>}
                </div>
              </div>

              {/* Filters Box */}
              <div className="col-12 col-md-6">
                <div className="custom-card glass-panel p-4 h-100 d-flex flex-column justify-content-between">
                  <h5 className="mb-3 fw-semibold text-secondary">Vault Filters</h5>
                  
                  <div className="mb-3">
                    <label className="form-label small text-secondary">Search Filename</label>
                    <input
                      type="text"
                      className="form-control-custom"
                      placeholder="Type keywords..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="form-label small text-secondary">Category Select</label>
                    <select
                      className="form-control-custom form-select"
                      value={activeCategory}
                      onChange={(e) => setActiveCategory(e.target.value)}
                    >
                      <option value="All">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Library list */}
            <div className="custom-card glass-panel p-4">
              <h5 className="mb-4 fw-semibold text-secondary">Material Library</h5>
              
              {resources.length === 0 ? (
                <div className="text-center py-5 text-muted small">
                  Vault is empty. Upload your first PDF, TXT or Docx study briefs to initiate indexing.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-dark table-hover mb-0" style={{ backgroundColor: 'transparent' }}>
                    <thead>
                      <tr className="small text-muted" style={{ borderBottomColor: 'var(--border-color)' }}>
                        <th>File Details</th>
                        <th>Size</th>
                        <th>Category</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resources.map(res => {
                        const isEditing = editingId === res._id;
                        return (
                          <tr key={res._id} className="small animate-fade-in" style={{ verticalAlign: 'middle', borderBottomColor: 'var(--border-color)' }}>
                            <td>
                              {isEditing ? (
                                <div className="d-flex gap-2">
                                  <input
                                    type="text"
                                    className="form-control-custom py-0.5 px-2 small"
                                    value={renameText}
                                    onChange={(e) => setRenameText(e.target.value)}
                                  />
                                  <button className="btn btn-sm btn-primary-custom py-0.5 px-2" onClick={() => handleSaveRename(res._id)}>
                                    Save
                                  </button>
                                </div>
                              ) : (
                                <div>
                                  <span className="fw-semibold text-secondary d-block" style={{ color: 'var(--text-primary)' }}>{res.fileName}</span>
                                  <span className="small text-muted" style={{ fontSize: '0.65rem' }}>Type: {res.fileType}</span>
                                </div>
                              )}
                            </td>
                            <td className="text-muted">{res.fileSize}</td>
                            <td>
                              <select
                                className="form-control-custom py-0.5 px-2 small form-select bg-dark-subtle"
                                style={{ fontSize: '0.7rem', width: '130px' }}
                                value={res.category}
                                onChange={(e) => handleCategorize(res._id, e.target.value)}
                              >
                                {categories.map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                            </td>
                            <td className="text-end">
                              <div className="d-flex gap-2 justify-content-end">
                                <button className="btn btn-sm btn-primary-custom py-1 px-2.5" onClick={() => handleAskAI(res)}>
                                  Ask AI
                                </button>
                                <button className="btn btn-sm btn-secondary-custom py-1 px-1.5" onClick={() => handleStartRename(res)}>
                                  ✏️
                                </button>
                                <button className="btn btn-sm btn-secondary-custom text-danger py-1 px-1.5 border-0" onClick={() => handleDeleteDoc(res._id)}>
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* RAG Document Assistant panel sidebar */}
          {activePdf && (
            <div className="col-12 col-lg-5">
              <div className="custom-card glass-panel p-4 d-flex flex-column justify-content-between" style={{ height: '620px', borderColor: 'var(--accent-primary)' }}>
                
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom" style={{ borderBottomColor: 'var(--border-color)' }}>
                  <div>
                    <h6 className="fw-bold mb-0 text-primary" style={{ color: 'var(--text-primary)' }}>Document Assistant</h6>
                    <span className="small text-muted text-truncate d-block" style={{ maxWidth: '240px' }}>{activePdf.fileName}</span>
                  </div>
                  <button className="btn-secondary-custom py-1 px-2.5 btn-sm border-0" onClick={() => setActivePdf(null)}>
                    ✕ Close
                  </button>
                </div>

                {/* Messages scroll list */}
                <div className="flex-grow-1 d-flex flex-column gap-3 mb-3" style={{ overflowY: 'auto', paddingRight: '4px' }}>
                  {chatMessages.map((msg, mIdx) => (
                    <div
                      key={mIdx}
                      className={`p-3 rounded-lg text-start small ${msg.sender === 'ai' ? 'align-self-start' : 'align-self-end text-light'}`}
                      style={{
                        maxWidth: '85%',
                        backgroundColor: msg.sender === 'ai' ? 'var(--bg-tertiary)' : 'var(--accent-primary)',
                        color: msg.sender === 'ai' ? 'var(--text-primary)' : '#ffffff',
                        border: msg.sender === 'ai' ? '1px solid var(--border-color)' : 'none',
                        borderRadius: msg.sender === 'ai' ? '16px 16px 16px 2px' : '16px 16px 2px 16px',
                        lineHeight: '1.5'
                      }}
                    >
                      <span className="d-block mb-1 text-muted" style={{ fontSize: '0.65rem', color: msg.sender === 'ai' ? 'var(--text-muted)' : 'rgba(255,255,255,0.7)' }}>
                        {msg.sender === 'ai' ? 'AI Doc Assistant' : 'You'}
                      </span>
                      {msg.text}
                    </div>
                  ))}
                </div>

                {/* Quick Prompts Panel */}
                <div className="mb-3">
                  <span className="small text-muted d-block mb-2">Quick Action Grounding Prompts:</span>
                  <div className="d-flex flex-wrap gap-1.5" style={{ maxHeight: '80px', overflowY: 'auto' }}>
                    {quickPrompts.map((p, pIdx) => (
                      <button
                        key={pIdx}
                        className="btn btn-sm btn-secondary-custom py-1 px-2 text-secondary bg-transparent border small hover-card"
                        style={{ fontSize: '0.65rem', borderColor: 'var(--border-color)' }}
                        onClick={() => handleSendMessage(null, p)}
                        disabled={sendingAI}
                      >
                        💡 {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message input */}
                <form onSubmit={handleSendMessage} className="d-flex gap-2">
                  <input
                    type="text"
                    className="form-control-custom py-2 px-3 small flex-grow-1"
                    placeholder="Ask about this document..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    disabled={sendingAI}
                  />
                  <button type="submit" className="btn-primary-custom py-2 px-4 small" disabled={sendingAI}>
                    {sendingAI ? '...' : 'Send'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ResourceVault;
