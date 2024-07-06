import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const retryRequest = async (fn, retries = 3, delay = 1000) => {
    try {
      return await fn();
    } catch (error) {
      console.error('Request error:', error);
      if (retries > 0 && (
        error.code === 'ERR_INSUFFICIENT_RESOURCES' ||
        error.code === 'ECONNABORTED' ||
        (error.response && error.response.status >= 500) // Retry on server errors
      )) {
        console.log(`Retrying request. Attempts left: ${retries - 1}`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return retryRequest(fn, retries - 1, delay * 2);
      }
      throw error;
    }
  };

api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Token ${token}`;
        console.log('Token included in request:', token);
      } else {
        console.log('No token found in localStorage');
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Token ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const initializeApi = () => {
  const token = localStorage.getItem('token');
  if (token) {
    setAuthToken(token);
  }
};

export const login = async (username, password) => {
    try {
      console.log('Attempting login for user:', username);
      const response = await api.post('/token-auth/', { username, password });
      console.log('Login response:', response);
  
      if (response.data && response.data.token) {
        console.log('Token received:', response.data.token);
        localStorage.setItem('token', response.data.token);
        setAuthToken(response.data.token);
        console.log('Token set in localStorage and API headers');
        
        
        const storedToken = localStorage.getItem('token');
        console.log('Token in localStorage after setting:', storedToken);
        
        
        console.log('Current API headers:', api.defaults.headers);
  
        return response;
      } else {
        console.error('Login successful but no token received');
        throw new Error('No token received from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response);
      throw error;
    }
  };

export const validateToken = async () => {
    try {
      await getCurrentUser();
      return true;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        setAuthToken(null);
        return false;
      }
      throw error;
    }
  };

 

export const logout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
    // Redirect to login page
  };

export const getInventoryItems = () => retryRequest(() => api.get('/inventoryitems/'));
export const createInventoryItems= (itemData) => api.post('/inventoryitems/', itemData);
export const updateInventoryItem = (id, itemData) => api.put(`/inventoryitems/${id}/`, itemData);
export const deleteInventoryItem = (id) => api.delete(`/inventoryitems/${id}/`);
export const createSale = (saleData) => retryRequest(() => api.post('/sales/', saleData));
export const getCustomerTabs = () => retryRequest(() => api.get('/customers/tabs/'));
export const createCustomerTab = (tabData) => retryRequest(() => api.post('/customers/tabs/', tabData));
export const getUsers = () => retryRequest(() => api.get('/users/'));
export const createUser = (userData) => retryRequest(() => api.post('/users/', userData));
export const getCurrentUser = () => retryRequest(() => api.get('/users/me/'));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      setAuthToken(null);
      window.location = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;