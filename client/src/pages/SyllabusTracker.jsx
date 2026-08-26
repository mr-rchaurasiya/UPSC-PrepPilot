import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar.jsx';
import { getSyllabusList, getSyllabusProgress, updateSyllabusProgress } from '../services/syllabusService.js';

export const SyllabusTracker = () => {
  const [topics, setTopics] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search, Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPaper, setSelectedPaper] = useState('All');
  const [sortBy, setSortBy] = useState('code');

  const [activeTopicId, setActiveTopicId] = useState(null);
  const [editState, setEditState] = useState({
    status: 'Not Started',
    confidence: 3,
    notes: '',
    nextRevisionDate: ''
  });
  
  const [savingId, setSavingId] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(null);

  const loadSyllabus = async () => {
    setLoading(true);
    const topicsList = await getSyllabusList();
    const progressList = await getSyllabusProgress();
    setTopics(topicsList);
    setProgress(progressList);
    setLoading(false);
  };

  useEffect(() => {
    loadSyllabus();
  }, []);

  const getTopicProgress = (topicId) => {
    const record = progress.find(p => p.topic === topicId);
    return record || { status: 'Not Started', confidence: 3, notes: '', nextRevisionDate: '' };
  };

  const handleEditClick = (topicId) => {
    if (activeTopicId === topicId) {
      setActiveTopicId(null);
      return;
    }
    const current = getTopicProgress(topicId);
    setEditState({
      status: current.status,
      confidence: current.confidence,
      notes: current.notes || '',
      nextRevisionDate: current.nextRevisionDate ? current.nextRevisionDate.split('T')[0] : ''
    });
    setActiveTopicId(topicId);
    setSaveSuccess(null);
  };

  const handleSave = async (topicId) => {
    setSavingId(topicId);
    try {
      const updated = await updateSyllabusProgress(topicId, editState);
      setProgress(prev => {
        const index = prev.findIndex(p => p.topic === topicId);
        if (index !== -1) {
          const updatedList = [...prev];
          updatedList[index] = updated;
          return updatedList;
        } else {
          return [...prev, updated];
        }
      });
      setSaveSuccess(topicId);
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingId(null);
    }
  };

  const markStatusQuick = async (topicId, statusVal, confidenceVal) => {
    setSavingId(topicId);
    try {
      const payload = {
        status: statusVal,
        confidence: confidenceVal !== undefined ? confidenceVal : getTopicProgress(topicId).confidence
      };
      const updated = await updateSyllabusProgress(topicId, payload);
      setProgress(prev => {
        const index = prev.findIndex(p => p.topic === topicId);
        if (index !== -1) {
          const updatedList = [...prev];
          updatedList[index] = updated;
          return updatedList;
        } else {
          return [...prev, updated];
        }
      });
      setSaveSuccess(topicId);
      setTimeout(() => setSaveSuccess(null), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingId(null);
    }
  };

  const papers = [
    'All',
    'Prelims GS',
    'CSAT',
    'Essay',
    'GS-I',
    'GS-II',
    'GS-III',
    'GS-IV',
    'Optional Paper I',
    'Optional Paper II'
  ];

  const matchesPaperFilter = (paperCode) => {
    if (selectedPaper === 'All') return true;
    if (selectedPaper === 'Prelims GS' && paperCode === 'GS1') return true;
    if (selectedPaper === 'CSAT' && paperCode === 'CSAT') return true;
    if (selectedPaper === 'Essay' && paperCode === 'Essay') return true;
    if (selectedPaper === 'GS-I' && paperCode === 'GS1') return true;
    if (selectedPaper === 'GS-II' && paperCode === 'GS2') return true;
    if (selectedPaper === 'GS-III' && paperCode === 'GS3') return true;
    if (selectedPaper === 'GS-IV' && paperCode === 'GS4') return true;
    if (selectedPaper === 'Optional Paper I' && paperCode === 'Optional1') return true;
    if (selectedPaper === 'Optional Paper II' && paperCode === 'Optional2') return true;
    return false;
  };

  const processedTopics = topics
    .filter(t => matchesPaperFilter(t.paper))
    .filter(t => {
      const q = searchQuery.toLowerCase();
      return t.title.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q) || t.code.toLowerCase().includes(q);
    });

  processedTopics.sort((a, b) => {
    const progA = getTopicProgress(a._id);
    const progB = getTopicProgress(b._id);
    
    if (sortBy === 'code') {
      return a.code.localeCompare(b.code);
    } else if (sortBy === 'confidence') {
      return progB.confidence - progA.confidence;
    } else if (sortBy === 'status') {
      return progA.status.localeCompare(progB.status);
    }
    return 0;
  });

  const totalTopicsCount = topics.length;
  const completedTopicsCount = progress.filter(p => p.status === 'Completed' || p.status === 'Revised').length;
  const weakTopicsCount = progress.filter(p => p.status === 'Weak' || p.confidence <= 2).length;
  const pendingTopicsCount = totalTopicsCount - completedTopicsCount;
  const revisedTopicsCount = progress.filter(p => p.status === 'Revised' || p.revisionCount > 0).length;
  const revisionPercentage = totalTopicsCount > 0 ? Math.round((revisedTopicsCount / totalTopicsCount) * 100) : 0;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
      case 'Revised':
      case 'Strong':
        return 'bg-success text-light';
      case 'Learning':
        return 'bg-warning text-dark';
      case 'Weak':
        return 'bg-danger text-light';
      default:
        return 'bg-secondary text-light';
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="container px-4 py-4 flex-grow-1" style={{ maxWidth: '1000px' }}>
        
        <div className="mb-4">
          <h2 className="gradient-text fw-bold mb-0">UPSC Syllabus Tracker</h2>
          <p className="text-secondary small">Deconstruct, map, and track your topic-wise syllabus readiness levels</p>
        </div>

        {/* Analytics Summary Panels */}
        <div className="row g-3 mb-4">
          {[
            { label: 'Total Topics', val: totalTopicsCount },
            { label: 'Completed', val: completedTopicsCount, color: 'var(--accent-success)' },
            { label: 'Pending', val: pendingTopicsCount },
            { label: 'Weak Topics', val: weakTopicsCount, color: 'var(--accent-danger)' },
            { label: 'Revision Rate', val: `${revisionPercentage}%` }
          ].map((item, idx) => (
            <div key={idx} className="col-6 col-md col-lg flex-grow-1">
              <div className="custom-card glass-panel p-3 text-center">
                <span className="text-muted small fw-semibold text-uppercase d-block" style={{ fontSize: '0.65rem' }}>{item.label}</span>
                <h4 className="fw-bold mt-1 mb-0" style={{ color: item.color || 'var(--text-primary)' }}>{item.val}</h4>
              </div>
            </div>
          ))}
        </div>

        {/* Search, Filter & Sort Bar */}
        <div className="custom-card glass-panel p-4 mb-4">
          <div className="row g-3">
            <div className="col-12 col-md-5">
              <label className="form-label small text-secondary">Search Syllabus</label>
              <input
                type="text"
                className="form-control-custom"
                placeholder="Search topic title, code, or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="col-6 col-md-4">
              <label className="form-label small text-secondary">Sort Order</label>
              <select
                className="form-control-custom form-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="code">Hierarchy (Syllabus Code)</option>
                <option value="confidence">Confidence Rating (High to Low)</option>
                <option value="status">Preparation Status</option>
              </select>
            </div>
            <div className="col-6 col-md-3 d-flex align-items-end">
              <button className="btn btn-secondary-custom w-100 py-2 btn-sm h-100" onClick={() => { setSearchQuery(''); setSelectedPaper('All'); }}>
                Clear Search
              </button>
            </div>
          </div>
        </div>

        {/* Paper Filter Tabs */}
        <div className="d-flex flex-wrap gap-2 mb-4">
          {papers.map(p => (
            <button
              key={p}
              className={`btn btn-sm ${selectedPaper === p ? 'btn-primary-custom' : 'btn-secondary-custom'} py-1 px-3`}
              style={{ fontSize: '0.75rem' }}
              onClick={() => {
                setSelectedPaper(p);
                setActiveTopicId(null);
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Syllabus collapsible tree */}
        <div className="d-flex flex-column gap-3">
          {processedTopics.length === 0 ? (
            <div className="custom-card glass-panel p-5 text-center text-muted small">
              No syllabus topics matched your query. Make sure data seed files are active.
            </div>
          ) : (
            processedTopics.map(topic => {
              const current = getTopicProgress(topic._id);
              const isActive = activeTopicId === topic._id;

              return (
                <div key={topic._id} className="custom-card glass-panel p-3" style={{ borderLeft: isActive ? '3px solid var(--accent-primary)' : '1px solid var(--border-color)', transition: 'all 0.2s' }}>
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2" style={{ cursor: 'pointer' }} onClick={() => handleEditClick(topic._id)}>
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="badge text-uppercase bg-secondary-subtle text-secondary small border" style={{ borderColor: 'var(--border-color)' }}>{topic.paper}</span>
                        <span className="text-muted small fw-mono">{topic.code}</span>
                      </div>
                      <h6 className="mb-0 fw-semibold text-primary" style={{ color: 'var(--text-primary)' }}>{topic.title}</h6>
                    </div>
                    
                    <div className="d-flex align-items-center gap-3">
                      <span className={`badge ${getStatusBadge(current.status)}`}>
                        {current.status}
                      </span>
                      <span className="badge bg-dark-subtle border text-secondary small">
                        Conf: {current.confidence}/5
                      </span>
                      <button className="btn btn-sm btn-secondary-custom py-1 px-2 border-0 bg-transparent text-secondary font-semibold">
                        {isActive ? '▲' : '▼'}
                      </button>
                    </div>
                  </div>

                  {isActive && (
                    <div className="mt-4 pt-4 border-top" style={{ borderTopColor: 'var(--border-color)' }}>
                      <p className="small text-secondary mb-3" style={{ lineHeight: '1.6' }}>{topic.description}</p>
                      
                      <div className="row g-4 mb-4">
                        {/* Status Select */}
                        <div className="col-md-4">
                          <label className="form-label small text-secondary">Preparation Status</label>
                          <select
                            className="form-control-custom form-select"
                            value={editState.status}
                            onChange={(e) => setEditState(prev => ({ ...prev, status: e.target.value }))}
                          >
                            <option value="Not Started">Not Started</option>
                            <option value="Learning">Learning</option>
                            <option value="Completed">Completed</option>
                            <option value="Revised">Revised</option>
                            <option value="Strong">Strong</option>
                            <option value="Weak">Weak</option>
                          </select>
                        </div>

                        {/* Confidence Slider */}
                        <div className="col-md-8">
                          <label className="form-label small text-secondary d-flex justify-content-between">
                            <span>Confidence Level</span>
                            <span className="fw-semibold text-indigo">{editState.confidence}/5</span>
                          </label>
                          <input
                            type="range"
                            className="form-range"
                            min="1"
                            max="5"
                            value={editState.confidence}
                            onChange={(e) => setEditState(prev => ({ ...prev, confidence: parseInt(e.target.value, 10) }))}
                            style={{ accentColor: 'var(--accent-primary)' }}
                          />
                        </div>
                      </div>

                      <div className="row g-4 mb-4">
                        {/* Date Picker */}
                        <div className="col-md-6">
                          <label className="form-label small text-secondary">Next Revision Date</label>
                          <input
                            type="date"
                            className="form-control-custom"
                            value={editState.nextRevisionDate}
                            onChange={(e) => setEditState(prev => ({ ...prev, nextRevisionDate: e.target.value }))}
                          />
                        </div>
                        {/* Quick actions inside edit */}
                        <div className="col-md-6 d-flex align-items-end gap-2">
                          <button type="button" className="btn btn-sm btn-primary-custom w-100 py-2" onClick={() => markStatusQuick(topic._id, 'Completed', 5)}>
                            Mark Complete
                          </button>
                          <button type="button" className="btn btn-sm btn-danger w-100 py-2" onClick={() => markStatusQuick(topic._id, 'Weak', 2)}>
                            Mark Weak
                          </button>
                        </div>
                      </div>

                      {/* Guidelines subtopics checklist */}
                      {topic.subtopics?.length > 0 && (
                        <div className="mb-4">
                          <label className="form-label small text-secondary">Subtopic Guidelines Checklist</label>
                          <div className="row g-2 px-2">
                            {topic.subtopics.map((sub, sIdx) => (
                              <div key={sIdx} className="col-12 col-md-6 d-flex align-items-start gap-2">
                                <input
                                  type="checkbox"
                                  className="form-check-input mt-1"
                                  id={`sub-${topic._id}-${sIdx}`}
                                  style={{ cursor: 'pointer' }}
                                />
                                <label htmlFor={`sub-${topic._id}-${sIdx}`} className="small text-secondary" style={{ cursor: 'pointer' }}>{sub}</label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Study Notes */}
                      <div className="mb-4">
                        <label className="form-label small text-secondary">Study Notes & References</label>
                        <textarea
                          className="form-control-custom"
                          rows="3"
                          placeholder="Note down critical syllabus connections, key case studies or acts relative to this topic..."
                          value={editState.notes}
                          onChange={(e) => setEditState(prev => ({ ...prev, notes: e.target.value }))}
                        />
                      </div>

                      <div className="d-flex align-items-center gap-3">
                        <button
                          className="btn-primary-custom py-2 px-4"
                          onClick={() => handleSave(topic._id)}
                          disabled={savingId === topic._id}
                        >
                          {savingId === topic._id ? (
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          ) : null}
                          Save Progress
                        </button>
                        
                        {saveSuccess === topic._id && (
                          <span className="text-success small fw-semibold">✓ Syllabus metrics updated successfully</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default SyllabusTracker;
