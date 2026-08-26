import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar.jsx';
import { submitAnswerToEvaluator, getMainsHistory } from '../services/mainsService.js';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const MainsWriter = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeReport, setActiveReport] = useState(null);

  // Question Fields Config
  const [questionText, setQuestionText] = useState('');
  const [questionMeta, setQuestionMeta] = useState({
    questionYear: 2024,
    questionPaper: 'GS-II',
    questionSubject: 'Indian Polity & Governance',
    questionTopic: 'Federalism & Division of Powers',
    questionMarks: 15,
    questionWordLimit: 250,
    questionDirective: 'Critically Analyze'
  });

  const [answerText, setAnswerText] = useState('');
  
  // Stopwatch
  const [time, setTime] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  useEffect(() => {
    loadHistory();
    // Load draft if saved
    const savedDraft = localStorage.getItem('mains_draft_answer');
    const savedQuestion = localStorage.getItem('mains_draft_question');
    if (savedDraft) setAnswerText(savedDraft);
    if (savedQuestion) setQuestionText(savedQuestion);
  }, []);

  useEffect(() => {
    let interval = null;
    if (isTimerActive) {
      interval = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerActive]);

  const loadHistory = async () => {
    setLoading(true);
    const list = await getMainsHistory();
    setHistory(list || []);
    if (list && list.length > 0) {
      setActiveReport(list[0]);
    }
    setLoading(false);
  };

  const handleStartTimer = () => setIsTimerActive(true);
  const handlePauseTimer = () => setIsTimerActive(false);
  const handleResetTimer = () => {
    setIsTimerActive(false);
    setTime(0);
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  const handleSaveDraft = () => {
    localStorage.setItem('mains_draft_answer', answerText);
    localStorage.setItem('mains_draft_question', questionText);
    alert('Response draft saved locally.');
  };

  const handleEvaluate = async (e) => {
    e.preventDefault();
    if (!questionText || !answerText) {
      alert('Please fill in both the UPSC Question and your Answer.');
      return;
    }

    setSubmitting(true);
    setIsTimerActive(false);
    try {
      const evaluation = await submitAnswerToEvaluator(questionText, null, answerText, questionMeta);
      setActiveReport(evaluation);
      localStorage.removeItem('mains_draft_answer');
      localStorage.removeItem('mains_draft_question');
      await loadHistory();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const wordCount = answerText.trim() === '' ? 0 : answerText.trim().split(/\s+/).length;

  const sampleQuestionsPreset = [
    {
      question: 'Analyze the unitary characteristics of the Indian federal structure that make it unitary in character.',
      meta: { questionYear: 2023, questionPaper: 'GS-II', questionSubject: 'Indian Polity & Governance', questionTopic: 'Federalism', questionMarks: 15, questionWordLimit: 250, questionDirective: 'Analyze' }
    },
    {
      question: 'Examine the impact of inflation on inclusive economic growth indices within the Indian banking ecosystem.',
      meta: { questionYear: 2022, questionPaper: 'GS-III', questionSubject: 'Economic Development', questionTopic: 'Inflation & GDP', questionMarks: 10, questionWordLimit: 150, questionDirective: 'Examine' }
    },
    {
      question: 'Discuss the ethical challenges of deploying artificial intelligence engines within public governance systems.',
      meta: { questionYear: 2024, questionPaper: 'GS-IV', questionSubject: 'Ethics, Integrity & Aptitude', questionTopic: 'Ethics in Governance', questionMarks: 10, questionWordLimit: 150, questionDirective: 'Discuss' }
    }
  ];

  const handleSelectPreset = (item) => {
    setQuestionText(item.question);
    setQuestionMeta(item.meta);
  };

  // Recharts chart data mapping
  const chartData = [...history]
    .reverse()
    .map((item, idx) => ({
      name: `Attempt ${idx + 1}`,
      score: item.evaluation?.score || 0
    }));

  if (loading) {
    return (
      <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Navbar />
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem', color: 'var(--accent-primary)' }}>
            <span className="visually-hidden">Loading Mains Portal...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="container-fluid px-4 py-4 flex-grow-1" style={{ maxWidth: '1250px' }}>
        
        <div className="mb-4">
          <h2 className="gradient-text fw-bold mb-0">Mains Answer Writing Console</h2>
          <p className="text-secondary small">Submit subjective answers to verify structure, facts, and commission benchmarks</p>
        </div>

        <div className="row g-4">
          {/* LEFT: Answer Editor workspace */}
          <div className="col-12 col-lg-7">
            <div className="custom-card glass-panel p-4 mb-4">
              <h5 className="mb-3 fw-semibold text-secondary">Writing Workspace</h5>

              {/* Sample presets helper */}
              <div className="mb-4">
                <span className="small text-muted d-block mb-2">Preset UPSC Questions (Click to select):</span>
                <div className="d-flex flex-column gap-2">
                  {sampleQuestionsPreset.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="text-start p-2.5 rounded border small text-secondary bg-transparent hover-card text-decoration-none"
                      style={{ cursor: 'pointer', borderColor: 'var(--border-color)', transition: 'all 0.15s' }}
                      onClick={() => handleSelectPreset(item)}
                    >
                      📘 <strong className="text-indigo">[{item.meta.questionPaper} {item.meta.questionYear}]</strong> "{item.question}"
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleEvaluate}>
                {/* Question Details Input */}
                <div className="mb-3">
                  <label className="form-label small text-secondary">Mains Question Description</label>
                  <textarea
                    className="form-control-custom"
                    rows="3"
                    placeholder="Enter the subjective UPSC question details..."
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    required
                  />
                </div>

                {/* Metadata Fields Panel */}
                <div className="row g-2 mb-3">
                  <div className="col-4 col-md-2">
                    <label className="form-label small text-secondary" style={{ fontSize: '0.65rem' }}>Year</label>
                    <input
                      type="number"
                      className="form-control-custom py-1 px-2.5 small"
                      value={questionMeta.questionYear}
                      onChange={(e) => setQuestionMeta(prev => ({ ...prev, questionYear: parseInt(e.target.value, 10) }))}
                    />
                  </div>
                  <div className="col-4 col-md-2">
                    <label className="form-label small text-secondary" style={{ fontSize: '0.65rem' }}>Paper</label>
                    <input
                      type="text"
                      className="form-control-custom py-1 px-2.5 small"
                      value={questionMeta.questionPaper}
                      onChange={(e) => setQuestionMeta(prev => ({ ...prev, questionPaper: e.target.value }))}
                    />
                  </div>
                  <div className="col-4 col-md-3">
                    <label className="form-label small text-secondary" style={{ fontSize: '0.65rem' }}>Subject</label>
                    <input
                      type="text"
                      className="form-control-custom py-1 px-2.5 small"
                      value={questionMeta.questionSubject}
                      onChange={(e) => setQuestionMeta(prev => ({ ...prev, questionSubject: e.target.value }))}
                    />
                  </div>
                  <div className="col-4 col-md-2">
                    <label className="form-label small text-secondary" style={{ fontSize: '0.65rem' }}>Marks</label>
                    <input
                      type="number"
                      className="form-control-custom py-1 px-2.5 small"
                      value={questionMeta.questionMarks}
                      onChange={(e) => setQuestionMeta(prev => ({ ...prev, questionMarks: parseInt(e.target.value, 10) }))}
                    />
                  </div>
                  <div className="col-8 col-md-3">
                    <label className="form-label small text-secondary" style={{ fontSize: '0.65rem' }}>Directive</label>
                    <input
                      type="text"
                      className="form-control-custom py-1 px-2.5 small"
                      value={questionMeta.questionDirective}
                      onChange={(e) => setQuestionMeta(prev => ({ ...prev, questionDirective: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Focus Timer */}
                <div className="d-flex justify-content-between align-items-center mb-3 p-3 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <div className="d-flex align-items-center gap-3">
                    <span className="fw-mono fs-5 text-indigo font-bold" style={{ color: 'var(--accent-primary)' }}>
                      {formatTime(time)}
                    </span>
                    <span className="small text-muted">Time Elapsed</span>
                  </div>
                  
                  <div className="d-flex gap-2">
                    {!isTimerActive ? (
                      <button type="button" className="btn btn-sm btn-primary-custom py-1 px-3" onClick={handleStartTimer}>
                        Start Timer
                      </button>
                    ) : (
                      <button type="button" className="btn btn-sm btn-secondary-custom py-1 px-3" onClick={handlePauseTimer}>
                        Pause
                      </button>
                    )}
                    <button type="button" className="btn btn-sm text-secondary bg-transparent border-0 small" onClick={handleResetTimer}>
                      Reset
                    </button>
                  </div>
                </div>

                {/* Editor Textarea */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label small text-secondary mb-0">Write Answer</label>
                    <span className="small text-muted">{wordCount} / {questionMeta.questionWordLimit} words limit</span>
                  </div>
                  
                  {/* Word limit progress bar */}
                  <div className="progress mb-2" style={{ height: '4px', backgroundColor: 'var(--bg-primary)' }}>
                    <div
                      className="progress-bar bg-success"
                      role="progressbar"
                      style={{ width: `${Math.min(100, (wordCount / questionMeta.questionWordLimit) * 100)}%` }}
                    ></div>
                  </div>

                  <textarea
                    className="form-control-custom"
                    rows="14"
                    placeholder="Provide introduction -> body mapping case studies -> way forward recommendation structure..."
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    required
                  />
                </div>

                <div className="d-flex gap-3">
                  <button type="button" className="btn btn-secondary-custom py-2.5 px-4" onClick={handleSaveDraft}>
                    Save Draft
                  </button>
                  <button type="submit" className="btn-primary-custom py-2.5 flex-grow-1" disabled={submitting}>
                    {submitting ? 'Submitting to AI Evaluator...' : 'Evaluate Answer'}
                  </button>
                </div>
              </form>
            </div>

            {/* Score Trend Chart */}
            {history.length > 1 && (
              <div className="custom-card glass-panel p-4 mb-4">
                <h5 className="mb-4 fw-semibold text-secondary">Mains Score Trend</h5>
                <div style={{ width: '100%', height: 200 }}>
                  <ResponsiveContainer>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                      <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
                      <YAxis stroke="var(--text-muted)" domain={[0, 10]} fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }} />
                      <Line type="monotone" dataKey="score" stroke="var(--accent-primary)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: AI Examiner Evaluation scorecard */}
          <div className="col-12 col-lg-5">
            {activeReport ? (
              <div className="custom-card glass-panel p-4 mb-4" style={{ borderColor: 'rgba(99,102,241,0.3)' }}>
                {/* Advisory Label */}
                <div className="p-3.5 rounded mb-4 text-start small text-warning border" style={{ backgroundColor: 'rgba(245,158,11,0.05)', borderColor: 'rgba(245,158,11,0.2)' }}>
                  ⚠️ <strong>PrepPilot AI Feedback Label</strong>: feedback is advisory and is not equivalent to official UPSC exam evaluations.
                </div>

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold mb-0 text-secondary">AI Evaluation scorecard</h5>
                  <div className="d-flex align-items-baseline gap-1">
                    <span className="fs-2 fw-bold text-success" style={{ color: 'var(--accent-success)' }}>{activeReport.evaluation?.score}</span>
                    <span className="text-muted small">/10 marks</span>
                  </div>
                </div>

                {/* Scores breakdown */}
                <div className="mb-4 border-bottom pb-4" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="mb-2.5">
                    <div className="d-flex justify-content-between small text-secondary mb-1">
                      <span>Introduction</span>
                      <strong>{activeReport.evaluation?.introScore}/10</strong>
                    </div>
                    <div className="progress" style={{ height: '4px', backgroundColor: 'var(--bg-primary)' }}>
                      <div className="progress-bar bg-info" role="progressbar" style={{ width: `${(activeReport.evaluation?.introScore || 0) * 10}%` }}></div>
                    </div>
                  </div>
                  <div className="mb-2.5">
                    <div className="d-flex justify-content-between small text-secondary mb-1">
                      <span>Body Arguments</span>
                      <strong>{activeReport.evaluation?.bodyScore}/10</strong>
                    </div>
                    <div className="progress" style={{ height: '4px', backgroundColor: 'var(--bg-primary)' }}>
                      <div className="progress-bar bg-primary" role="progressbar" style={{ width: `${(activeReport.evaluation?.bodyScore || 0) * 10}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="d-flex justify-content-between small text-secondary mb-1">
                      <span>Conclusion & Way Forward</span>
                      <strong>{activeReport.evaluation?.conclusionScore}/10</strong>
                    </div>
                    <div className="progress" style={{ height: '4px', backgroundColor: 'var(--bg-primary)' }}>
                      <div className="progress-bar bg-success" role="progressbar" style={{ width: `${(activeReport.evaluation?.conclusionScore || 0) * 10}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="row g-3 mb-4">
                  <div className="col-12 col-md-6">
                    <h6 className="fw-bold text-success small mb-2">Strengths</h6>
                    <ul className="ps-3 mb-0 small text-secondary d-flex flex-column gap-1">
                      {activeReport.evaluation?.strengths?.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="col-12 col-md-6">
                    <h6 className="fw-bold text-danger small mb-2">Weaknesses</h6>
                    <ul className="ps-3 mb-0 small text-secondary d-flex flex-column gap-1">
                      {activeReport.evaluation?.weaknesses?.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Missing dimensions */}
                {activeReport.evaluation?.missingDimensions?.length > 0 && (
                  <div className="mb-4">
                    <h6 className="fw-bold text-warning small mb-2">Missing Dimensions</h6>
                    <ul className="ps-3 mb-0 small text-secondary d-flex flex-column gap-1">
                      {activeReport.evaluation?.missingDimensions?.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Structural outline feedback */}
                <div className="p-3 rounded mb-4" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                  <h6 className="fw-bold text-secondary small mb-1">Ideal Answer Structure:</h6>
                  <p className="small text-secondary mb-3" style={{ fontSize: '0.75rem', lineHeight: '1.5' }}>{activeReport.evaluation?.idealStructure}</p>

                  <h6 className="fw-bold text-secondary small mb-1">Model Answer Outline:</h6>
                  <p className="small text-secondary mb-0" style={{ fontSize: '0.75rem', lineHeight: '1.5' }}>{activeReport.evaluation?.modelAnswerOutline}</p>
                </div>

                {/* Suggested Examples */}
                {activeReport.evaluation?.suggestedExamples?.length > 0 && (
                  <div className="mb-4">
                    <h6 className="fw-bold text-secondary small mb-2">Suggested Examples / Case Laws:</h6>
                    <div className="d-flex flex-wrap gap-1.5">
                      {activeReport.evaluation?.suggestedExamples?.map((item, idx) => (
                        <span key={idx} className="badge bg-secondary-subtle text-secondary border small px-2 py-1">{item}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Conclusion */}
                {activeReport.evaluation?.suggestedConclusion && (
                  <div className="mb-4">
                    <h6 className="fw-bold text-secondary small mb-1.5">Suggested Conclusion / Way Forward:</h6>
                    <p className="small text-muted italic mb-0" style={{ fontSize: '0.75rem', lineHeight: '1.5' }}>"{activeReport.evaluation?.suggestedConclusion}"</p>
                  </div>
                )}

                {/* Overall evaluations comments */}
                <div className="mb-3">
                  <h6 className="fw-semibold text-secondary small mb-1">Examiner Content Feedback:</h6>
                  <p className="small text-secondary mb-0" style={{ lineHeight: '1.5' }}>{activeReport.evaluation?.contentFeedback}</p>
                </div>
              </div>
            ) : (
              <div className="custom-card glass-panel p-4 mb-4 text-center text-muted small">
                Submit an answer on the left to see your AI scorecard metrics.
              </div>
            )}

            {/* Answer History list */}
            <div className="custom-card glass-panel p-4">
              <h5 className="mb-4 fw-semibold text-secondary">Submission History</h5>
              {history.length === 0 ? (
                <div className="text-center py-4 text-muted small">
                  No previous answer submissions found. Draft your first UPSC Mains answer!
                </div>
              ) : (
                <div className="d-flex flex-column gap-3" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                  {history.map(item => (
                    <div
                      key={item._id}
                      className="p-3 rounded border"
                      style={{ cursor: 'pointer', backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', transition: 'all 0.2s ease' }}
                      onClick={() => setActiveReport(item)}
                    >
                      <h6 className="small fw-semibold text-primary mb-2 text-truncate" style={{ color: 'var(--text-primary)' }}>
                        "{item.questionText}"
                      </h6>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="small text-muted">
                          Score: <strong className="text-success">{item.evaluation?.score}</strong>/10
                        </span>
                        <span className="small text-muted" style={{ fontSize: '0.75rem' }}>
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MainsWriter;
