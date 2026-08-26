import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

export const Onboarding = () => {
  const { completeOnboarding, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 2: Target Exam
  const [targetExamYear, setTargetExamYear] = useState(new Date().getFullYear() + 1);

  // Step 3: Attempt
  const [attemptNumber, setAttemptNumber] = useState(1);

  // Step 4: Optional Subject
  const [optionalSubject, setOptionalSubject] = useState('');

  // Step 5: Study Hours
  const [availableStudyHoursPerDay, setAvailableStudyHoursPerDay] = useState(6);
  const [preferredStudyStartTime, setPreferredStudyStartTime] = useState('08:00');
  const [preferredStudyEndTime, setPreferredStudyEndTime] = useState('20:00');

  // Step 6: Preparation Level
  const [currentPreparationStage, setCurrentPreparationStage] = useState('Foundation');
  const [currentPreparationPercentage, setCurrentPreparationPercentage] = useState(0);

  // Step 7: Priority
  const [primaryPriority, setPrimaryPriority] = useState('Both');

  const nextStep = () => {
    if (step === 4 && !optionalSubject.trim()) {
      setError('Please specify your optional subject.');
      return;
    }
    setError('');
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await completeOnboarding({
        targetExamYear: parseInt(targetExamYear, 10),
        attemptNumber: parseInt(attemptNumber, 10),
        currentPreparationLevel: 'beginner',
        syllabusCompletionLevel: parseInt(currentPreparationPercentage, 10),
        currentPreparationStage,
        optionalSubject,
        availableStudyHoursPerDay: parseInt(availableStudyHoursPerDay, 10),
        preferredStudyStartTime,
        preferredStudyEndTime,
        preferredStudyDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        preferredStudyMode: 'Self-study',
        primaryPriority,
        currentAffairsPreference: 'Newspaper',
        csatPreparationStatus: 'Not Started',
        mainsAnswerWritingExperience: 'None',
        preparationStartDate: new Date().toISOString()
      });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to submit onboarding info.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="text-center py-3">
            <h4 className="gradient-text fw-bold mb-3">Welcome to UPSC PrepPilot!</h4>
            <p className="text-secondary small mb-4" style={{ lineHeight: '1.7' }}>
              PrepPilot is your personalized preparation engine. We use your exam objectives, available hours, and preparation priority to design daily study checklists, syllabus trackers, and mistake logs tailored to your exact pace.
            </p>
            <p className="small text-muted mb-4">Click below to customize your study path.</p>
          </div>
        );
      case 2:
        return (
          <div>
            <h5 className="mb-4 fw-semibold text-secondary">Step 2: Target Exam Year</h5>
            <div className="mb-3">
              <label className="form-label small text-secondary">Target UPSC Civil Services Exam Year</label>
              <select
                className="form-control-custom form-select"
                value={targetExamYear}
                onChange={(e) => setTargetExamYear(e.target.value)}
              >
                {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h5 className="mb-4 fw-semibold text-secondary">Step 3: Attempt Count</h5>
            <div className="mb-3">
              <label className="form-label small text-secondary">Which attempt will this be?</label>
              <select
                className="form-control-custom form-select"
                value={attemptNumber}
                onChange={(e) => setAttemptNumber(e.target.value)}
              >
                {Array.from({ length: 8 }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>Attempt #{num}</option>
                ))}
              </select>
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            <h5 className="mb-4 fw-semibold text-secondary">Step 4: Optional Subject</h5>
            <div className="mb-3">
              <label className="form-label small text-secondary">Specify your Optional Subject</label>
              <input
                type="text"
                className="form-control-custom"
                placeholder="e.g. Sociology, Geography, Public Administration, History"
                value={optionalSubject}
                onChange={(e) => setOptionalSubject(e.target.value)}
                required
              />
            </div>
            <p className="small text-muted mt-2">PrepPilot supports any optional subject; you can change this settings anytime later.</p>
          </div>
        );
      case 5:
        return (
          <div>
            <h5 className="mb-4 fw-semibold text-secondary">Step 5: Daily Study Hours</h5>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label small text-secondary">Available daily study hours</label>
                <input
                  type="number"
                  className="form-control-custom"
                  min="1"
                  max="24"
                  value={availableStudyHoursPerDay}
                  onChange={(e) => setAvailableStudyHoursPerDay(e.target.value)}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label small text-secondary">Preferred study window starts at</label>
                <input
                  type="time"
                  className="form-control-custom"
                  value={preferredStudyStartTime}
                  onChange={(e) => setPreferredStudyStartTime(e.target.value)}
                />
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div>
            <h5 className="mb-4 fw-semibold text-secondary">Step 6: Preparation Level</h5>
            <div className="mb-3">
              <label className="form-label small text-secondary">Current Preparation Stage</label>
              <select
                className="form-control-custom form-select"
                value={currentPreparationStage}
                onChange={(e) => setCurrentPreparationStage(e.target.value)}
              >
                <option value="Foundation">Foundation Readings (Reading core textbooks)</option>
                <option value="Revision">Active Revision (Revising notes & papers)</option>
                <option value="Practice">Test Practice & PYQs (Solving mock papers)</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label small text-secondary">Estimated Syllabus Completion Percentage (%)</label>
              <input
                type="number"
                className="form-control-custom"
                min="0"
                max="100"
                value={currentPreparationPercentage}
                onChange={(e) => setCurrentPreparationPercentage(e.target.value)}
              />
            </div>
          </div>
        );
      case 7:
        return (
          <div>
            <h5 className="mb-4 fw-semibold text-secondary">Step 7: Preparation Priority</h5>
            <div className="mb-3">
              <label className="form-label small text-secondary">Select Primary Focus</label>
              <select
                className="form-control-custom form-select"
                value={primaryPriority}
                onChange={(e) => setPrimaryPriority(e.target.value)}
              >
                <option value="Prelims">Prelims focus (Facts, MCQs, CSAT)</option>
                <option value="Mains">Mains focus (Essay, Answer writing, Optional)</option>
                <option value="Both">Balanced (GS + Answer Practice)</option>
              </select>
            </div>
          </div>
        );
      case 8:
        return (
          <div>
            <h5 className="mb-4 fw-semibold text-secondary">Step 8: Generate Initial Plan</h5>
            <div className="p-3 rounded text-secondary mb-3" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', maxHeight: '240px', overflowY: 'auto' }}>
              <div className="small mb-2"><strong>Target Exam:</strong> UPSC Civil Services {targetExamYear}</div>
              <div className="small mb-2"><strong>Attempt:</strong> Attempt #{attemptNumber}</div>
              <div className="small mb-2"><strong>Optional Subject:</strong> {optionalSubject}</div>
              <div className="small mb-2"><strong>Study Allocation:</strong> {availableStudyHoursPerDay} hours/day (starting at {preferredStudyStartTime})</div>
              <div className="small mb-2"><strong>Stage:</strong> {currentPreparationStage} ({currentPreparationPercentage}% complete)</div>
              <div className="small mb-0"><strong>Focus Priority:</strong> {primaryPriority}</div>
            </div>
            <p className="small text-muted">Clicking the button below will complete onboarding and configure your profile settings ready for the study planner rooms.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 py-5 px-3" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="custom-card glass-panel w-100 p-4 p-sm-5" style={{ maxWidth: '640px' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="gradient-text fw-bold mb-0">Onboarding Wizard</h2>
            <p className="text-secondary small mb-0">Step {step} of 8</p>
          </div>
          <button onClick={logout} className="btn-secondary-custom py-1.5 px-3 btn-sm">
            Sign Out
          </button>
        </div>

        {/* Progress bar */}
        <div className="progress mb-4" style={{ height: '6px', backgroundColor: 'var(--bg-tertiary)' }}>
          <div className="progress-bar bg-primary" role="progressbar" style={{ width: `${(step / 8) * 100}%`, transition: 'width 0.3s ease' }}></div>
        </div>

        {error && (
          <div className="alert alert-danger py-2 small text-center mb-4" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={step === 8 ? handleSubmit : (e) => e.preventDefault()}>
          <div className="mb-4" style={{ minHeight: '260px' }}>
            {renderStepContent()}
          </div>

          <div className="d-flex justify-content-between gap-3">
            {step > 1 ? (
              <button type="button" className="btn btn-secondary-custom py-2 px-4" onClick={prevStep}>
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 8 ? (
              <button type="button" className="btn btn-primary-custom py-2 px-4" onClick={nextStep}>
                {step === 1 ? 'Get Started' : 'Next'}
              </button>
            ) : (
              <button type="submit" className="btn-primary-custom py-2.5 px-4" disabled={loading}>
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ) : null}
                Generate Initial Plan
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
