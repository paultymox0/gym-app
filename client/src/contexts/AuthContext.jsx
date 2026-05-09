import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const API_BASE = '/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('gym_token');
    const savedUser = localStorage.getItem('gym_user');

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsedUser);
      } catch (e) {
        localStorage.removeItem('gym_token');
        localStorage.removeItem('gym_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (username) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login-direct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('gym_token', data.token);
      localStorage.setItem('gym_user', JSON.stringify(data.user));

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (e) {
      // ignore
    }

    setUser(null);
    setToken(null);
    localStorage.removeItem('gym_token');
    localStorage.removeItem('gym_user');
  }, [token]);

  const apiCall = useCallback(async (endpoint, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (response.status === 401) {
      // Token expired, logout
      logout();
      throw new Error('Sesión expirada');
    }

    return response;
  }, [token, logout]);

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    apiCall,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
