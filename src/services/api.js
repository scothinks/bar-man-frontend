import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Token ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const login = (username, password) => api.post('/users/login/', { username, password });
export const getInventory = () => api.get('/inventory/items/');
export const createSale = (saleData) => api.post('/sales/', saleData);
export const getCustomerTabs = () => api.get('/customers/tabs/');
export const createCustomerTab = (tabData) => api.post('/customers/tabs/', tabData);
export const getUsers = () => api.get('/users/');
export const createUser = (userData) => api.post('/users/', userData);

// Add this new function
export const getCurrentUser = () => api.get('/users/me/');

export default api;