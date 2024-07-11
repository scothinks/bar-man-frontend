import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Token ${token}`;
    localStorage.setItem('token', token);
    console.log('Token set in localStorage and API headers');
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
    console.log('Token removed from localStorage and API headers');
  }
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
      console.log('Token attached to request:', token);
    } else {
      console.log('No token found in localStorage');
    }
    console.log('Request config:', config);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.response) {
      console.error('Error data:', error.response.data);
      console.error('Error status:', error.response.status);
      console.error('Error headers:', error.response.headers);
    } else if (error.request) {
      console.error('Error request:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    if (error.response && error.response.status === 401) {
      console.error('Received 401 Unauthorized response');
      setAuthToken(null);
      window.location = '/login';
    }
    return Promise.reject(error);
  }
);

export const initializeApi = () => {
  console.log('Initializing API...');
  const token = localStorage.getItem('token');
  if (token) {
    console.log('Token found in localStorage:', token);
    setAuthToken(token);
  } else {
    console.log('No token found in localStorage');
  }
};

// Authentication
export const login = async (username, password) => {
  try {
    console.log('Attempting login for user:', username);
    const response = await api.post('/token-auth/', { username, password });
    console.log('Login response:', response);

    if (response.data && response.data.token) {
      console.log('Token received:', response.data.token);
      setAuthToken(response.data.token);
      return response;
    } else {
      console.error('Login successful but no token received');
      throw new Error('No token received from server');
    }
  } catch (error) {
    console.error('Login error:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    throw error;
  }
};

export const logout = () => {
  console.log('Logging out...');
  setAuthToken(null);
};

export const validateToken = async () => {
  try {
    console.log('Validating token...');
    const response = await api.get('/users/me/');
    console.log('Token validation successful:', response);
    return true;
  } catch (error) {
    console.error('Token validation failed:', error);
    if (error.response && error.response.status === 401) {
      setAuthToken(null);
      return false;
    }
    throw error;
  }
};

// Inventory operations
export const getInventoryItems = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return api.get(`/inventoryitems/${queryString ? `?${queryString}` : ''}`);
};
export const createInventoryItem = (itemData) => api.post('/inventoryitems/', itemData);
export const updateInventoryItem = (id, itemData) => api.put(`/inventoryitems/${id}/`, itemData);
export const deleteInventoryItem = (id) => api.delete(`/inventoryitems/${id}/`);

// Sales operations
export const getSales = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return api.get(`/sales/${queryString ? `?${queryString}` : ''}`).then(response => {
    console.log('getSales response:', response.data);
    return response;
  }).catch(error => {
    console.error('getSales error:', error);
    throw error;
  });
};
export const createSale = (saleData) => api.post('/sales/', saleData);
export const updateSalePaymentStatus = (saleId, status) => api.patch(`/sales/${saleId}/update_payment_status/`, { payment_status: status });
export const allocateSaleToCustomer = (saleId, customerId) => api.post(`/sales/${saleId}/allocate_to_customer/`, { customer_id: customerId });
const fetchSales = async (page = 1, startDate = null, endDate = null) => {
  let url = `/api/sales/?page=${page}`;
  if (startDate) url += `&start_date=${startDate.toISOString().split('T')[0]}`;
  if (endDate) url += `&end_date=${endDate.toISOString().split('T')[0]}`;
  const response = await api.get(url);
  return response.data;
};

// Customer operations
export const getCustomers = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return api.get(`/customers/${queryString ? `?${queryString}` : ''}`);
};
export const createCustomer = (customerData) => api.post('/customers/', customerData);
export const getCustomerTabs = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return api.get(`/customers/tabs/${queryString ? `?${queryString}` : ''}`);
};
export const createCustomerTab = (tabData) => api.post('/customers/tabs/', tabData);

// User management operations (for admin)
export const getUsers = () => api.get('/users/');
export const createUser = (userData) => api.post('/users/', userData);
export const getCurrentUser = () => api.get('/users/me/');

export default api;