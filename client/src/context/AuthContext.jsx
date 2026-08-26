import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        // Validate active token with database profile check
        try {
          const res = await API.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error('Failed to verify token on startup:', err.message);
          // If token verification yields 401 unauthorized, log out session
          if (err.response && err.response.status === 401) {
            logoutStateOnly();
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token: apiToken, user: apiUser } = res.data;
        localStorage.setItem('token', apiToken);
        localStorage.setItem('user', JSON.stringify(apiUser));
        setToken(apiToken);
        setUser(apiUser);
        setLoading(false);
        return apiUser;
      }
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.post('/auth/register', { name, email, password });
      if (res.data.success) {
        const { token: apiToken, user: apiUser } = res.data;
        localStorage.setItem('token', apiToken);
        localStorage.setItem('user', JSON.stringify(apiUser));
        setToken(apiToken);
        setUser(apiUser);
        setLoading(false);
        return apiUser;
      }
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || 'Registration failed.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const completeOnboarding = async (profileData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.put('/users/onboarding', profileData);
      if (res.data.success) {
        const { user: updatedUser } = res.data;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setLoading(false);
        return updatedUser;
      }
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || 'Failed to complete onboarding.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const logoutStateOnly = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const logout = async () => {
    try {
      await API.post('/auth/logout');
    } catch (err) {
      console.warn('Backend logout response skipped or failed.');
    }
    logoutStateOnly();
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, completeOnboarding, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
