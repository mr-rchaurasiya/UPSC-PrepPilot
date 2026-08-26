import React, { useState, useEffect } from 'react';
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
    const data = await getRevisionDashboardData();
    if (data) {
      setDashboard(data);
    }
    setLoading(false);
  };

  const handleStartSession = async (progressItem) => {
    setActiveSessionTopic(progressItem);
    setSessionTab('notes');
    setFlashcardFlipped(false);
    setActiveRateOption(null);
    
    // Load related questions
    try {
      const qList = await getQuestionsList({ subject: progressItem.topic.subject });
      setRelatedQuestions(qList.slice(0, 3));
    } catch (e) {
      console.error(e);
    }
  };

  const handleApplyRating = async (ratingVal) => {
    if (!activeSessionTopic) return;
    setActiveRateOption(ratingVal);
    try {
      await rateTopicRevision(activeSessionTopic.topic._id, ratingVal);
      setActiveSessionTopic(null);
      loadDashboard();
    } catch (e) {
      console.error(e);
    }
  };

  // Preset flashcards mock data relative to the subject
  const getSubjectFlashcards = (subject) => {
    return [
      { q: 'What is the minimum age to qualify for election as the President of India?', a: '35 years of age (Article 58).' },
      { q: 'Which constitutional amendment added the word "Secular" to the Preamble?', a: 'The 42nd Constitutional Amendment Act of 1976.' },
      { q: 'Who is considered the custodian of the Constitution of India?', a: 'The Supreme Court of India.' }
    ];
  };

  const currentFlashcards = activeSessionTopic ? getSubjectFlashcards(activeSessionTopic.topic.subject) : [];

  if (loading) {
    return (
      <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Navbar />
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem', color: 'var(--accent-primary)' }}>
            <span className="visually-hidden">Loading Spaced Repetition Engine...</span>
          </div>
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
            <div className="mb-4">
              <h2 className="gradient-text fw-bold mb-0">Smart Revision Engine</h2>
              <p className="text-secondary small">Automatically calculated spaced repetition schedules based on recall strength rates</p>
            </div>

            {/* Dashboard Cards Grid */}
            <div className="row g-4 mb-5">
              {[
                { label: 'Due Today', count: dashboard.dueToday.length, list: dashboard.dueToday, color: 'var(--accent-danger)' },
                { label: 'Overdue Reviews', count: dashboard.overdue.length, list: dashboard.overdue, color: 'var(--accent-warning)' },
                { label: 'Upcoming Reviews', count: dashboard.upcoming.length, list: dashboard.upcoming, color: 'var(--accent-primary)' },
                { label: 'Completed Reviews', count: dashboard.completed.length, list: dashboard.completed, color: 'var(--accent-success)' }
              ].map((card, cIdx) => (
                <div key={cIdx} className="col-12 col-md-6 col-lg-3">
                  <div className="custom-card glass-panel p-4 h-100 d-flex flex-column justify-content-between">
                    <div>
                      <span className="text-muted small fw-semibold text-uppercase" style={{ fontSize: '0.65rem' }}>{card.label}</span>
                      <h2 className="fw-bold mt-2 mb-4" style={{ color: card.color }}>{card.count}</h2>
                    </div>

                    <div className="d-flex flex-column gap-2" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                      {card.list.length === 0 ? (
                        <span className="small text-muted italic">Clear schedule</span>
                      ) : (
                        card.list.map((item, idx) => (
                          <div key={idx} className="p-2 rounded border d-flex justify-content-between align-items-center" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}>
                            <span className="small text-secondary text-truncate" style={{ maxWidth: '120px' }}>{item.topic?.title}</span>
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
          </div>
        ) : (
          /* ACTIVE REVISION SESSION COMPONENT */
          <div className="custom-card glass-panel p-4 p-md-5">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2 pb-3 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
              <div>
                <span className="badge text-uppercase bg-secondary-subtle text-secondary small border px-2 py-0.5 mb-1.5">{activeSessionTopic.topic?.code}</span>
                <h5 className="fw-semibold text-secondary" style={{ color: 'var(--text-primary)' }}>{activeSessionTopic.topic?.title}</h5>
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
                    {activeSessionTopic.notes || 'No notes saved for this syllabus topic. Edit syllabus progress to add reference notes.'}
                  </p>
                </div>
              )}

              {/* Tab 2: Flashcards */}
              {sessionTab === 'flashcards' && (
                <div className="d-flex flex-column align-items-center justify-content-center py-4">
                  <div
                    className="p-4 rounded border text-center cursor-pointer shadow-sm d-flex flex-column align-items-center justify-content-center"
                    style={{
                      width: '320px',
                      minHeight: '160px',
                      backgroundColor: flashcardFlipped ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-secondary)',
                      borderColor: 'var(--border-color)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                  >
                    {!flashcardFlipped ? (
                      <div>
                        <span className="small text-muted d-block mb-3">Flashcard (Click to reveal answer)</span>
                        <h6 className="fw-semibold text-secondary mb-0" style={{ color: 'var(--text-primary)' }}>{currentFlashcards[0].q}</h6>
                      </div>
                    ) : (
                      <div>
                        <span className="small text-success d-block mb-3">Recall Answer:</span>
                        <p className="small text-secondary mb-0">{currentFlashcards[0].a}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: PYQs */}
              {sessionTab === 'pyqs' && (
                <div>
                  <h6 className="fw-semibold text-secondary small mb-3 text-uppercase" style={{ fontSize: '0.65rem' }}>Practice Questions on {activeSessionTopic.topic?.subject}</h6>
                  <div className="d-flex flex-column gap-3">
                    {relatedQuestions.map((q, idx) => (
                      <div key={idx} className="p-3 rounded border bg-dark-subtle" style={{ borderColor: 'var(--border-color)' }}>
                        <span className="badge bg-secondary-subtle text-secondary small border mb-2">Question {idx+1}</span>
                        <p className="small text-secondary mb-0" style={{ color: 'var(--text-primary)', lineHeight: '1.5' }}>{q.questionText}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: Rating */}
              {sessionTab === 'rating' && (
                <div className="text-center py-3">
                  <h6 className="fw-semibold text-secondary small mb-3">How well do you remember this syllabus topic?</h6>
                  <p className="small text-muted mb-4">Rating adjusts the next revision interval mathematically.</p>
                  
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
