import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar.jsx';
import { getMistakesList, updateMistakeItem, deleteMistakeItem } from '../services/practiceService.js';

export const MistakeBook = () => {
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);
  
  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [subjectFilter, setSubjectFilter] = useState('All');

  // Practice mistakes mode
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [practiceCorrect, setPracticeCorrect] = useState(0);

  // Edit notes state
  const [editingId, setEditingId] = useState(null);
  const [notesText, setNotesText] = useState('');
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    loadMistakes();
  }, []);

  const loadMistakes = async () => {
    setLoading(true);
    const list = await getMistakesList();
    setMistakes(list || []);
    setLoading(false);
  };

  const handleResolve = async (mistakeId) => {
    setResolvingId(mistakeId);
    try {
      await updateMistakeItem(mistakeId, { status: 'resolved' });
      setMistakes(prev => prev.filter(m => m._id !== mistakeId));
    } catch (err) {
      console.error(err);
    } finally {
      setResolvingId(null);
    }
  };

  const handleRemove = async (mistakeId) => {
    if (!window.confirm('Remove this mistake from your book permanently?')) return;
    try {
      await deleteMistakeItem(mistakeId);
      setMistakes(prev => prev.filter(m => m._id !== mistakeId));
    } catch (err) {
      console.error(err);
    }
  };

  const startEditNotes = (mistake) => {
    setEditingId(mistake._id);
    setNotesText(mistake.personalNote || '');
  };

  const handleSaveNotes = async (mistakeId) => {
    setSavingId(mistakeId);
    try {
      await updateMistakeItem(mistakeId, { personalNote: notesText });
      setMistakes(prev => prev.map(m => m._id === mistakeId ? { ...m, personalNote: notesText } : m));
      setEditingId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingId(null);
    }
  };

  const handleCategoryChange = async (mistakeId, newCategory) => {
    try {
      await updateMistakeItem(mistakeId, { category: newCategory });
      setMistakes(prev => prev.map(m => m._id === mistakeId ? { ...m, category: newCategory } : m));
    } catch (err) {
      console.error(err);
    }
  };

  const categories = [
    'Conceptual mistake',
    'Factual mistake',
    'Misreading',
    'Elimination mistake',
    'Guessing mistake',
    'Time pressure',
    'Careless mistake'
  ];

  // Filters & search application
  const filteredMistakes = mistakes.filter(m => {
    if (!m.question) return false;
    const matchesSearch = m.question.questionText.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (m.personalNote && m.personalNote.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'All' ? true : m.category === categoryFilter;
    const matchesSubject = subjectFilter === 'All' ? true : m.question.subject === subjectFilter;
    
    return matchesSearch && matchesCategory && matchesSubject;
  });

  const alphabet = ['A', 'B', 'C', 'D'];

  // Practice Mode grading handler
  const handlePracticeSubmit = () => {
    if (selectedOption === null) return;
    setIsSubmitted(true);
    const correctOption = filteredMistakes[practiceIndex].question.correctOption;
    if (selectedOption === correctOption) {
      setPracticeCorrect(prev => prev + 1);
    }
  };

  const handlePracticeNext = () => {
    if (practiceIndex < filteredMistakes.length - 1) {
      setPracticeIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      setIsPracticeMode(false);
      alert(`Completed! Score: ${practiceCorrect} / ${filteredMistakes.length} correct responses.`);
    }
  };

  // Analytics Math
  const activeCount = mistakes.filter(m => m.status === 'unresolved').length;
  const resolvedCount = mistakes.filter(m => m.status === 'resolved').length;
  const totalCount = mistakes.length;
  const improvementRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;

  const categoryCounts = {};
  mistakes.forEach(m => {
    const cat = m.category || 'Conceptual mistake';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  let topCategory = 'None';
  let topCatCount = 0;
  Object.keys(categoryCounts).forEach(cat => {
    if (categoryCounts[cat] > topCatCount) {
      topCatCount = categoryCounts[cat];
      topCategory = cat;
    }
  });

  const subjectCounts = {};
  mistakes.forEach(m => {
    if (m.question) {
      const sub = m.question.subject;
      subjectCounts[sub] = (subjectCounts[sub] || 0) + (m.repeatedCount || 1);
    }
  });
  let weakestSubject = 'None';
  let topSubCount = 0;
  Object.keys(subjectCounts).forEach(sub => {
    if (subjectCounts[sub] > topSubCount) {
      topSubCount = subjectCounts[sub];
      weakestSubject = sub;
    }
  });

  if (loading) {
    return (
      <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Navbar />
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem', color: 'var(--accent-primary)' }}>
            <span className="visually-hidden">Loading Mistake Console...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="container px-4 py-4 flex-grow-1" style={{ maxWidth: '900px' }}>
        
        {/* HEADER BLOCK */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3 pb-3 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
          <div>
            <h2 className="gradient-text fw-bold mb-0">My Mistake Book</h2>
            <p className="text-secondary small">Classify, log personal notes, and resolve conceptual or careless errors</p>
          </div>
          
          {filteredMistakes.length > 0 && !isPracticeMode && (
            <button className="btn-primary-custom py-2 px-4" onClick={() => { setIsPracticeMode(true); setPracticeIndex(0); setSelectedOption(null); setIsSubmitted(false); setPracticeCorrect(0); }}>
              🎯 Practice My Mistakes
            </button>
          )}
        </div>

        {/* Analytics Summary Panels */}
        {!isPracticeMode && (
          <div className="row g-3 mb-4 animate-fade-in">
            <div className="col-6 col-md-3">
              <div className="custom-card glass-panel p-3 text-center h-100 d-flex flex-column justify-content-between">
                <span className="text-muted small fw-semibold text-uppercase d-block" style={{ fontSize: '0.65rem' }}>Active / Resolved</span>
                <h3 className="fw-bold mt-2 mb-0" style={{ color: 'var(--accent-primary)' }}>
                  {activeCount} <span className="fs-5 text-muted">/ {resolvedCount}</span>
                </h3>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="custom-card glass-panel p-3 text-center h-100 d-flex flex-column justify-content-between">
                <span className="text-muted small fw-semibold text-uppercase d-block" style={{ fontSize: '0.65rem' }}>Improvement Rate</span>
                <h3 className="fw-bold mt-2 mb-0" style={{ color: 'var(--accent-success)' }}>{improvementRate}%</h3>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="custom-card glass-panel p-3 text-center h-100 d-flex flex-column justify-content-between">
                <span className="text-muted small fw-semibold text-uppercase d-block" style={{ fontSize: '0.65rem' }}>Weakest Domain</span>
                <h4 className="fw-bold mt-2 mb-0 text-truncate" style={{ fontSize: '0.9rem', color: 'var(--accent-danger)' }}>{weakestSubject}</h4>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="custom-card glass-panel p-3 text-center h-100 d-flex flex-column justify-content-between">
                <span className="text-muted small fw-semibold text-uppercase d-block" style={{ fontSize: '0.65rem' }}>Primary Error Type</span>
                <h4 className="fw-bold mt-2 mb-0 text-truncate" style={{ fontSize: '0.9rem', color: 'var(--accent-warning)' }}>{topCategory}</h4>
              </div>
            </div>
          </div>
        )}

        {/* PRACTICE MISTAKES SUB-MODE */}
        {isPracticeMode && filteredMistakes.length > 0 ? (
          <div className="custom-card glass-panel p-4 p-md-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <span className="badge bg-secondary-subtle text-secondary border small px-2.5 py-1">
                Question {practiceIndex + 1} of {filteredMistakes.length}
              </span>
              <button className="btn btn-sm btn-secondary-custom py-1 px-2.5" onClick={() => setIsPracticeMode(false)}>
                ✕ Exit Practice
              </button>
            </div>

            <h5 className="mb-4 text-primary fw-semibold" style={{ color: 'var(--text-primary)', lineHeight: '1.6' }}>
              {filteredMistakes[practiceIndex].question.questionText}
            </h5>

            <div className="d-flex flex-column gap-3 mb-4">
              {filteredMistakes[practiceIndex].question.options.map((opt, oIdx) => {
                let borderStyle = '1px solid var(--border-color)';
                let bgStyle = 'var(--bg-tertiary)';

                if (selectedOption === oIdx) {
                  borderStyle = '1px solid var(--accent-primary)';
                  bgStyle = 'rgba(99, 102, 241, 0.1)';
                }

                if (isSubmitted) {
                  if (oIdx === filteredMistakes[practiceIndex].question.correctOption) {
                    borderStyle = '1px solid var(--accent-success)';
                    bgStyle = 'rgba(16, 185, 129, 0.1)';
                  } else if (selectedOption === oIdx) {
                    borderStyle = '1px solid var(--accent-danger)';
                    bgStyle = 'rgba(239, 68, 68, 0.1)';
                  }
                }

                return (
                  <button
                    key={oIdx}
                    className="w-100 text-start p-3 rounded d-flex align-items-center gap-3 border"
                    style={{ border: borderStyle, backgroundColor: bgStyle, color: 'var(--text-primary)', cursor: isSubmitted ? 'default' : 'pointer' }}
                    onClick={() => !isSubmitted && setSelectedOption(oIdx)}
                  >
                    <span className="fw-bold text-muted small bg-dark-subtle border d-flex align-items-center justify-content-center rounded-circle" style={{ width: '28px', height: '28px' }}>
                      {alphabet[oIdx]}
                    </span>
                    <span className="small text-secondary" style={{ color: 'var(--text-primary)' }}>{opt}</span>
                  </button>
                );
              })}
            </div>

            <div className="d-flex gap-3 align-items-center">
              {!isSubmitted ? (
                <button className="btn-primary-custom py-2 px-5" onClick={handlePracticeSubmit} disabled={selectedOption === null}>
                  Submit Answer
                </button>
              ) : (
                <button className="btn-primary-custom py-2 px-5" onClick={handlePracticeNext}>
                  {practiceIndex < filteredMistakes.length - 1 ? 'Next Question' : 'Complete Module'}
                </button>
              )}
            </div>

            {isSubmitted && (
              <div className="mt-4 pt-4 border-top" style={{ borderColor: 'var(--border-color)' }}>
                <h6 className="fw-semibold text-secondary mb-2">Explanation:</h6>
                <p className="small text-secondary mb-0" style={{ lineHeight: '1.6' }}>{filteredMistakes[practiceIndex].question.explanation}</p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Filter and search panels */}
            <div className="custom-card glass-panel p-4 mb-4">
              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <label className="form-label small text-secondary">Search Keywords</label>
                  <input
                    type="text"
                    className="form-control-custom"
                    placeholder="Search question contents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="col-6 col-md-4">
                  <label className="form-label small text-secondary">Filter Category</label>
                  <select
                    className="form-control-custom form-select"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="All">All Categories</option>
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="col-6 col-md-4">
                  <label className="form-label small text-secondary">Filter Subject</label>
                  <select
                    className="form-control-custom form-select"
                    value={subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value)}
                  >
                    <option value="All">All Subjects</option>
                    <option value="Indian Polity & Governance">Polity & Governance</option>
                    <option value="CSAT Aptitude">CSAT Aptitude</option>
                  </select>
                </div>
              </div>
            </div>

            {/* List mistakes grid */}
            {filteredMistakes.length === 0 ? (
              <div className="custom-card glass-panel p-5 text-center text-muted small">
                <h5>No Active Mistakes Found!</h5>
                <p className="text-secondary small mt-2">Adjust search tags or continue practicing mock MCQ tests to populate mistakes.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-4">
                {filteredMistakes.map(mistake => {
                  const q = mistake.question;
                  if (!q) return null;

                  return (
                    <div key={mistake._id} className="custom-card glass-panel p-4 p-md-5">
                      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2 pb-3 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge text-uppercase bg-secondary-subtle text-secondary small border">
                            {q.subject}
                          </span>
                          {q.year && (
                            <span className="badge bg-dark-subtle border text-secondary small">
                              UPSC {q.year}
                            </span>
                          )}
                          <span className="badge bg-danger-subtle text-danger border small">
                            Repeated: {mistake.repeatedCount || 1}x
                          </span>
                        </div>
                        
                        <div className="d-flex align-items-center gap-2">
                          {/* Category Tagging Dropdown */}
                          <select
                            className="form-control-custom py-1 px-2.5 small form-select"
                            style={{ fontSize: '0.75rem', width: '180px' }}
                            value={mistake.category}
                            onChange={(e) => handleCategoryChange(mistake._id, e.target.value)}
                          >
                            {categories.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <h6 className="mb-4 text-primary fw-semibold" style={{ color: 'var(--text-primary)', lineHeight: '1.6' }}>
                        {q.questionText}
                      </h6>

                      <div className="d-flex flex-column gap-2 mb-4">
                        {q.options.map((option, idx) => {
                          let borderStyle = '1px solid var(--border-color)';
                          let bgStyle = 'var(--bg-tertiary)';

                          if (mistake.selectedOption === idx) {
                            borderStyle = '1px solid var(--accent-danger)';
                            bgStyle = 'rgba(239, 68, 68, 0.05)';
                          }
                          if (q.correctOption === idx) {
                            borderStyle = '1px solid var(--accent-success)';
                            bgStyle = 'rgba(16, 185, 129, 0.05)';
                          }

                          return (
                            <div key={idx} className="w-100 p-2.5 rounded d-flex align-items-center gap-3 border small" style={{ border: borderStyle, backgroundColor: bgStyle, color: 'var(--text-primary)' }}>
                              <span className="fw-bold text-muted small bg-dark-subtle border d-flex align-items-center justify-content-center rounded-circle" style={{ width: '24px', height: '24px' }}>
                                {alphabet[idx]}
                              </span>
                              <span className="small text-secondary" style={{ color: 'var(--text-primary)' }}>{option}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation box */}
                      <div className="p-3 rounded mb-4" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                        <h6 className="fw-semibold text-secondary small mb-2">Explanation:</h6>
                        <p className="small text-secondary mb-0" style={{ lineHeight: '1.6' }}>{q.explanation}</p>
                      </div>

                      {/* Notes Box Inline */}
                      <div className="mb-4">
                        <label className="form-label small text-secondary d-flex justify-content-between">
                          <span>Personal Study Notes</span>
                          {editingId !== mistake._id && (
                            <button className="btn btn-sm text-primary p-0 small bg-transparent border-0" onClick={() => startEditNotes(mistake)}>
                              ✏️ Edit Notes
                            </button>
                          )}
                        </label>
                        {editingId === mistake._id ? (
                          <div className="d-flex flex-column gap-2">
                            <textarea
                              className="form-control-custom"
                              rows="2"
                              value={notesText}
                              onChange={(e) => setNotesText(e.target.value)}
                            />
                            <div className="d-flex gap-2">
                              <button className="btn btn-sm btn-primary-custom py-1 px-3" onClick={() => handleSaveNotes(mistake._id)} disabled={savingId === mistake._id}>
                                Save
                              </button>
                              <button className="btn btn-sm btn-secondary-custom py-1 px-3" onClick={() => setEditingId(null)}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="small text-muted p-2 border rounded" style={{ backgroundColor: 'var(--bg-primary)', borderStyle: 'dashed' }}>
                            {mistake.personalNote || 'No notes added. Click edit to add study memory triggers.'}
                          </p>
                        )}
                      </div>

                      {/* Actions footer */}
                      <div className="d-flex align-items-center gap-3">
                        <button className="btn btn-sm btn-primary-custom py-2 px-4" onClick={() => handleResolve(mistake._id)} disabled={resolvingId === mistake._id}>
                          Mark Reviewed
                        </button>
                        <button className="btn btn-sm btn-secondary-custom py-2 px-3 text-danger border" style={{ borderColor: 'rgba(239,68,68,0.2)' }} onClick={() => handleRemove(mistake._id)}>
                          Remove permanently
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default MistakeBook;
