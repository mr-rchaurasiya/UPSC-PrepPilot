import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar.jsx';
import { getQuestionsList, submitQuestionAnswer, toggleBookmarkItem } from '../services/practiceService.js';

export const PracticeRoom = () => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Bookmarks state
  const [bookmarkedList, setBookmarkedList] = useState([]);
  
  // Question Notes
  const [notes, setNotes] = useState('');
  
  // Stopwatch
  const [timeTaken, setTimeTaken] = useState(0);
  const [timerActive, setTimerActive] = useState(true);

  // Stats Counters
  const [stats, setStats] = useState({
    attempts: 0,
    correct: 0,
    wrong: 0,
    skipped: 0
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  useEffect(() => {
    loadQuestions();
    const local = localStorage.getItem('mock_bookmarks') || '[]';
    setBookmarkedList(JSON.parse(local));
  }, []);

  useEffect(() => {
    let interval = null;
    if (timerActive && !loading && questions.length > 0) {
      interval = setInterval(() => {
        setTimeTaken(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive, loading, questions]);

  const loadQuestions = async () => {
    setLoading(true);
    const list = await getQuestionsList();
    setQuestions(list);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setResult(null);
    setTimeTaken(0);
    setTimerActive(true);
    setLoading(false);
  };

  const handleOptionClick = (idx) => {
    if (isSubmitted) return;
    setSelectedOption(idx);
  };

  const handleCheckAnswer = async () => {
    if (selectedOption === null || submitting) return;
    
    setSubmitting(true);
    setTimerActive(false);
    const currentQ = questions[currentIndex];
    
    try {
      const res = await submitQuestionAnswer(currentQ._id, selectedOption);
      setResult(res);
      setIsSubmitted(true);
      
      setStats(prev => ({
        attempts: prev.attempts + 1,
        correct: res.isCorrect ? prev.correct + 1 : prev.correct,
        wrong: !res.isCorrect ? prev.wrong + 1 : prev.wrong,
        skipped: prev.skipped
      }));

      if (notes.trim()) {
        localStorage.setItem(`note_${currentQ._id}`, notes);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    setStats(prev => ({ ...prev, skipped: prev.skipped + 1 }));
    handleNext();
  };

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
      setResult(null);
      setTimeTaken(0);
      setTimerActive(true);
      const nextQ = filteredQuestions[currentIndex + 1];
      const savedNote = localStorage.getItem(`note_${nextQ._id}`) || '';
      setNotes(savedNote);
    } else {
      alert('You have completed all loaded questions!');
    }
  };

  const handleBookmarkToggle = async (qId) => {
    try {
      const res = await toggleBookmarkItem(qId);
      if (res.success) {
        if (res.isBookmarked) {
          setBookmarkedList(prev => [...prev, qId]);
        } else {
          setBookmarkedList(prev => prev.filter(id => id !== qId));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredQuestions = questions.filter(q => {
    const textMatch = q.questionText.toLowerCase().includes(searchQuery.toLowerCase());
    const yearMatch = selectedYear ? q.year === parseInt(selectedYear, 10) : true;
    const subMatch = selectedSubject ? q.subject === selectedSubject : true;
    const diffMatch = selectedDifficulty ? q.difficulty === selectedDifficulty : true;
    return textMatch && yearMatch && subMatch && diffMatch;
  });

  const alphabet = ['A', 'B', 'C', 'D'];
  const currentQ = filteredQuestions[currentIndex];

  const accuracy = stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : 0;

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="container-fluid px-4 py-4 flex-grow-1">
        
        <div className="mb-4">
          <h2 className="gradient-text fw-bold mb-0">UPSC PYQ Practice Room</h2>
          <p className="text-secondary small">Analyze, solve, and track past year civil services prelims questions</p>
        </div>

        {/* Filters Panel */}
        <div className="custom-card glass-panel p-4 mb-4">
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <label className="form-label small text-secondary">Search Questions</label>
              <input
                type="text"
                className="form-control-custom"
                placeholder="Search keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="col-6 col-md-2">
              <label className="form-label small text-secondary">Year</label>
              <select
                className="form-control-custom form-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="">All Years</option>
                <option value="2021">2021</option>
                <option value="2015">2015</option>
              </select>
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label small text-secondary">Subject</label>
              <select
                className="form-control-custom form-select"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="">All Subjects</option>
                <option value="Indian Polity & Governance">Polity</option>
                <option value="CSAT Aptitude">CSAT</option>
              </select>
            </div>
            <div className="col-6 col-md-2">
              <label className="form-label small text-secondary">Difficulty</label>
              <select
                className="form-control-custom form-select"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
              >
                <option value="">All</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="col-6 col-md-1 d-flex align-items-end">
              <button className="btn btn-secondary-custom w-100 py-2 btn-sm h-100" onClick={() => { setSearchQuery(''); setSelectedYear(''); setSelectedSubject(''); setSelectedDifficulty(''); }}>
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-12 col-lg-8">
            {!currentQ ? (
              <div className="custom-card glass-panel p-5 text-center text-muted small">
                No matching PYQs found. Try clearing your filters!
              </div>
            ) : (
              <div className="custom-card glass-panel p-4 p-md-5">
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge text-uppercase bg-secondary-subtle text-secondary small border" style={{ borderColor: 'var(--border-color)' }}>
                      {currentQ.subject}
                    </span>
                    {currentQ.year && (
                      <span className="badge bg-dark-subtle border text-secondary small">
                        UPSC {currentQ.year}
                      </span>
                    )}
                    <span className="badge bg-dark-subtle border text-secondary small">
                      {currentQ.difficulty}
                    </span>
                  </div>
                  
                  <div className="d-flex align-items-center gap-3">
                    <span className="fw-mono text-muted small bg-dark-subtle border py-1 px-2.5 rounded">
                      ⏱️ {Math.floor(timeTaken / 60)}:{(timeTaken % 60).toString().padStart(2, '0')}
                    </span>
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary-custom py-1 px-2 border"
                      onClick={() => handleBookmarkToggle(currentQ._id)}
                    >
                      {bookmarkedList.includes(currentQ._id) ? '⭐ Bookmarked' : '☆ Bookmark'}
                    </button>
                  </div>
                </div>

                <h5 className="mb-4 text-primary fw-semibold" style={{ color: 'var(--text-primary)', lineHeight: '1.6' }}>
                  {currentQ.questionText}
                </h5>

                <div className="d-flex flex-column gap-3 mb-4">
                  {currentQ.options.map((option, idx) => {
                    let borderStyle = '1px solid var(--border-color)';
                    let bgStyle = 'var(--bg-tertiary)';
                    
                    if (selectedOption === idx) {
                      borderStyle = '1px solid var(--accent-primary)';
                      bgStyle = 'rgba(99, 102, 241, 0.1)';
                    }

                    if (isSubmitted) {
                      if (idx === result?.correctOption) {
                        borderStyle = '1px solid var(--accent-success)';
                        bgStyle = 'rgba(16, 185, 129, 0.1)';
                      } else if (selectedOption === idx && !result?.isCorrect) {
                        borderStyle = '1px solid var(--accent-danger)';
                        bgStyle = 'rgba(239, 68, 68, 0.1)';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        className="w-100 text-start p-3 rounded d-flex align-items-center gap-3 border"
                        style={{ border: borderStyle, backgroundColor: bgStyle, color: 'var(--text-primary)', cursor: isSubmitted ? 'default' : 'pointer', transition: 'all 0.2s' }}
                        onClick={() => handleOptionClick(idx)}
                        disabled={isSubmitted}
                      >
                        <span className="fw-bold text-muted small bg-dark-subtle border d-flex align-items-center justify-content-center rounded-circle" style={{ width: '28px', height: '28px', borderColor: 'var(--border-color)' }}>
                          {alphabet[idx]}
                        </span>
                        <span className="small text-secondary" style={{ color: 'var(--text-primary)' }}>{option}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="d-flex align-items-center gap-3 flex-wrap">
                  {!isSubmitted ? (
                    <>
                      <button
                        className="btn-primary-custom py-2 px-5"
                        onClick={handleCheckAnswer}
                        disabled={selectedOption === null || submitting}
                      >
                        {submitting ? (
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        ) : null}
                        Check Answer
                      </button>
                      <button className="btn btn-secondary-custom py-2 px-4" onClick={handleSkip}>
                        Skip Question
                      </button>
                    </>
                  ) : (
                    <button className="btn-primary-custom py-2 px-5" onClick={handleNext}>
                      {currentIndex < filteredQuestions.length - 1 ? 'Next Question' : 'Complete Module'}
                    </button>
                  )}
                </div>

                <div className="mt-4 pt-4 border-top" style={{ borderColor: 'var(--border-color)' }}>
                  <label className="form-label small text-secondary">My Study Notes relative to this Question</label>
                  <textarea
                    className="form-control-custom"
                    rows="2"
                    placeholder="Write key memory triggers or related points here..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {isSubmitted && result && (
                  <div className="mt-4 pt-4 border-top" style={{ borderTopColor: 'var(--border-color)' }}>
                    {result.isCorrect ? (
                      <div className="alert alert-success py-2.5 small mb-3 border-0 rounded-3" role="alert" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)' }}>
                        <strong>✓ Correct Answer!</strong> Accurate recall.
                      </div>
                    ) : (
                      <div className="alert alert-danger py-2.5 small mb-3 border-0 rounded-3" role="alert" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-danger)' }}>
                        <strong>✗ Incorrect Answer.</strong> The correct choice was option <strong>{alphabet[result.correctOption]}</strong>.
                      </div>
                    )}
                    
                    <h6 className="fw-semibold text-secondary mb-2">Detailed Explanation:</h6>
                    <p className="small text-secondary mb-4" style={{ lineHeight: '1.6' }}>{result.explanation}</p>

                    <div className="p-3.5 rounded" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                      <span className="small text-muted d-block mb-1">Related Syllabus Topic:</span>
                      <span className="small fw-semibold text-primary" style={{ color: 'var(--text-primary)' }}>
                        {currentQ.subject} - Core Conceptual Directives
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="col-12 col-lg-4">
            <div className="custom-card glass-panel p-4 mb-4 text-center">
              <h5 className="mb-4 fw-semibold text-secondary">Module Metrics</h5>
              
              <div className="row g-2 mb-4">
                <div className="col-6">
                  <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    <span className="small text-muted d-block">Attempted</span>
                    <h3 className="fw-bold mt-1 mb-0 text-secondary">{stats.attempts}</h3>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    <span className="small text-muted d-block">Correct</span>
                    <h3 className="fw-bold mt-1 mb-0 text-success">{stats.correct}</h3>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    <span className="small text-muted d-block">Skipped</span>
                    <h3 className="fw-bold mt-1 mb-0 text-secondary">{stats.skipped}</h3>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    <span className="small text-muted d-block">Accuracy</span>
                    <h3 className="fw-bold mt-1 mb-0 text-primary">{accuracy}%</h3>
                  </div>
                </div>
              </div>

              <div className="text-secondary small">
                Question {filteredQuestions.length > 0 ? currentIndex + 1 : 0} of {filteredQuestions.length}
              </div>
            </div>

            <div className="custom-card glass-panel p-4">
              <h6 className="fw-semibold text-secondary mb-3">Syllabus Insights</h6>
              <p className="small text-secondary mb-0" style={{ lineHeight: '1.6' }}>
                Practice similar conceptual questions on this topic under the Syllabus tree page to strengthen retention.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PracticeRoom;
