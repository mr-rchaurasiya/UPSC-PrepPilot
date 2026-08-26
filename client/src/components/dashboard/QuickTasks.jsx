import React, { useState } from 'react';
import { toggleTaskStatusItem, deleteTaskItem } from '../../services/taskService.js';

export const QuickTasks = ({ tasks: initialTasks }) => {
  const [tasks, setTasks] = useState(initialTasks || []);
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [reschedulingId, setReschedulingId] = useState(null);
  const [newDate, setNewDate] = useState('');

  const handleToggle = async (taskId) => {
    try {
      const updated = await toggleTaskStatusItem(taskId);
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: updated.status } : t));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTaskItem(taskId);
      setTasks(prev => prev.filter(t => t._id !== taskId));
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (task) => {
    setEditingId(task._id);
    setEditingTitle(task.title);
  };

  const saveEdit = async (taskId) => {
    if (!editingTitle.trim()) return;
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, title: editingTitle } : t));
    setEditingId(null);
  };

  const handleReschedule = async (taskId) => {
    if (!newDate) return;
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, date: newDate } : t));
    setReschedulingId(null);
  };

  return (
    <div className="custom-card glass-panel h-100">
      <h5 className="mb-4 fw-semibold text-secondary">Today's Plan</h5>
      
      {tasks.length === 0 ? (
        <div className="text-center py-4 text-muted small">
          No tasks scheduled for today. Create study tasks in the planner page!
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {tasks.map(task => (
            <div key={task._id} className="p-3 rounded border" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}>
              <div className="d-flex align-items-start justify-content-between gap-2">
                
                {/* Completion Checkbox */}
                <div className="d-flex align-items-start gap-2 flex-grow-1">
                  <input
                    type="checkbox"
                    className="form-check-input mt-1"
                    checked={task.status === 'completed'}
                    onChange={() => handleToggle(task._id)}
                    style={{ cursor: 'pointer', width: '1.15rem', height: '1.15rem' }}
                  />
                  
                  <div className="w-100">
                    {editingId === task._id ? (
                      <div className="d-flex gap-2">
                        <input
                          type="text"
                          className="form-control-custom py-0.5 px-2 small"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                        />
                        <button className="btn btn-sm btn-primary-custom py-0.5 px-2" onClick={() => saveEdit(task._id)}>
                          Save
                        </button>
                      </div>
                    ) : (
                      <span className={`small d-block fw-semibold ${task.status === 'completed' ? 'text-muted text-decoration-line-through' : ''}`} style={{ color: task.status === 'completed' ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                        {task.title}
                      </span>
                    )}

                    {/* Metadata tags */}
                    <div className="d-flex gap-1.5 flex-wrap mt-2" style={{ fontSize: '0.7rem' }}>
                      <span className="badge bg-secondary-subtle text-secondary border px-1.5 py-0.5">
                        {task.type === 'weekly_goal' ? 'Weekly' : 'Daily'}
                      </span>
                      {task.durationMinutes > 0 && (
                        <span className="badge bg-secondary-subtle text-secondary border px-1.5 py-0.5">
                          {task.durationMinutes} mins
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions Panel */}
                <div className="d-flex gap-1">
                  <button className="btn btn-sm text-secondary p-0.5 bg-transparent border-0 small" onClick={() => startEdit(task)}>
                    ✏️
                  </button>
                  <button className="btn btn-sm text-danger p-0.5 bg-transparent border-0 small" onClick={() => handleDelete(task._id)}>
                    🗑️
                  </button>
                  <button className="btn btn-sm text-info p-0.5 bg-transparent border-0 small" onClick={() => setReschedulingId(task._id)}>
                    📅
                  </button>
                </div>
              </div>

              {/* Reschedule inline popover */}
              {reschedulingId === task._id && (
                <div className="mt-2.5 pt-2 border-top d-flex gap-2 align-items-center" style={{ borderColor: 'var(--border-color)' }}>
                  <input
                    type="date"
                    className="form-control-custom py-0.5 px-2 small"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                  />
                  <button className="btn btn-sm btn-primary-custom py-0.5 px-2.5" onClick={() => handleReschedule(task._id)}>
                    Go
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuickTasks;
