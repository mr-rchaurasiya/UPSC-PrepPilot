import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar.jsx';
import { getRevisionDashboardData, rateTopicRevision } from '../services/revisionService.js';
import { getQuestionsList } from '../services/practiceService.js';

export const RevisionRoom = () => {
  const [dashboard, setDashboard] = useState({ dueToday: [], overdue: [], upcoming: [], completed: [] });
  const [loading, setLoading] = useState(true);
  const [activeSessionTopic, setActiveSessionTopic] = useState(null); // SyllabusProgress populated object
  const [sessionTab, setSessionTab] = useState('notes'); // 'notes', 'flashcards', 'pyqs', 'rating'
  
  // Flashcard flip helper
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const [relatedQuestions, setRelatedQuestions] = useState([]);
  const [activeRateOption, setActiveRateOption] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await getRevisionDashboardData();
      if (data) {
        setDashboard({
          dueToday: data.dueToday || [],
          overdue: data.overdue || [],
          upcoming: data.upcoming || [],
          completed: data.completed || []
        });
      }
    } catch (err) {
      console.error('Failed to load revision dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async (progressItem) => {
    if (!progressItem) return;
    setActiveSessionTopic(progressItem);
    setSessionTab('notes');
    setFlashcardFlipped(false);
    setActiveRateOption(null);
    
    // Load related questions
    try {
      const subject = progressItem?.topic?.subject || 'Indian Polity & Governance';
      const qList = await getQuestionsList({ subject });
      setRelatedQuestions(Array.isArray(qList) ? qList.slice(0, 3) : []);
    } catch (e) {
      console.error(e);
      setRelatedQuestions([]);
    }
  };

  const handleApplyRating = async (ratingVal) => {
    if (!activeSessionTopic || !activeSessionTopic.topic) return;
    setActiveRateOption(ratingVal);
    try {
      const topicId = activeSessionTopic.topic._id || activeSessionTopic.topic;
      await rateTopicRevision(topicId, ratingVal);
      setActiveSessionTopic(null);
      loadDashboard();
    } catch (e) {
      console.error(e);
    }
  };

  // Preset flashcards mock data relative to the subject
  const getSubjectFlashcards = (subject = '') => {
    const s = (subject || '').toLowerCase();
    if (s.includes('history')) {
      return [
        { q: 'Who founded the Brahmo Samaj in 1828?', a: 'Raja Ram Mohan Roy in Calcutta.' },
        { q: 'In which session did Congress pass the "Purna Swaraj" resolution?', a: 'Lahore Session of 1929 presided over by Jawaharlal Nehru.' },
        { q: 'Which act established the dual system of control (Board of Control & Court of Directors)?', a: 'Pitt’s India Act of 1784.' }
      ];
    } else if (s.includes('economy')) {
      return [
        { q: 'What is headline inflation in India measured by?', a: 'Consumer Price Index (CPI-Combined) published by NSO.' },
        { q: 'Which Article mandates the establishment of the Finance Commission?', a: 'Article 280 of the Indian Constitution.' },
        { q: 'What is the Fiscal Responsibility and Budget Management (FRBM) target for fiscal deficit?', a: 'Aiming for 3% of GDP recommended by NK Singh Committee.' }
      ];
    }
    return [
      { q: 'What is the minimum age to qualify for election as the President of India?', a: '35 years of age (Article 58).' },
      { q: 'Which constitutional amendment added the word "Secular" to the Preamble?', a: 'The 42nd Constitutional Amendment Act of 1976.' },
      { q: 'Who is considered the custodian of the Constitution of India?', a: 'The Supreme Court of India.' }
    ];
  };

  const currentFlashcards = getSubjectFlashcards(activeSessionTopic?.topic?.subject);
  const totalCardsCount = (dashboard.dueToday?.length || 0) + (dashboard.overdue?.length || 0) + (dashboard.upcoming?.length || 0) + (dashboard.completed?.length || 0);

  if (loading) {
    return (
      <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Navbar />
        <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center">
          <div className="spinner-border mb-3" role="status" style={{ width: '3rem', height: '3rem', color: 'var(--accent-primary)' }}>
            <span className="visually-hidden">Loading Spaced Repetition Engine...</span>
          </div>
          <p className="text-secondary small">Loading Spaced Repetition schedules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="container px-4 py-4 flex-grow-1" style={{ maxWidth: '1000px' }}>
        
        {/* DASHBOARD MODE */}
        {!activeSessionTopic ? (
          <div>
            <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <h2 className="gradient-text fw-bold mb-1">Smart Revision Engine</h2>
                <p className="text-secondary small mb-0">Spaced repetition schedules based on active recall strength and forgetting curves</p>
              </div>
              <Link to="/syllabus" className="btn btn-sm btn-outline-primary-custom py-1.5 px-3">
                📖 View Full Syllabus
              </Link>
            </div>

            {/* Dashboard Cards Grid */}
            <div className="row g-4 mb-4">
              {[
                { label: 'Due Today', count: dashboard.dueToday?.length || 0, list: dashboard.dueToday || [], color: 'var(--accent-danger)' },
                { label: 'Overdue Reviews', count: dashboard.overdue?.length || 0, list: dashboard.overdue || [], color: 'var(--accent-warning)' },
                { label: 'Upcoming Reviews', count: dashboard.upcoming?.length || 0, list: dashboard.upcoming || [], color: 'var(--accent-primary)' },
                { label: 'Completed Reviews', count: dashboard.completed?.length || 0, list: dashboard.completed || [], color: 'var(--accent-success)' }
              ].map((card, cIdx) => (
                <div key={cIdx} className="col-12 col-md-6 col-lg-3">
                  <div className="custom-card glass-panel p-4 h-100 d-flex flex-column justify-content-between">
                    <div>
                      <span className="text-muted small fw-semibold text-uppercase" style={{ fontSize: '0.65rem' }}>{card.label}</span>
                      <h2 className="fw-bold mt-2 mb-3" style={{ color: card.color }}>{card.count}</h2>
                    </div>

                    <div className="d-flex flex-column gap-2" style={{ maxHeight: '160px', overflowY: 'auto' }}>
                      {card.list.length === 0 ? (
                        <span className="small text-muted fst-italic">No items</span>
                      ) : (
                        card.list.map((item, idx) => (
                          <div key={idx} className="p-2 rounded border d-flex justify-content-between align-items-center" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}>
                            <span className="small text-secondary text-truncate" style={{ maxWidth: '120px' }} title={item.topic?.title}>
                              {item.topic?.title || 'Syllabus Topic'}
                            </span>
                            {card.label !== 'Completed Reviews' && (
                              <button className="btn btn-sm btn-primary-custom py-0.5 px-2" style={{ fontSize: '0.65rem' }} onClick={() => handleStartSession(item)}>
                                Review
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* If 0 items scheduled, show a friendly prompt */}
            {totalCardsCount === 0 && (
              <div className="custom-card glass-panel p-4 text-center mt-3">
                <div className="mb-2" style={{ fontSize: '2.5rem' }}>📚</div>
                <h5 className="fw-bold text-secondary" style={{ color: 'var(--text-primary)' }}>No Topics in Revision Queue Yet</h5>
                <p className="text-muted small mb-3" style={{ maxWidth: '500px', margin: '0 auto' }}>
                  Topics are automatically scheduled for smart spaced repetition once you mark topics as completed or revised in your Syllabus Tracker.
                </p>
                <Link to="/syllabus" className="btn btn-primary-custom py-2 px-4">
                  Go to Syllabus Tracker
                </Link>
              </div>
            )}
          </div>
        ) : (
          /* ACTIVE REVISION SESSION COMPONENT */
          <div className="custom-card glass-panel p-4 p-md-5">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2 pb-3 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
              <div>
                <span className="badge text-uppercase bg-secondary-subtle text-secondary small border px-2 py-0.5 mb-1.5">{activeSessionTopic.topic?.code || 'GS'}</span>
                <h5 className="fw-semibold text-secondary mb-0" style={{ color: 'var(--text-primary)' }}>{activeSessionTopic.topic?.title || 'Active Topic'}</h5>
              </div>
              <button className="btn btn-sm btn-secondary-custom py-1.5 px-3" onClick={() => setActiveSessionTopic(null)}>
                ✕ Close Session
              </button>
            </div>

            {/* Session Navigation Tabs */}
            <div className="d-flex flex-wrap gap-1 mb-4">
              {[
                { id: 'notes', label: 'Quick Notes' },
                { id: 'flashcards', label: 'Flashcards (Recall)' },
                { id: 'pyqs', label: 'Related PYQs & MCQs' },
                { id: 'rating', label: 'Self-Rating (Spaced Repetition)' }
              ].map(tab => (
                <button
                  key={tab.id}
                  className={`btn btn-sm ${sessionTab === tab.id ? 'btn-primary-custom' : 'btn-secondary-custom'} py-1 px-3`}
                  style={{ fontSize: '0.75rem' }}
                  onClick={() => setSessionTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENTS */}
            <div className="p-3 rounded mb-5" style={{ backgroundColor: 'var(--bg-tertiary)', minHeight: '220px' }}>
              
              {/* Tab 1: Notes */}
              {sessionTab === 'notes' && (
                <div>
                  <h6 className="fw-semibold text-secondary small mb-2">My Saved Syllabus Notes:</h6>
                  <p className="small text-secondary" style={{ lineHeight: '1.6' }}>
                    {activeSessionTopic.notes || 'No custom notes saved for this topic yet. You can add notes anytime in the Syllabus Tracker.'}
                  </p>
                </div>
              )}

              {/* Tab 2: Flashcards */}
              {sessionTab === 'flashcards' && (
                <div className="d-flex flex-column align-items-center justify-content-center py-4">
                  <div
                    className="p-4 rounded border text-center cursor-pointer shadow-sm d-flex flex-column align-items-center justify-content-center"
                    style={{
                      width: '340px',
                      minHeight: '160px',
                      backgroundColor: flashcardFlipped ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-secondary)',
                      borderColor: 'var(--border-color)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                  >
                    {!flashcardFlipped ? (
                      <div>
                        <span className="small text-muted d-block mb-3">Flashcard (Click to reveal answer)</span>
                        <h6 className="fw-semibold text-secondary mb-0" style={{ color: 'var(--text-primary)' }}>{currentFlashcards[0]?.q || 'What is the constitutional provision for this topic?'}</h6>
                      </div>
                    ) : (
                      <div>
                        <span className="small text-success d-block mb-3">Recall Answer:</span>
                        <p className="small text-secondary mb-0">{currentFlashcards[0]?.a || 'Article & case law guidelines.'}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: PYQs */}
              {sessionTab === 'pyqs' && (
                <div>
                  <h6 className="fw-semibold text-secondary small mb-3 text-uppercase" style={{ fontSize: '0.65rem' }}>Practice Questions on {activeSessionTopic.topic?.subject || 'Syllabus'}</h6>
                  <div className="d-flex flex-column gap-3">
                    {relatedQuestions.length > 0 ? (
                      relatedQuestions.map((q, idx) => (
                        <div key={idx} className="p-3 rounded border bg-dark-subtle" style={{ borderColor: 'var(--border-color)' }}>
                          <span className="badge bg-secondary-subtle text-secondary small border mb-2">Question {idx+1}</span>
                          <p className="small text-secondary mb-0" style={{ color: 'var(--text-primary)', lineHeight: '1.5' }}>{q.questionText}</p>
                        </div>
                      ))
                    ) : (
                      <p className="small text-muted fst-italic">No related practice questions logged for this specific subject yet.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 4: Rating */}
              {sessionTab === 'rating' && (
                <div className="text-center py-3">
                  <h6 className="fw-semibold text-secondary small mb-3">How well do you remember this syllabus topic?</h6>
                  <p className="small text-muted mb-4">Rating adjusts the next revision interval mathematically using the spaced repetition algorithm.</p>
                  
                  <div className="row g-2 justify-content-center">
                    {[
                      { name: 'Forgot', desc: 'Repeat Tomorrow (Interval: 1 Day)', btnColor: 'btn-danger' },
                      { name: 'Partially Remembered', desc: 'Review in 3 Days', btnColor: 'btn-warning text-dark' },
                      { name: 'Remembered', desc: 'Review in 7 Days', btnColor: 'btn-primary-custom' },
                      { name: 'Strong', desc: 'Review in 30 Days', btnColor: 'btn-success' }
                    ].map((opt, oIdx) => (
                      <div key={oIdx} className="col-12 col-sm-5 col-md-3">
                        <button
                          className={`btn ${opt.btnColor} w-100 py-3 d-flex flex-column align-items-center justify-content-center gap-1.5`}
                          onClick={() => handleApplyRating(opt.name)}
                          disabled={activeRateOption !== null}
                        >
                          <span className="fw-bold">{opt.name}</span>
                          <span className="small font-normal" style={{ fontSize: '0.65rem', opacity: '0.85' }}>{opt.desc}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default RevisionRoom;
