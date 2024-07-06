import React, { createContext, useState, useContext, useEffect } from 'react';
import { setAuthToken, login, getCurrentUser } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
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
    };
    initializeAuth();
  }, []);

  const loginUser = async (username, password) => {
    try {
      const response = await login(username, password);
      localStorage.setItem('token', response.data.token);
      setAuthToken(response.data.token);
      setUser(response.data.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
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
    <AuthContext.Provider value={{ user, loginUser, logout, isAuthenticated, getUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);