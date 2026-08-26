import React, { useState, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

export const Login = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isExpired = queryParams.get('expired') === 'true';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (!user.onboardingCompleted) {
        navigate('/onboarding');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 px-3" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="custom-card glass-panel w-100 p-4 p-sm-5" style={{ maxWidth: '480px' }}>
        <div className="text-center mb-4">
          <h2 className="gradient-text fw-bold">UPSC PrepPilot</h2>
          <p className="text-secondary small mt-1">Navigate your Civil Services path with AI guidance</p>
        </div>

        {isExpired && (
          <div className="alert alert-warning py-2 small text-center" role="alert">
            Your session has expired. Please log in again.
          </div>
        )}

        {error && (
          <div className="alert alert-danger py-2 small text-center" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small text-secondary">Email Address</label>
            <input
              type="email"
              className="form-control-custom"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label small text-secondary mb-0">Password</label>
              <Link to="/forgot-password" style={{ color: 'var(--accent-primary)', fontSize: '0.78rem' }} className="text-decoration-none fw-semibold">
                Forgot Password?
              </Link>
            </div>
            <div className="position-relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control-custom"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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

          <button
            type="submit"
            className="btn-primary-custom w-100 py-2.5 mb-3"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            ) : null}
            Sign In
          </button>
        </form>

        <div className="text-center mt-3">
          <span className="text-muted small">New to PrepPilot? </span>
          <Link to="/register" className="small fw-semibold text-decoration-none" style={{ color: 'var(--accent-primary)' }}>
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
