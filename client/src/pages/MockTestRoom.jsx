import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar.jsx';
import { getQuestionsList, getMistakesList } from '../services/practiceService.js';
import { submitMockAttempt, getMockAttemptsHistory } from '../services/mockTestService.js';

export const MockTestRoom = () => {
  const [testMode, setTestMode] = useState(null); // 'select', 'setup', 'test', 'result'
  const [activeMode, setActiveMode] = useState(null); // Selected mode object
  
  // Selection setups
  const [setupStep, setSetupStep] = useState(null); // 'subject', 'topic'
  const [subjectsList, setSubjectsList] = useState([
    'Indian Polity & Governance',
    'Modern Indian History & Culture',
    'Economic Development',
    'Ethics, Integrity & Aptitude',
    'CSAT Aptitude'
  ]);
  const [topicsList, setTopicsList] = useState([
    { id: 'mock-t1', name: 'Indian Constitution - Historical Underpinnings' },
    { id: 'mock-t2', name: 'Union and the States - Devolution & Panchayats' },
    { id: 'mock-t3', name: 'Indian Culture - Art Forms & Architecture' },
    { id: 'mock-t4', name: 'Indian Economy - Resource Mobilization' },
    { id: 'mock-t5', name: 'Ethics and Human Interface' }
  ]);

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [timeLeft, setTimeLeft] = useState(7200);
  const [timeSpent, setTimeSpent] = useState(0);
  const [testResult, setTestResult] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHistory();
    const autosave = localStorage.getItem('mock_test_autosave');
    if (autosave) {
      try {
        const parsed = JSON.parse(autosave);
        if (parsed && parsed.mode) {
          if (window.confirm(`Restore your previous autosaved progress for: ${parsed.mode}?`)) {
            setAnswers(parsed.answers || {});
            setMarkedForReview(parsed.marked || {});
            setTimeLeft(parsed.timeLeft || 7200);
            setTimeSpent(parsed.timeSpent || 0);
            setTestMode('test');
            loadQuestionsRestored(parsed.mode);
          } else {
            localStorage.removeItem('mock_test_autosave');
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const loadHistory = async () => {
    const list = await getMockAttemptsHistory();
    setHistoryList(list || []);
  };

  const loadQuestionsRestored = async (mode) => {
    setLoading(true);
    const list = await getQuestionsList();
    setQuestions(list);
    setLoading(false);
  };

  useEffect(() => {
    let interval = null;
    if (testMode === 'test') {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            handleSubmitTest(true);
            return 0;
          }
          return prev - 1;
        });
        setTimeSpent(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [testMode]);

  useEffect(() => {
    if (testMode === 'test') {
      const stateToSave = {
        mode: activeMode?.name,
        answers,
        marked: markedForReview,
        timeLeft,
        timeSpent
      };
      localStorage.setItem('mock_test_autosave', JSON.stringify(stateToSave));
    }
  }, [answers, markedForReview, timeLeft, timeSpent, testMode, activeMode]);

  // Starts the quiz after selecting filter configurations
  const startTest = async (modeObj, filterVal = null) => {
    setLoading(true);
    try {
      let list = [];
      
      if (modeObj.name === 'Previous Mistakes') {
        const mistakes = await getMistakesList();
        list = mistakes.map(m => m.question).filter(q => q !== null);
      } else {
        const queryParams = {};
        if (modeObj.name === 'Subject Practice' && filterVal) {
          queryParams.subject = filterVal;
        }
        list = await getQuestionsList(queryParams);
      }

      if (list.length === 0) {
        alert('No questions found for the selected mode configuration.');
        setTestMode('select');
        return;
      }

      setQuestions(list);
      setAnswers({});
      setMarkedForReview({});
      setTimeLeft(7200);
      setTimeSpent(0);
      setCurrentIndex(0);
      setTestMode('test');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleModeClick = (modeObj) => {
    setActiveMode(modeObj);
    if (modeObj.name === 'Subject Practice') {
      setSetupStep('subject');
      setTestMode('setup');
    } else if (modeObj.name === 'Topic Practice') {
      setSetupStep('topic');
      setTestMode('setup');
    } else {
      startTest(modeObj);
    }
  };

  const handleSelectAnswer = (optIdx) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentIndex]._id]: optIdx
    }));
  };

  const handleClearAnswer = () => {
    setAnswers(prev => {
      const updated = { ...prev };
      delete updated[questions[currentIndex]._id];
      return updated;
    });
  };

  const handleToggleReview = () => {
    const qId = questions[currentIndex]._id;
    setMarkedForReview(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  const handleSubmitTest = async (forced = false) => {
    if (!forced) {
      if (!window.confirm('Do you really want to end and submit this mock test attempt?')) return;
      if (!window.confirm('Confirming second time: Answers once submitted cannot be changed. Proceed?')) return;
    }

    setLoading(true);
    const answersPayload = questions.map(q => ({
      questionId: q._id,
      selectedOption: answers[q._id] !== undefined ? answers[q._id] : -1
    }));

    try {
      const res = await submitMockAttempt({
        mode: activeMode?.name || 'Full Mock Test',
        answers: answersPayload,
        timeSpentSeconds: timeSpent
      });

      if (res.success) {
        setTestResult(res.history);
        setTestMode('result');
        localStorage.removeItem('mock_test_autosave');
        loadHistory();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const modes = [
    { name: 'Topic Practice', desc: 'Syllabus topic-wise drill' },
    { name: 'Subject Practice', desc: 'Focused GS Paper mock modules' },
    { name: 'Mixed Practice', desc: 'Random prelims practice mode' },
    { name: 'Weak Topic Practice', desc: 'Questions on topics rated low confidence' },
    { name: 'Previous Mistakes', desc: 'Attempt mistake book error items' },
    { name: 'Full Mock Test', desc: 'UPSC CSE 100-Question Simulated Exam' }
  ];

  const alphabet = ['A', 'B', 'C', 'D'];

  if (loading) {
    return (
      <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Navbar />
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem', color: 'var(--accent-primary)' }}>
            <span className="visually-hidden">Loading Mock Test Room...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="container-fluid px-4 py-4 flex-grow-1">
        
        {/* SELECT MODE SCREEN */}
        {(!testMode || testMode === 'select') && (
          <div className="container" style={{ maxWidth: '1000px' }}>
            <div className="mb-4 text-center text-md-start">
              <h2 className="gradient-text fw-bold mb-0">UPSC MCQ & Mock Test Engine</h2>
              <p className="text-secondary small">Build exam endurance, verify accuracy parameters, and study subject metrics</p>
            </div>

            <div className="row g-4 mb-5">
              {modes.map((m, i) => (
                <div key={i} className="col-12 col-md-6 col-lg-4">
                  <div className="custom-card glass-panel p-4 h-100 d-flex flex-column justify-content-between">
                    <div>
                      <span className="badge bg-secondary-subtle text-secondary small border px-2 py-0.5 mb-2.5">MODE 0{i+1}</span>
                      <h5 className="fw-semibold text-secondary" style={{ color: 'var(--text-primary)' }}>{m.name}</h5>
                      <p className="small text-muted mb-4">{m.desc}</p>
                    </div>
                    <button className="btn-primary-custom w-100 py-2.5" onClick={() => handleModeClick(m)}>
                      Start Practice
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Test History list */}
            <div className="custom-card glass-panel p-4">
              <h5 className="mb-4 fw-semibold text-secondary">Mock Test History Logs</h5>
              {historyList.length === 0 ? (
                <div className="text-center py-4 text-muted small">No test logs found. Take your first test to initiate logs.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-dark table-hover mb-0" style={{ backgroundColor: 'transparent' }}>
                    <thead>
                      <tr className="small text-muted" style={{ borderBottomColor: 'var(--border-color)' }}>
                        <th>Date</th>
                        <th>Exam Mode</th>
                        <th>Score</th>
                        <th>Attempted</th>
                        <th>Accuracy</th>
                        <th>Time Spent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyList.map((item, index) => (
                        <tr key={index} className="small" style={{ borderBottomColor: 'var(--border-color)', verticalAlign: 'middle' }}>
                          <td className="text-muted">{new Date(item.createdAt).toLocaleDateString()}</td>
                          <td className="fw-semibold text-secondary" style={{ color: 'var(--text-primary)' }}>{item.mode}</td>
                          <td className={item.score >= 50 ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                            {item.score} / 200
                          </td>
                          <td className="text-secondary">{item.attempted} / {item.totalQuestions}</td>
                          <td className="text-secondary">{item.accuracy}%</td>
                          <td className="text-secondary">{Math.floor(item.timeSpentSeconds / 60)}m {item.timeSpentSeconds % 60}s</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SETUP SCREEN */}
        {testMode === 'setup' && (
          <div className="container" style={{ maxWidth: '600px' }}>
            <div className="custom-card glass-panel p-5 text-center">
              <h4 className="gradient-text fw-bold mb-3">{activeMode?.name} Configuration</h4>
              <p className="text-secondary small mb-4">Choose your focus category before starting the practice deck.</p>

              {setupStep === 'subject' && (
                <div className="d-flex flex-column gap-3">
                  {subjectsList.map((sub, sIdx) => (
                    <button key={sIdx} className="btn btn-secondary-custom py-2 px-3 text-start small border" onClick={() => startTest(activeMode, sub)}>
                      📘 {sub}
                    </button>
                  ))}
                </div>
              )}

              {setupStep === 'topic' && (
                <div className="d-flex flex-column gap-3">
                  {topicsList.map((top, tIdx) => (
                    <button key={tIdx} className="btn btn-secondary-custom py-2 px-3 text-start small border" onClick={() => startTest(activeMode, top.name)}>
                      📌 {top.name}
                    </button>
                  ))}
                </div>
              )}

              <button className="btn btn-sm text-secondary mt-4 bg-transparent border-0" onClick={() => setTestMode('select')}>
                ← Back to Mode Selector
              </button>
            </div>
          </div>
        )}

        {/* TEST ROOM EXAM SCREEN */}
        {testMode === 'test' && questions.length > 0 && (
          <div className="row g-4">
            
            {/* Left Question Panel */}
            <div className="col-12 col-lg-8">
              <div className="custom-card glass-panel p-4 p-md-5 h-100">
                <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
                  <div>
                    <span className="badge bg-secondary-subtle text-secondary small border px-2 py-0.5 mb-1.5">
                      Question {currentIndex + 1} of {questions.length}
                    </span>
                    <h6 className="small text-muted mb-0">{questions[currentIndex].subject}</h6>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <span className="fw-mono text-muted bg-dark-subtle border py-1.5 px-3 rounded text-danger fw-bold">
                      ⏱️ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </span>
                    <button
                      className={`btn btn-sm ${markedForReview[questions[currentIndex]._id] ? 'btn-warning text-dark' : 'btn-secondary-custom'} py-1.5 px-2.5`}
                      onClick={handleToggleReview}
                    >
                      {markedForReview[questions[currentIndex]._id] ? '★ Reviewing' : '☆ Mark for Review'}
                    </button>
                  </div>
                </div>

                <h5 className="mb-4 text-primary fw-semibold" style={{ color: 'var(--text-primary)', lineHeight: '1.6' }}>
                  {questions[currentIndex].questionText}
                </h5>

                {/* Option list */}
                <div className="d-flex flex-column gap-3 mb-5">
                  {questions[currentIndex].options.map((opt, oIdx) => {
                    const isSelected = answers[questions[currentIndex]._id] === oIdx;
                    return (
                      <button
                        key={oIdx}
                        className="w-100 text-start p-3 rounded d-flex align-items-center gap-3 border"
                        style={{
                          border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                          backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-tertiary)',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onClick={() => handleSelectAnswer(oIdx)}
                      >
                        <span className="fw-bold text-muted small bg-dark-subtle border d-flex align-items-center justify-content-center rounded-circle" style={{ width: '28px', height: '28px', borderColor: 'var(--border-color)' }}>
                          {alphabet[oIdx]}
                        </span>
                        <span className="small text-secondary" style={{ color: 'var(--text-primary)' }}>{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Footer Controls */}
                <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-secondary-custom py-2 px-4"
                      disabled={currentIndex === 0}
                      onClick={() => setCurrentIndex(prev => prev - 1)}
                    >
                      ← Previous
                    </button>
                    <button
                      className="btn btn-secondary-custom py-2 px-4"
                      disabled={currentIndex === questions.length - 1}
                      onClick={() => setCurrentIndex(prev => prev + 1)}
                    >
                      Next →
                    </button>
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-secondary-custom py-2 px-3 text-secondary" onClick={handleClearAnswer}>
                      Clear Response
                    </button>
                    <button className="btn btn-danger py-2 px-5" onClick={() => handleSubmitTest(false)}>
                      Submit Test
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Question Palette Panel */}
            <div className="col-12 col-lg-4">
              <div className="custom-card glass-panel p-4 h-100">
                <h5 className="mb-3 fw-semibold text-secondary">Question Palette</h5>
                
                <div className="d-flex flex-wrap gap-2.5 mb-4">
                  {questions.map((q, idx) => {
                    const isAnswered = answers[q._id] !== undefined;
                    const isMarked = markedForReview[q._id];
                    let btnBg = 'var(--bg-tertiary)';
                    let btnColor = 'var(--text-muted)';
                    let border = '1px solid var(--border-color)';

                    if (isMarked) {
                      btnBg = 'var(--accent-warning)';
                      btnColor = 'var(--bg-primary)';
                      border = 'none';
                    } else if (isAnswered) {
                      btnBg = 'var(--accent-success)';
                      btnColor = '#ffffff';
                      border = 'none';
                    }

                    if (idx === currentIndex) {
                      border = '2px solid var(--accent-primary)';
                    }

                    return (
                      <button
                        key={idx}
                        className="rounded-circle d-flex align-items-center justify-content-center fw-semibold"
                        style={{
                          width: '40px',
                          height: '40px',
                          backgroundColor: btnBg,
                          color: btnColor,
                          border: border,
                          fontSize: '0.85rem',
                          cursor: 'pointer'
                        }}
                        onClick={() => setCurrentIndex(idx)}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                <div className="d-flex flex-column gap-2 border-top pt-3 small text-secondary" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="d-flex align-items-center gap-2">
                    <span className="rounded-circle bg-success" style={{ width: '12px', height: '12px' }}></span>
                    <span>Answered ({Object.keys(answers).length})</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="rounded-circle bg-warning" style={{ width: '12px', height: '12px' }}></span>
                    <span>Marked for Review ({Object.keys(markedForReview).filter(k => markedForReview[k]).length})</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="rounded-circle" style={{ width: '12px', height: '12px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}></span>
                    <span>Unvisited ({questions.length - Object.keys(answers).length})</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* RESULTS FEEDBACK SCREEN */}
        {testMode === 'result' && testResult && (
          <div className="container" style={{ maxWidth: '850px' }}>
            <div className="custom-card glass-panel p-5 text-center mb-4">
              <h2 className="gradient-text fw-bold mb-1">Attempt Evaluation Complete</h2>
              <p className="text-secondary small mb-4">PrepPilot Performance Grading Console</p>

              <h1 className="fw-bold display-4 mb-1" style={{ color: 'var(--accent-primary)' }}>
                {testResult.score} <span className="fs-5 text-muted">/ 200 marks</span>
              </h1>
              <p className="small text-secondary mb-4">UPSC Qualifying Cutoff Benchmark: ~90 marks</p>

              <div className="row g-3 mb-4">
                {[
                  { label: 'Attempted', val: testResult.attempted, color: 'var(--text-primary)' },
                  { label: 'Correct Hits', val: testResult.correct, color: 'var(--accent-success)' },
                  { label: 'Wrong Options', val: testResult.wrong, color: 'var(--accent-danger)' },
                  { label: 'Negative Marks', val: `-${testResult.negativeMarks}`, color: 'var(--accent-danger)' },
                  { label: 'Accuracy', val: `${testResult.accuracy}%`, color: 'var(--accent-primary)' },
                  { label: 'Time Spent', val: `${Math.floor(testResult.timeSpentSeconds / 60)}m`, color: 'var(--text-primary)' }
                ].map((stat, i) => (
                  <div key={i} className="col-4 col-md-2">
                    <div className="p-2.5 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <span className="text-muted d-block" style={{ fontSize: '0.65rem' }}>{stat.label}</span>
                      <h5 className="fw-bold mt-1 mb-0" style={{ color: stat.color }}>{stat.val}</h5>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-start mt-5">
                <h6 className="fw-semibold text-secondary mb-3">Subject Performance Analysis</h6>
                <div className="row g-3">
                  {testResult.subjectBreakdown?.map((sub, i) => (
                    <div key={i} className="col-12 col-md-6">
                      <div className="p-3 rounded border" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="small fw-semibold">{sub.subject}</span>
                          <span className="small text-success fw-bold">
                            {sub.correct} / {sub.total} correct
                          </span>
                        </div>
                        <div className="progress" style={{ height: '6px', backgroundColor: 'var(--bg-primary)' }}>
                          <div
                            className="progress-bar bg-success"
                            role="progressbar"
                            style={{ width: `${(sub.correct / sub.total) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-start mt-5 p-4 rounded" style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                <h6 className="fw-semibold text-danger mb-2">⚠️ Careless Error Audits</h6>
                <p className="small text-secondary mb-0" style={{ lineHeight: '1.6' }}>
                  Mock tests have connected any incorrect answers directly to your <strong>Mistake Book</strong> for active retention review. Verify explanations soon to minimize repeated errors in Polity & History concepts.
                </p>
              </div>

              <div className="mt-5">
                <button className="btn-primary-custom py-2.5 px-5" onClick={() => setTestMode('select')}>
                  Return to Dashboard Deck
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MockTestRoom;
