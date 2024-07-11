import React, { createContext, useState, useContext, useEffect } from 'react';
import { setAuthToken, login, getCurrentUser } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (token) {
        setAuthToken(token);
        try {
          const userData = await getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Failed to get user data:', error);
          logout();
        }
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, []);

  const loginUser = async (username, password) => {
    try {
      const response = await login(username, password);
      setUser(response.data.user);
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  const isAuthenticated = () => !!user;

  const getUser = async () => {
    if (!user) {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
        return userData;
      } catch (error) {
        console.error('Failed to get user data:', error);
        return null;
      }
    }
    return user;
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logout, isAuthenticated, getUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);