import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { setAuthToken, login as apiLogin, getCurrentUser, logout as apiLogout } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (username, password) => {
    setError(null);
    try {
      const data = await apiLogin(username, password);
      setUser(data.user);
      return data;
    } catch (error) {
      setError(error.response?.data?.detail || error.message);
      throw error;
    }
  };

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setAuthToken(null);
      setUser(null);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoading(true);
      try {
        setAuthToken(token);
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Failed to get user data:', error);
        await logout();
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const isAuthenticated = useCallback(() => {
    return !!user && !!localStorage.getItem('token');
  }, [user]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading, 
      error, 
      checkAuth,
      isAuthenticated 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
