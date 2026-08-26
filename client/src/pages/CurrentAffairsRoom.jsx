import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar.jsx';
import { 
  getCurrentAffairsList, 
  toggleBookmarkNews, 
  toggleReadNews, 
  saveNewsNote, 
  addToRevision, 
  generateNewsMCQ, 
  generateNewsMains 
} from '../services/currentAffairsService.js';

export const CurrentAffairsRoom = () => {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [activeView, setActiveView] = useState('all'); // 'all', 'today', 'week', 'month', 'prelims', 'mains'
  const [activeSubject, setActiveSubject] = useState('All');

  // Expanded news card for details
  const [expandedId, setExpandedId] = useState(null);

  // Notes state
  const [editingId, setEditingId] = useState(null);
  const [noteText, setNoteText] = useState('');

  // Generated question modal state
  const [mcqModal, setMcqModal] = useState(null); // { questionText, options, correctOption, explanation }
  const [mainsModal, setMainsModal] = useState(null); // { questionText, marks, wordLimit }

  useEffect(() => {
    loadNews();
  }, [activeView, activeSubject]);

  const loadNews = async () => {
    setLoading(true);
    const data = await getCurrentAffairsList(activeView, activeSubject);
    setNewsList(data || []);
    setLoading(false);
  };

  const handleBookmark = async (e, newsId) => {
    e.stopPropagation();
    const updatedBookmarkedBy = await toggleBookmarkNews(newsId);
    setNewsList(prev => prev.map(n => n._id === newsId ? { ...n, bookmarkedBy: updatedBookmarkedBy } : n));
  };

  const handleRead = async (e, newsId) => {
    e.stopPropagation();
    const updatedReadBy = await toggleReadNews(newsId);
    setNewsList(prev => prev.map(n => n._id === newsId ? { ...n, readBy: updatedReadBy } : n));
  };

  const handleStartNote = (e, item) => {
    e.stopPropagation();
    setEditingId(item._id);
    const existing = item.userNotes?.find(n => n.user === 'mock-user')?.note || '';
    setNoteText(existing);
  };

  const handleSaveNote = async (newsId) => {
    const updatedNotes = await saveNewsNote(newsId, noteText);
    setNewsList(prev => prev.map(n => n._id === newsId ? { ...n, userNotes: updatedNotes } : n));
    setEditingId(null);
  };

  const handleAddToRevision = async (e, newsId) => {
    e.stopPropagation();
    const res = await addToRevision(newsId);
    if (res?.success) {
      alert(res.message || 'Added to Revision schedule.');
    }
  };

  const handleGenerateMCQ = async (e, newsId) => {
    e.stopPropagation();
    const mcq = await generateNewsMCQ(newsId);
    setMcqModal(mcq);
  };

  const handleGenerateMains = async (e, newsId) => {
    e.stopPropagation();
    const mains = await generateNewsMains(newsId);
    setMainsModal(mains);
  };

  const alphabet = ['A', 'B', 'C', 'D'];

  if (loading) {
    return (
      <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Navbar />
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem', color: 'var(--accent-primary)' }}>
            <span className="visually-hidden">Loading Current Affairs...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="container px-4 py-4 flex-grow-1" style={{ maxWidth: '1000px' }}>
        
        {/* HEADER */}
        <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3 pb-3 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
          <div>
            <h2 className="gradient-text fw-bold mb-0">Exam-Oriented Current Affairs</h2>
            <p className="text-secondary small">Daily news logs mapped directly to constitutional, economic, and IR syllabus topics</p>
          </div>
        </div>

        {/* View Filter Toggles */}
        <div className="custom-card glass-panel p-3.5 mb-4 d-flex flex-wrap gap-2.5 justify-content-between align-items-center">
          <div className="d-flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'All Logs' },
              { id: 'today', label: 'Today' },
              { id: 'week', label: 'This Week' },
              { id: 'month', label: 'This Month' },
              { id: 'prelims', label: 'Prelims Focus' },
              { id: 'mains', label: 'Mains Focus' }
            ].map(view => (
              <button
                key={view.id}
                className={`btn btn-sm ${activeView === view.id ? 'btn-primary-custom' : 'btn-secondary-custom'} py-1 px-3`}
                style={{ fontSize: '0.75rem' }}
                onClick={() => setActiveView(view.id)}
              >
                {view.label}
              </button>
            ))}
          </div>

          <div className="d-flex align-items-center gap-2">
            <span className="small text-secondary text-nowrap">Subject:</span>
            <select
              className="form-control-custom py-1 px-2.5 small form-select bg-dark-subtle"
              style={{ fontSize: '0.75rem', width: '180px' }}
              value={activeSubject}
              onChange={(e) => setActiveSubject(e.target.value)}
            >
              <option value="All">All Subjects</option>
              <option value="Indian Polity & Governance">Polity & Governance</option>
              <option value="Economic Development">Economic Development</option>
            </select>
          </div>
        </div>

        {/* LIST NEWS CARDS */}
        {newsList.length === 0 ? (
          <div className="custom-card glass-panel p-5 text-center text-muted small">
            <h5>No news items found.</h5>
            <p className="text-secondary small mt-2">Adjust filters or check back later for new summaries.</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3.5">
            {newsList.map(item => {
              const isExpanded = expandedId === item._id;
              const isBookmarked = item.bookmarkedBy?.includes('mock-user');
              const isRead = item.readBy?.includes('mock-user');
              const note = item.userNotes?.find(n => n.user === 'mock-user')?.note || '';

              return (
                <div 
                  key={item._id} 
                  className="custom-card glass-panel p-4 cursor-pointer hover-card animate-fade-in" 
                  onClick={() => setExpandedId(isExpanded ? null : item._id)}
                >
                  <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-3">
                    <div>
                      <div className="d-flex gap-1.5 flex-wrap align-items-center mb-2" style={{ fontSize: '0.7rem' }}>
                        <span className="badge bg-secondary-subtle text-secondary border px-2 py-0.5">{item.subject}</span>
                        <span className="badge bg-dark-subtle border text-secondary px-2 py-0.5">Source: {item.source}</span>
                        <span className="badge bg-dark-subtle border text-secondary px-2 py-0.5">{new Date(item.date).toLocaleDateString()}</span>
                        {isRead && <span className="badge bg-success-subtle text-success border px-2 py-0.5">✓ Read</span>}
                      </div>
                      <h5 className="fw-semibold text-secondary mb-0" style={{ color: 'var(--text-primary)' }}>{item.title}</h5>
                    </div>

                    <div className="d-flex gap-2">
                      <button className="btn btn-sm btn-secondary-custom p-1 px-2 small" onClick={(e) => handleBookmark(e, item._id)}>
                        {isBookmarked ? '★ Bookmarked' : '☆ Bookmark'}
                      </button>
                      <button className="btn btn-sm btn-secondary-custom p-1 px-2 small" onClick={(e) => handleRead(e, item._id)}>
                        {isRead ? 'Mark Unread' : 'Mark Read'}
                      </button>
                    </div>
                  </div>

                  <p className="small text-secondary mb-3 leading-relaxed">{item.summary}</p>

                  {/* Syllabus mapping list */}
                  <div className="d-flex gap-1.5 flex-wrap mb-3.5">
                    {item.syllabusMapping?.map((sm, smIdx) => (
                      <span key={smIdx} className="badge bg-indigo-subtle text-indigo border small px-2 py-0.5" style={{ fontSize: '0.65rem' }}>
                        📌 {sm}
                      </span>
                    ))}
                  </div>

                  {/* EXPANDED UPSC ANALYSIS DETAILS */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-top border-secondary-subtle" style={{ borderColor: 'var(--border-color)' }}>
                      <div className="row g-4 mb-4">
                        <div className="col-12 col-md-6">
                          <h6 className="fw-bold text-secondary small mb-1">Background Context:</h6>
                          <p className="small text-secondary leading-relaxed mb-3">{item.background}</p>

                          <h6 className="fw-bold text-secondary small mb-1">Why Important for CSE:</h6>
                          <p className="small text-secondary leading-relaxed mb-0">{item.whyImportant}</p>
                        </div>

                        <div className="col-12 col-md-6">
                          <h6 className="fw-bold text-secondary small mb-1">Constitutional / Legal Angle:</h6>
                          <p className="small text-secondary leading-relaxed mb-3">{item.constitutionalLegalAngle}</p>

                          <h6 className="fw-bold text-secondary small mb-1">Economic/Environmental Angle:</h6>
                          <p className="small text-secondary leading-relaxed mb-0">{item.economicAngle || item.environmentalAngle}</p>
                        </div>
                      </div>

                      {/* Fact sheet points */}
                      <div className="p-3 rounded mb-4" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                        <h6 className="fw-semibold text-secondary small mb-2">Key Fact Sheet & Initiatives:</h6>
                        <ul className="ps-3 mb-0 small text-secondary d-flex flex-column gap-1.5">
                          {item.keyFacts?.map((fact, fIdx) => (
                            <li key={fIdx}>{fact}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Notes Box Inline */}
                      <div className="mb-4" onClick={(e) => e.stopPropagation()}>
                        <label className="form-label small text-secondary d-flex justify-content-between">
                          <span>Personal Notes & Memory Triggers</span>
                          {editingId !== item._id && (
                            <button className="btn btn-sm text-primary p-0 bg-transparent border-0 small" onClick={(e) => handleStartNote(e, item)}>
                              ✏️ Edit Notes
                            </button>
                          )}
                        </label>
                        {editingId === item._id ? (
                          <div className="d-flex flex-column gap-2 mt-1">
                            <textarea
                              className="form-control-custom"
                              rows="2"
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                            />
                            <div className="d-flex gap-2">
                              <button className="btn btn-sm btn-primary-custom py-1 px-3" onClick={() => handleSaveNote(item._id)}>
                                Save
                              </button>
                              <button className="btn btn-sm btn-secondary-custom py-1 px-3" onClick={() => setEditingId(null)}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="small text-muted p-2 border rounded" style={{ backgroundColor: 'var(--bg-primary)', borderStyle: 'dashed' }}>
                            {note || 'Add notes linking this news item to specific GS papers.'}
                          </p>
                        )}
                      </div>

                      {/* Quick AI generation action triggers */}
                      <div className="d-flex gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                        <button className="btn btn-sm btn-primary-custom py-1.5 px-3" onClick={(e) => handleAddToRevision(e, item._id)}>
                          🔁 Add to Revision Queue
                        </button>
                        <button className="btn btn-sm btn-secondary-custom py-1.5 px-3" onClick={(e) => handleGenerateMCQ(e, item._id)}>
                          🎯 Generate related MCQ
                        </button>
                        <button className="btn btn-sm btn-secondary-custom py-1.5 px-3" onClick={(e) => handleGenerateMains(e, item._id)}>
                          ✍️ Generate related Mains Question
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* RELATED MCQ DISPLAY MODAL */}
        {mcqModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={() => setMcqModal(null)}>
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content border-0 glass-panel p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="modal-header border-0 pb-0 justify-content-between">
                  <h5 className="modal-title fw-semibold text-secondary">AI Generated Prelims MCQ</h5>
                  <button type="button" className="btn-close text-white" onClick={() => setMcqModal(null)}></button>
                </div>
                <div className="modal-body py-4">
                  <p className="small text-secondary fw-semibold mb-3 leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                    {mcqModal.questionText}
                  </p>
                  <div className="d-flex flex-column gap-2 mb-4">
                    {mcqModal.options.map((opt, oIdx) => (
                      <div key={oIdx} className="p-2.5 rounded border small bg-dark-subtle" style={{ borderColor: 'var(--border-color)' }}>
                        <strong>{alphabet[oIdx]}.</strong> {opt}
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded text-start" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                    <h6 className="fw-semibold text-success small mb-1">Correct Answer Option: {alphabet[mcqModal.correctOption]}</h6>
                    <p className="small text-secondary mb-0" style={{ fontSize: '0.75rem', lineHeight: '1.5' }}>{mcqModal.explanation}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RELATED MAINS DISPLAY MODAL */}
        {mainsModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={() => setMainsModal(null)}>
            <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content border-0 glass-panel p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="modal-header border-0 pb-0 justify-content-between">
                  <h5 className="modal-title fw-semibold text-secondary">AI Generated Mains Question</h5>
                  <button type="button" className="btn-close text-white" onClick={() => setMainsModal(null)}></button>
                </div>
                <div className="modal-body py-4">
                  <div className="p-3 rounded border mb-4 bg-dark-subtle" style={{ borderColor: 'var(--border-color)' }}>
                    <h6 className="small text-muted mb-2">Subjective Target directive: <strong className="text-indigo">{mainsModal.directive}</strong> | Marks: {mainsModal.marks} ({mainsModal.wordLimit} Words)</h6>
                    <h5 className="fw-semibold text-secondary leading-relaxed mb-0" style={{ color: 'var(--text-primary)' }}>
                      "{mainsModal.questionText}"
                    </h5>
                  </div>

                  <div className="p-3 rounded text-start" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                    <h6 className="fw-semibold text-secondary small mb-1.5">Model Answer Framework Suggested Outline:</h6>
                    <ol className="ps-3 mb-0 small text-secondary d-flex flex-column gap-1.5" style={{ fontSize: '0.75rem' }}>
                      <li><strong>Introduction:</strong> Define the core initiative details and map it to constitutional Articles or legal angles.</li>
                      <li><strong>Body Arguments:</strong> Analyze the positive outputs (economic/legal) vs potential centralization risks.</li>
                      <li><strong>Way Forward / Conclusion:</strong> Conclude by referencing committee recommendations or progressive federal safety guards.</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CurrentAffairsRoom;
