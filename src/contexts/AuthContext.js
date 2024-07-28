import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { setAuthToken, login as apiLogin, getCurrentUser, logout as apiLogout } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const lastCheckRef = useRef(0);

  const login = async (username, password) => {
    setError(null);
    setIsLoading(true);
    try {
      const data = await apiLogin(username, password);
      setUser(data.user);
      setIsLoading(false);
      return data;
    } catch (error) {
      setError(error.response?.data?.detail || error.message);
      setIsLoading(false);
      throw error;
    }
  };

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setAuthToken(null);
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    const now = Date.now();
    if (now - lastCheckRef.current < 60000) { // Only check once per minute
      return;
    }
    lastCheckRef.current = now;

    console.log('checkAuth called');
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoading(true);
      try {
        console.log('Token found, calling getCurrentUser');
        setAuthToken(token);
        const userData = await getCurrentUser();
        console.log('User data received:', userData);
        setUser(userData);
      } catch (error) {
        console.error('Failed to get user data:', error);
        if (error.response && error.response.status === 429) {
          console.log('Rate limited, will try again later');
          // Don't logout here, just set user to null
          setUser(null);
        } else {
          await logout();
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log('No token found');
      setUser(null);
    }
  }, [logout]);

  const isAuthenticated = useCallback(() => {
    return !!user && !!localStorage.getItem('token');
  }, [user]);


  const refreshUserData = useCallback(async () => {
    if (isAuthenticated()) {
      setIsLoading(true);
      try {
        const userData = await getCurrentUser();
        setUser(userData);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to refresh user data:', error);
        setIsLoading(false);
        if (error.response && error.response.status === 401) {
          await logout();
        }
      }
    }
  }, [logout, isAuthenticated]);


  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading, 
      error, 
      checkAuth,
      refreshUserData,
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