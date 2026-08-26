import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar.jsx';
import { getSyllabusList } from '../services/syllabusService.js';
import { getTasksList } from '../services/taskService.js';
import { logStudySessionTime } from '../services/timerService.js';

export const StudyTimer = () => {
  const [topics, setTopics] = useState([]);
  const [tasks, setTasks] = useState([]);
  
  // Timer Setup Configuration
  const [timerMode, setTimerMode] = useState('25'); // '25', '50', '90', 'custom'
  const [customMinutes, setCustomMinutes] = useState('30');
  const [selectedSubject, setSelectedSubject] = useState('Indian Polity & Governance');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedTask, setSelectedTask] = useState('');
  const [notes, setNotes] = useState('');

  // Active Timer Workspace
  const [isFocusActive, setIsFocusActive] = useState(false); // 'setup' vs 'active'
  const [secondsLeft, setSecondsLeft] = useState(1500); // 25 mins initial
  const [plannedSeconds, setPlannedSeconds] = useState(1500);
  const [timerRunning, setTimerRunning] = useState(false);

  const [loading, setLoading] = useState(true);
  const [logging, setLogging] = useState(false);
  const [logSuccess, setLogSuccess] = useState(false);
  const [streakCount, setStreakCount] = useState(5);

  useEffect(() => {
    loadSetupData();
  }, []);

  const loadSetupData = async () => {
    setLoading(true);
    try {
      const topicList = await getSyllabusList();
      setTopics(topicList || []);
      const taskList = await getTasksList();
      setTasks(taskList?.filter(t => t.status === 'pending') || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Timer interval decrements
  useEffect(() => {
    let interval = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setTimerRunning(false);
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const handleStartZenFocus = () => {
    let minutes = 25;
    if (timerMode === '50') minutes = 50;
    else if (timerMode === '90') minutes = 90;
    else if (timerMode === 'custom') minutes = parseInt(customMinutes, 10) || 30;

    const totalSecs = minutes * 60;
    setSecondsLeft(totalSecs);
    setPlannedSeconds(totalSecs);
    setTimerRunning(true);
    setIsFocusActive(true);
    setLogSuccess(false);
  };

  const handlePauseResume = () => {
    setTimerRunning(!timerRunning);
  };

  const handleSessionComplete = async () => {
    setLogging(true);
    try {
      const actualMinutes = Math.round(plannedSeconds / 60);
      const res = await logStudySessionTime({
        durationMinutes: actualMinutes,
        plannedDurationMinutes: actualMinutes,
        topicId: selectedTopic || null,
        subject: selectedSubject,
        taskId: selectedTask || null,
        status: 'completed',
        notes: notes || 'Completed deep focus pomodoro block'
      });
      if (res?.success) {
        setStreakCount(res.streak || streakCount);
        setLogSuccess(true);
      }
      setIsFocusActive(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLogging(false);
    }
  };

  const handleStopLogEarly = async () => {
    if (!window.confirm('Stop focus session and log elapsed duration?')) return;
    setTimerRunning(false);
    setLogging(true);

    const elapsedSeconds = plannedSeconds - secondsLeft;
    const actualMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
    const plannedMinutes = Math.round(plannedSeconds / 60);

    try {
      const res = await logStudySessionTime({
        durationMinutes: actualMinutes,
        plannedDurationMinutes: plannedMinutes,
        topicId: selectedTopic || null,
        subject: selectedSubject,
        taskId: selectedTask || null,
        status: 'partial',
        notes: notes || 'Partial study block focus'
      });
      if (res?.success) {
        setStreakCount(res.streak || streakCount);
        setLogSuccess(true);
      }
      setIsFocusActive(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLogging(false);
    }
  };

  const formatTimeText = (totalSecs) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Navbar />
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem', color: 'var(--accent-primary)' }}>
            <span className="visually-hidden">Loading Focus Room...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="container px-4 py-4 flex-grow-1 d-flex flex-column justify-content-center" style={{ maxWidth: '650px' }}>
        
        <div className="text-center mb-4">
          <h2 className="gradient-text fw-bold mb-0">Zen Focus Chamber</h2>
          <p className="text-secondary small">Activate deep pomodoro timers, tag syllabus milestones, and track consistency streaks</p>
        </div>

        {/* STUDY TIMER WORKSPACE */}
        {isFocusActive ? (
          <div className="custom-card glass-panel p-5 text-center animate-fade-in">
            <span className="badge bg-danger-subtle text-danger border small mb-3">Distraction-Free Focus Active</span>
            
            {/* Countdown clock */}
            <div className="d-flex align-items-center justify-content-center mb-5">
              <div
                className="d-flex flex-column align-items-center justify-content-center rounded-circle border border-5 p-5"
                style={{
                  width: '260px',
                  height: '260px',
                  borderColor: timerRunning ? 'var(--accent-primary)' : 'var(--border-color)',
                  backgroundColor: 'var(--bg-secondary)',
                  boxShadow: timerRunning ? '0 0 15px rgba(99, 102, 241, 0.1)' : 'none',
                  transition: 'all 0.4s ease'
                }}
              >
                <h1 className="fw-mono fw-bold text-light mb-1" style={{ fontSize: '3rem' }}>
                  {formatTimeText(secondsLeft)}
                </h1>
                <span className="text-muted small text-uppercase tracking-wider">
                  {timerRunning ? 'Focusing...' : 'Paused'}
                </span>
              </div>
            </div>

            {/* Configured context summary */}
            <div className="p-3.5 rounded mb-4 text-start small border" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}>
              <div className="mb-2"><strong>Subject:</strong> <span className="text-secondary">{selectedSubject}</span></div>
              {selectedTopic && (
                <div className="mb-2"><strong>Topic:</strong> <span className="text-secondary">{topics.find(t => t._id === selectedTopic)?.title}</span></div>
              )}
              {selectedTask && (
                <div className="mb-0"><strong>Task Goal:</strong> <span className="text-secondary">{tasks.find(t => t._id === selectedTask)?.title}</span></div>
              )}
            </div>

            {/* Timer Actions */}
            <div className="d-flex justify-content-center gap-3">
              <button className="btn-primary-custom py-2 px-5" onClick={handlePauseResume}>
                {timerRunning ? 'Pause Session' : 'Resume'}
              </button>
              <button className="btn btn-secondary-custom py-2 px-4 border text-danger" style={{ borderColor: 'rgba(239,68,68,0.2)' }} onClick={handleStopLogEarly} disabled={logging}>
                {logging ? 'Logging...' : 'Stop Focus'}
              </button>
            </div>
          </div>
        ) : (
          /* SETUP TIMERS CONFIGURATION */
          <div className="custom-card glass-panel p-4 p-md-5 animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2 pb-2 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
              <h5 className="fw-semibold text-secondary mb-0">Focus Timer Setup</h5>
              <span className="badge bg-success-subtle text-success border px-2.5 py-1">🔥 Study Streak: {streakCount} Days</span>
            </div>

            {/* Timer Modes select buttons */}
            <div className="mb-4">
              <label className="form-label small text-secondary d-block">Timer Duration Mode</label>
              <div className="row g-2">
                {[
                  { id: '25', label: '25 min (Pomodoro)' },
                  { id: '50', label: '50 min' },
                  { id: '90', label: '90 min' },
                  { id: 'custom', label: 'Custom limit' }
                ].map(mode => (
                  <div key={mode.id} className="col-6 col-sm-3">
                    <button
                      type="button"
                      className={`btn w-100 ${timerMode === mode.id ? 'btn-primary-custom' : 'btn-secondary-custom'} py-2 text-center small`}
                      onClick={() => setTimerMode(mode.id)}
                    >
                      {mode.label}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Minutes Input */}
            {timerMode === 'custom' && (
              <div className="mb-4 animate-fade-in">
                <label className="form-label small text-secondary">Set Custom Study Minutes</label>
                <input
                  type="number"
                  className="form-control-custom"
                  placeholder="Enter minutes (e.g. 45)..."
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                />
              </div>
            )}

            {/* Subject Select */}
            <div className="mb-3">
              <label className="form-label small text-secondary">Subject Domain</label>
              <select
                className="form-control-custom form-select"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="Indian Polity & Governance">Indian Polity & Governance</option>
                <option value="Modern Indian History & Culture">Modern Indian History & Culture</option>
                <option value="Economic Development">Economic Development</option>
                <option value="Ethics, Integrity & Aptitude">Ethics, Integrity & Aptitude</option>
                <option value="CSAT Aptitude">CSAT Aptitude</option>
              </select>
            </div>

            {/* Syllabus Topic select */}
            <div className="mb-3">
              <label className="form-label small text-secondary">Tag Syllabus Topic (Optional)</label>
              <select
                className="form-control-custom form-select"
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
              >
                <option value="">General Study Session</option>
                {topics.map(t => (
                  <option key={t._id} value={t._id}>[{t.code}] {t.title}</option>
                ))}
              </select>
            </div>

            {/* Task Checklist select */}
            {tasks.length > 0 && (
              <div className="mb-3">
                <label className="form-label small text-secondary">Connect Calendar Checklist Task (Optional)</label>
                <select
                  className="form-control-custom form-select"
                  value={selectedTask}
                  onChange={(e) => setSelectedTask(e.target.value)}
                >
                  <option value="">No linked checklist task</option>
                  {tasks.map(t => (
                    <option key={t._id} value={t._id}>[{t.type.replace('_', ' ')}] {t.title}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Focus Notes */}
            <div className="mb-4">
              <label className="form-label small text-secondary">Focus Notes / Session Goal</label>
              <input
                type="text"
                className="form-control-custom"
                placeholder="e.g. Reading governor discretions chapter"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <button className="btn-primary-custom w-100 py-2.5" onClick={handleStartZenFocus}>
              ⚡ Activate Zen Focus
            </button>

            {logSuccess && (
              <div className="text-success text-center small fw-semibold mt-3">
                ✓ Study focus session logged successfully to dashboard analytics!
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default StudyTimer;
