import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  adminGetMe,
  adminLogout as apiLogout,
  adminLogin as apiLogin,
  isSessionValid,
  clearAdminSession,
  getSessionRemainingSeconds
} from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Initial authentication & session validity check
  const checkSession = useCallback(async () => {
    if (!isSessionValid()) {
      clearAdminSession();
      setAdminUser(null);
      setRemainingSeconds(0);
      setLoading(false);
      return;
    }

    try {
      const res = await adminGetMe();
      if (res.success && res.user) {
        setAdminUser(res.user);
        setRemainingSeconds(getSessionRemainingSeconds());
        setSessionExpired(false);
      } else {
        clearAdminSession();
        setAdminUser(null);
        setRemainingSeconds(0);
        if (res.expired) {
          setSessionExpired(true);
        }
      }
    } catch {
      clearAdminSession();
      setAdminUser(null);
      setRemainingSeconds(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Active 1-Hour Auto-Logout Timer (runs every second)
  useEffect(() => {
    if (!adminUser) return;

    const timer = setInterval(() => {
      const remaining = getSessionRemainingSeconds();
      setRemainingSeconds(remaining);

      // If 1-hour session has elapsed, automatically force logout and require re-login
      if (remaining <= 0) {
        console.warn('[Admin Security] 1-hour session expired. Re-authentication required.');
        clearAdminSession();
        setAdminUser(null);
        setSessionExpired(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [adminUser]);

  const login = async (identifier, password) => {
    setSessionExpired(false);
    const res = await apiLogin(identifier, password);
    if (res.success && res.user) {
      setAdminUser(res.user);
      setRemainingSeconds(getSessionRemainingSeconds());
    }
    return res;
  };

  const logout = async () => {
    await apiLogout();
    setAdminUser(null);
    setRemainingSeconds(0);
    setSessionExpired(false);
  };

  return (
    <AuthContext.Provider
      value={{
        adminUser,
        setAdminUser,
        login,
        logout,
        loading,
        isAuthenticated: !!adminUser && isSessionValid(),
        remainingSeconds,
        sessionExpired,
        setSessionExpired
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
