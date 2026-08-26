import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar.jsx';
import { 
  getTasksList, 
  createNewTask, 
  toggleTaskStatusItem, 
  deleteTaskItem, 
  updateTaskItem, 
  generateStudyPlanAI, 
  acceptStudyPlanAI 
} from '../services/taskService.js';

export const PlannerRoom = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [title, setTitle] = useState('');
  const [type, setType] = useState('daily_task');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [adding, setAdding] = useState(false);

  const [availableHours, setAvailableHours] = useState(6);
  const [generating, setGenerating] = useState(false);
  const [previewPlan, setPreviewPlan] = useState(null);

  const [filterType, setFilterType] = useState('all');

  const [editingId, setEditingId] = useState(null);
  const [editFields, setEditFields] = useState({ title: '', date: '', durationMinutes: 0, actualDurationMinutes: 0 });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    const list = await getTasksList();
    setTasks(list || []);
    setLoading(false);
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title) return;

    setAdding(true);
    try {
      const added = await createNewTask({
        title,
        type,
        date: new Date(date).toISOString(),
        durationMinutes: 120
      });
      setTasks(prev => [...prev, added]);
      setTitle('');
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (taskId) => {
    try {
      const updated = await toggleTaskStatusItem(taskId);
      setTasks(prev => prev.map(t => t._id === taskId ? updated : t));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSkip = async (taskId) => {
    try {
      const updated = await updateTaskItem(taskId, { status: 'skipped' });
      setTasks(prev => prev.map(t => t._id === taskId ? updated : t));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this target?')) return;
    try {
      await deleteTaskItem(taskId);
      setTasks(prev => prev.filter(t => t._id !== taskId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartEdit = (task) => {
    setEditingId(task._id);
    setEditFields({
      title: task.title,
      date: task.date ? task.date.split('T')[0] : '',
      durationMinutes: task.durationMinutes || 0,
      actualDurationMinutes: task.actualDurationMinutes || 0
    });
  };

  const handleSaveEdit = async (taskId) => {
    try {
      const updated = await updateTaskItem(taskId, {
        title: editFields.title,
        date: new Date(editFields.date).toISOString(),
        durationMinutes: editFields.durationMinutes,
        actualDurationMinutes: editFields.actualDurationMinutes
      });
      setTasks(prev => prev.map(t => t._id === taskId ? updated : t));
      setEditingId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAIGenerate = async () => {
    setGenerating(true);
    try {
      const plan = await generateStudyPlanAI(availableHours);
      setPreviewPlan(plan);
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const handleAcceptAIPlan = async () => {
    if (!previewPlan) return;
    setLoading(true);
    try {
      const dailyTasks = (previewPlan.dailyPlan || []).map(t => ({ ...t, type: 'daily_task' }));
      const weeklyTasks = (previewPlan.weeklyPlan || []).map(t => ({ ...t, type: 'weekly_goal' }));
      const monthlyTasks = (previewPlan.monthlyPlan || []).map(t => ({ ...t, type: 'monthly_goal' }));
      
      const allPlanTasks = [...dailyTasks, ...weeklyTasks, ...monthlyTasks];
      const saved = await acceptStudyPlanAI(allPlanTasks);
      
      setTasks(prev => [...prev, ...saved]);
      setPreviewPlan(null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filterType === 'all') return true;
    return t.type === filterType;
  });

  const totalPlannedHours = parseFloat((tasks.reduce((acc, t) => acc + (t.durationMinutes || 0), 0) / 60).toFixed(1));
  const totalActualHours = parseFloat((tasks.reduce((acc, t) => acc + (t.actualDurationMinutes || 0), 0) / 60).toFixed(1));

  if (loading) {
    return (
      <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Navbar />
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem', color: 'var(--accent-primary)' }}>
            <span className="visually-hidden">Loading Planner Room...</span>
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
          <h2 className="gradient-text fw-bold mb-0">UPSC Study Planner</h2>
          <p className="text-secondary small">Organize your daily study schedules and set long-term weekly goals</p>
        </div>

        {/* Planned vs Actual track panel */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-6">
            <div className="custom-card glass-panel p-3 d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Time Track Balance</span>
                <div className="mt-1 d-flex align-items-baseline gap-2">
                  <h3 className="fw-bold mb-0 text-success">{totalActualHours} hrs</h3>
                  <span className="text-muted small">actual / {totalPlannedHours} hrs planned</span>
                </div>
              </div>
              <span className="badge bg-secondary-subtle text-secondary small border">Track stats</span>
            </div>
          </div>

          {/* AI study hours input slider */}
          <div className="col-12 col-md-6">
            <div className="custom-card glass-panel p-3 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small fw-semibold text-uppercase">AI Availability (Hours/Day)</span>
                <span className="badge bg-indigo-subtle text-indigo border">{availableHours} hrs</span>
              </div>
              <div className="d-flex gap-3 align-items-center">
                <input
                  type="range"
                  className="form-range flex-grow-1"
                  min="4"
                  max="12"
                  value={availableHours}
                  onChange={(e) => setAvailableHours(parseInt(e.target.value, 10))}
                  style={{ accentColor: 'var(--accent-primary)' }}
                />
                <button className="btn btn-sm btn-primary-custom py-1.5 px-3 flex-shrink-0" onClick={handleAIGenerate} disabled={generating}>
                  {generating ? 'Generating...' : '⚡ Generate Plan'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* AI PREVIEW PANEL */}
        {previewPlan && (
          <div className="custom-card glass-panel p-4 mb-4 border-indigo" style={{ borderColor: 'var(--accent-primary)' }}>
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
              <div>
                <h5 className="fw-semibold text-primary mb-1">Generated Study Plan Preview</h5>
                <p className="text-secondary small mb-0">Review the AI recommendations adjusted to your daily available limit.</p>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-primary-custom py-1.5 px-4" onClick={handleAcceptAIPlan}>
                  ✓ Accept AI Plan
                </button>
                <button className="btn btn-sm btn-secondary-custom py-1.5 px-3" onClick={() => setPreviewPlan(null)}>
                  ✕ Discard Plan
                </button>
              </div>
            </div>

            <div className="row g-3">
              {/* Daily Preview */}
              <div className="col-12 col-lg-4">
                <h6 className="fw-bold text-secondary mb-3 pb-2 border-bottom">Daily Checklist</h6>
                <div className="d-flex flex-column gap-2">
                  {previewPlan.dailyPlan?.map((item, idx) => (
                    <div key={idx} className="p-3 rounded border" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <span className="badge bg-secondary-subtle text-secondary small border">{item.subject}</span>
                        <span className="badge bg-danger-subtle text-danger border small" style={{ fontSize: '0.65rem' }}>{item.priority}</span>
                      </div>
                      <h6 className="small fw-semibold text-secondary mb-1" style={{ color: 'var(--text-primary)' }}>{item.title}</h6>
                      <span className="d-block small text-muted mb-1.5" style={{ fontSize: '0.7rem' }}>Reason: {item.reason}</span>
                      <span className="small text-muted font-mono">{item.durationMinutes} mins planned</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Preview */}
              <div className="col-12 col-lg-4">
                <h6 className="fw-bold text-secondary mb-3 pb-2 border-bottom">Weekly Goals</h6>
                <div className="d-flex flex-column gap-2">
                  {previewPlan.weeklyPlan?.map((item, idx) => (
                    <div key={idx} className="p-3 rounded border" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}>
                      <span className="badge bg-secondary-subtle text-secondary small border mb-2">{item.subject}</span>
                      <h6 className="small fw-semibold text-secondary mb-1" style={{ color: 'var(--text-primary)' }}>{item.title}</h6>
                      <span className="small text-muted font-mono d-block">{item.durationMinutes} mins planned</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly Preview */}
              <div className="col-12 col-lg-4">
                <h6 className="fw-bold text-secondary mb-3 pb-2 border-bottom">Monthly Milestones</h6>
                <div className="d-flex flex-column gap-2">
                  {previewPlan.monthlyPlan?.map((item, idx) => (
                    <div key={idx} className="p-3 rounded border" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}>
                      <span className="badge bg-secondary-subtle text-secondary small border mb-2">{item.subject}</span>
                      <h6 className="small fw-semibold text-secondary mb-1" style={{ color: 'var(--text-primary)' }}>{item.title}</h6>
                      <span className="small text-muted font-mono d-block">{item.durationMinutes} mins planned</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="row g-4">
          <div className="col-12 col-md-4">
            <div className="custom-card glass-panel p-4">
              <h5 className="mb-3 fw-semibold text-secondary">Add New Target</h5>
              <form onSubmit={handleAddTask}>
                <div className="mb-3">
                  <label className="form-label small text-secondary">Target Description</label>
                  <input
                    type="text"
                    className="form-control-custom"
                    placeholder="e.g. Read history chapter 5"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small text-secondary">Target Type</label>
                  <select
                    className="form-control-custom form-select"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="daily_task">Daily Checklist Item</option>
                    <option value="weekly_goal">Weekly Target Goal</option>
                    <option value="monthly_goal">Monthly Milestone Goal</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="form-label small text-secondary">Target Date</label>
                  <input
                    type="date"
                    className="form-control-custom"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn-primary-custom w-100 py-2" disabled={adding}>
                  {adding ? (
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  ) : null}
                  Add Target
                </button>
              </form>
            </div>
          </div>

          <div className="col-12 col-md-8">
            <div className="custom-card glass-panel p-4 h-100">
              <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <h5 className="fw-semibold text-secondary mb-0">Study Targets Calendar</h5>
                
                <div className="btn-group btn-group-sm">
                  {['all', 'daily_task', 'weekly_goal', 'monthly_goal'].map(mode => (
                    <button
                      key={mode}
                      className={`btn ${filterType === mode ? 'btn-primary-custom' : 'btn-secondary-custom'} py-1 px-2.5`}
                      style={{ fontSize: '0.75rem' }}
                      onClick={() => setFilterType(mode)}
                    >
                      {mode === 'all' ? 'All' : mode === 'daily_task' ? 'Daily' : mode === 'weekly_goal' ? 'Weekly' : 'Monthly'}
                    </button>
                  ))}
                </div>
              </div>

              {filteredTasks.length === 0 ? (
                <div className="text-center py-5 text-muted small">
                  No targets scheduled in this category. Complete syllabus topics to auto-generate schedules!
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {filteredTasks.map(task => {
                    const isEditing = editingId === task._id;
                    return (
                      <div
                        key={task._id}
                        className="p-3.5 rounded border d-flex justify-content-between align-items-start gap-3 flex-wrap"
                        style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}
                      >
                        {isEditing ? (
                          <div className="d-flex flex-column gap-2 flex-grow-1">
                            <input
                              type="text"
                              className="form-control-custom py-1 px-2.5 small"
                              value={editFields.title}
                              onChange={(e) => setEditFields(prev => ({ ...prev, title: e.target.value }))}
                            />
                            <div className="d-flex gap-2">
                              <input
                                type="date"
                                className="form-control-custom py-1 px-2.5 small"
                                value={editFields.date}
                                onChange={(e) => setEditFields(prev => ({ ...prev, date: e.target.value }))}
                              />
                              <input
                                type="number"
                                className="form-control-custom py-1 px-2.5 small"
                                placeholder="Planned duration"
                                value={editFields.durationMinutes}
                                onChange={(e) => setEditFields(prev => ({ ...prev, durationMinutes: parseInt(e.target.value, 10) }))}
                              />
                              <input
                                type="number"
                                className="form-control-custom py-1 px-2.5 small"
                                placeholder="Actual duration"
                                value={editFields.actualDurationMinutes}
                                onChange={(e) => setEditFields(prev => ({ ...prev, actualDurationMinutes: parseInt(e.target.value, 10) }))}
                              />
                            </div>
                            <div className="d-flex gap-2.5 mt-2">
                              <button className="btn btn-sm btn-primary-custom py-1 px-3" onClick={() => handleSaveEdit(task._id)}>
                                Save
                              </button>
                              <button className="btn btn-sm btn-secondary-custom py-1 px-3" onClick={() => setEditingId(null)}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="d-flex align-items-start gap-3 flex-grow-1">
                            <input
                              type="checkbox"
                              className="form-check-input mt-1"
                              style={{ cursor: 'pointer', width: '1.2rem', height: '1.2rem' }}
                              checked={task.status === 'completed'}
                              onChange={() => handleToggle(task._id)}
                            />
                            <div>
                              <span
                                className={`small d-block fw-semibold ${task.status === 'completed' ? 'text-muted text-decoration-line-through' : ''}`}
                                style={{ color: task.status === 'completed' ? 'var(--text-muted)' : 'var(--text-primary)' }}
                              >
                                {task.title}
                              </span>
                              
                              <div className="d-flex gap-1.5 flex-wrap mt-2" style={{ fontSize: '0.7rem' }}>
                                <span className="badge bg-secondary-subtle text-secondary border px-1.5 py-0.5 text-capitalize">
                                  {task.type.replace('_', ' ')}
                                </span>
                                <span className="badge bg-secondary-subtle text-secondary border px-1.5 py-0.5">
                                  Date: {new Date(task.date).toLocaleDateString()}
                                </span>
                                <span className="badge bg-secondary-subtle text-secondary border px-1.5 py-0.5">
                                  Planned: {task.durationMinutes}m | Actual: {task.actualDurationMinutes}m
                                </span>
                                {task.status === 'skipped' && (
                                  <span className="badge bg-warning-subtle text-warning border px-1.5 py-0.5">
                                    Skipped
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {!isEditing && (
                          <div className="d-flex gap-2">
                            <button className="btn btn-sm text-secondary bg-transparent border-0 small" onClick={() => handleStartEdit(task)}>
                              ✏️
                            </button>
                            <button className="btn btn-sm text-warning bg-transparent border-0 small" onClick={() => handleSkip(task._id)}>
                              Skip
                            </button>
                            <button className="btn btn-sm text-danger bg-transparent border-0 small" onClick={() => handleDelete(task._id)}>
                              🗑️
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PlannerRoom;
