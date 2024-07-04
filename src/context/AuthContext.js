import React, { createContext, useState, useContext, useEffect } from 'react';
import { setAuthToken, login } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
      // You might want to fetch user data here
    }
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

  return (
    <AuthContext.Provider value={{ user, loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);