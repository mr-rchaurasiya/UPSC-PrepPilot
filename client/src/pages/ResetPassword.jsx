import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import API from '../services/api';

export const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialEmail = queryParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !code || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Password strength check
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character.');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await API.post('/auth/reset-password', {
        email,
        code,
        newPassword
      });

      if (res.data.success) {
        setSuccess('Password reset successfully! Redirecting to login page...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 px-3" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="custom-card glass-panel w-100 p-4 p-sm-5" style={{ maxWidth: '480px' }}>
        <div className="text-center mb-4">
          <h2 className="gradient-text fw-bold">Reset Password</h2>
          <p className="text-secondary small mt-1">Enter your verification code and new password credentials</p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 small text-center animate-fade-in" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success py-2 small text-center animate-fade-in" role="alert">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small text-secondary">Email Address</label>
            <input
              type="email"
              className="form-control-custom"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <label className="form-label small text-secondary">Verification Code</label>
            <input
              type="text"
              className="form-control-custom"
              placeholder="e.g. 123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <label className="form-label small text-secondary">New Password</label>
            <div className="position-relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control-custom"
                placeholder="Minimum 8 characters with Capital, Small, Number, Symbol"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="position-absolute end-0 top-50 translate-middle-y border-0 bg-transparent text-secondary pe-3"
                onClick={() => setShowPassword(!showPassword)}
                style={{ zIndex: 10 }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label small text-secondary">Confirm New Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-control-custom"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn-primary-custom w-100 py-2.5 mb-3"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            ) : null}
            Reset Password
          </button>
        </form>

        <div className="text-center mt-2">
          <Link to="/login" className="small fw-semibold text-decoration-none" style={{ color: 'var(--accent-primary)' }}>
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
