import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Token ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

const getStoredToken = () => {
  try {
    return localStorage.getItem('token');
  } catch (error) {
    console.error('Error getting token from localStorage:', error);
    return null;
  }
};

api.interceptors.request.use(
  (config) => {
    try {
      const token = getStoredToken();
      if (token) {
        config.headers['Authorization'] = `Token ${token}`;
        console.log('Token attached to request');
      } else {
        console.log('No token found');
      }
    } catch (error) {
      console.error('Error getting stored token:', error);
    }

    console.log('Full request headers:', JSON.stringify(config.headers, null, 2));
    console.log(`Request URL: ${config.url}`);
    console.log(`Request Method: ${config.method}`);
    console.log(`Request Params: ${JSON.stringify(config.params, null, 2)}`);

    if (config.method === 'post' || config.method === 'put') {
      console.log('Request Body:', JSON.stringify(config.data, null, 2));
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      console.error(`Error ${error.response.status}: ${error.response.statusText}`);
      console.error('Error response data:', error.response.data);
      if (error.response.status === 401) {
        console.log('Unauthorized access - logging out');
        setAuthToken(null);
        window.location.href = '/login';
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

export const login = async (username, password) => {
  try {
    console.log('Attempting login for user:', { username, password });
    const response = await api.post('/token-auth/', { username, password });
    console.log('Login response:', response);

    if (response.data && response.data.token) {
      console.log('Token received:', response.data.token);
      setAuthToken(response.data.token);
      return response.data;
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

export const getCurrentUser = async () => {
  const token = getStoredToken();
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await api.get('/users/me/');
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};

export const logout = () => {
  console.log('Logging out...');
  setAuthToken(null);
};

// Helper function for API calls
const apiCall = async (method, url, data = null, params = null) => {
  try {
    const response = await api({
      method,
      url,
      data,
      params,
    });
    return response.data;
  } catch (error) {
    console.error(`API call error (${method} ${url}):`, error);
    throw error;
  }
};

// Inventory operations
export const getInventoryItems = async (includeDeleted = false) => {
  try {
    const response = await apiCall('get', '/inventory/inventoryitems/', null, { include_deleted: includeDeleted });
    return response.results || response;
  } catch (error) {
    throw error;
  }
};

export const createInventoryItem = (itemData) => apiCall('post', '/inventory/inventoryitems/', itemData);
export const updateInventoryItem = (id, itemData) => apiCall('put', `/inventory/inventoryitems/${id}/`, itemData);
export const deleteInventoryItem = (id) => apiCall('post', `/inventory/inventoryitems/${id}/soft-delete/`);
export const confirmDeleteInventoryItem = (id) => apiCall('post', `/inventory/inventoryitems/${id}/confirm-delete/`);
export const restoreInventoryItem = (id) => apiCall('post', `/inventory/inventoryitems/${id}/restore/`);

// Sales operations
export const getSales = (params) => apiCall('get', '/sales/', null, params);
export const createSale = (saleData) => apiCall('post', '/sales/', saleData);
export const createMultipleSales = (salesData) => apiCall('post', '/sales/multiple/', salesData);
export const updateSalePaymentStatus = (saleId, status) => apiCall('patch', `/sales/${saleId}/update_payment_status/`, { payment_status: status });
export const updateSaleCustomer = async (saleId, customerId) => {
  return await apiCall('patch', `/sales/${saleId}/update_customer/`, { customer: customerId });
};
export const searchSales = async (params) => {
  try {
    const response = await api.get('/sales/search/', { 
      params: {
        ...params,
        admin: params.admin,
      } 
    });
    console.log('Search sales response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error searching sales:', error);
    throw error;
  }
};

// Customer operations
export const batchCustomerOperations = async (operations) => {
  try {
    const results = {};
    for (const operation of operations) {
      switch (operation.operation) {
        case 'getCustomers':
          results.customers = await getCustomers();
          break;
        case 'getCustomerTabs':
          results.customerTabs = await getCustomerTabs();
          break;
        case 'createCustomer':
          results.createdCustomer = await createCustomer(operation.data);
          break;
        case 'createCustomerTab':
          results.createdTab = await createCustomerTab(operation.data);
          break;
        default:
          console.error(`Unknown operation: ${operation.operation}`);
      }
    }
    return results;
  } catch (error) {
    console.error('Error in batch customer operations:', error);
    throw error;
  }
};
export const getCustomers = (params) => apiCall('get', '/customers/', null, params);
export const createCustomer = (customerData) => apiCall('post', '/customers/', customerData);
export const getCustomerTabs = (params) => apiCall('get', '/customers/tabs/', null, params);
export const createCustomerTab = (tabData) => apiCall('post', '/customers/tabs/', tabData);
export const updateCustomerTabLimit = (customerId, newLimit) => apiCall('patch', `/customers/${customerId}/update_tab_limit/`, { tab_limit: newLimit });

// User management
export const getUsers = () => apiCall('get', '/users/');
export const createUser = (userData) => apiCall('post', '/users/', userData);

export default api;
