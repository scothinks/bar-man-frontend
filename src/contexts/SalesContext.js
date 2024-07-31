import React, { createContext, useContext, useCallback, useState } from 'react';
import { 
  createMultipleSales, 
  updateSalePaymentStatus, 
  getCustomers, 
  createCustomer, 
  createCustomerTab, 
  getSales,
  searchSales as apiSearchSales,
  updateCustomerTabLimit as apiUpdateCustomerTabLimit,
  updateSaleCustomer as apiUpdateSaleCustomer
} from '../services/api';
import { useAuth } from './AuthContext';

const SalesContext = createContext();

export const SalesProvider = ({ children }) => {
  const { logout, isAuthenticated } = useAuth();
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [summary, setSummary] = useState({ total_done: 0, total_pending: 0 });
  const [totalSalesCount, setTotalSalesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [last24HoursSummary, setLast24HoursSummary] = useState({ total_done: 0, total_pending: 0 });

  const fetchSales = useCallback(async (params = { limit: 5, page: 1 }) => {
    if (!isAuthenticated()) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSales(params);
      setSales(data.results || []);
      setTotalSalesCount(data.count || 0);
      console.log('Sales fetched successfully');
    } catch (err) {
      console.error('Error fetching sales:', err);
      setError('Failed to fetch sales. Please try again.');
      if (err.message === 'Authentication required' || (err.response && err.response.status === 401)) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, logout]);

  const fetchLast24HoursSummary = useCallback(async () => {
    if (!isAuthenticated()) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiSearchSales({ period: 'day' });
      setLast24HoursSummary(response.summary || { total_done: 0, total_pending: 0 });
    } catch (err) {
      console.error('Error fetching last 24 hours sales summary:', err);
      setError('Failed to fetch last 24 hours sales summary. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);


  const fetchCustomers = useCallback(async () => {
    if (!isAuthenticated()) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCustomers();
      setCustomers(data);
      console.log('Customers fetched successfully');
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to fetch customers. Please try again.');
      if (err.message === 'Authentication required' || (err.response && err.response.status === 401)) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, logout]);

  const updateCustomerTabLimit = useCallback(async (customerId, newLimit) => {
    if (!isAuthenticated()) return;
    setIsLoading(true);
    setError(null);
    try {
      await apiUpdateCustomerTabLimit(customerId, newLimit);
    } catch (err) {
      console.error('Error updating customer tab limit:', err);
      setError('Failed to update customer tab limit. Please try again.');
      if (err.message === 'Authentication required' || (err.response && err.response.status === 401)) {
        logout();
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, logout, setError, setIsLoading]);

  const addMultipleSales = useCallback(async (salesData) => {
    if (!isAuthenticated()) {
      console.log('User not authenticated, aborting addMultipleSales');
      return;
    }
    console.log('Starting addMultipleSales with data:', salesData);
    setIsLoading(true);
    setError(null);
    try {
      console.log('Calling createMultipleSales API');
      const response = await createMultipleSales(salesData);
      console.log('createMultipleSales API response:', response);
      
      console.log('Fetching updated sales data');
      await fetchSales();
      console.log('Sales data fetched successfully');
      
      return response; 
    } catch (err) {
      console.error('Error adding sales:', err);
      if (err.response) {
        console.error('Error response:', err.response);
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        
        if (err.response.data.error) {
          setError(err.response.data.error);
        } else if (err.response.data.non_field_errors) {
          setError(err.response.data.non_field_errors[0]);
        } else {
          setError('Failed to add sales. Please try again.');
        }
      } else if (err.request) {
        console.error('Error request:', err.request);
        setError('No response received from server. Please try again.');
      } else {
        console.error('Error message:', err.message);
        setError('An error occurred. Please try again.');
      }
      if (err.message === 'Authentication required' || (err.response && err.response.status === 401)) {
        console.log('Authentication error detected, logging out');
        logout();
      }
      throw err;
    } finally {
      console.log('Finished addMultipleSales process');
      setIsLoading(false);
    }
  }, [isAuthenticated, logout, fetchSales]);

  const updatePaymentStatus = useCallback(async (saleId, status) => {
    if (!isAuthenticated()) return;
    setIsLoading(true);
    setError(null);
    try {
      await updateSalePaymentStatus(saleId, status);
      await fetchSales();
    } catch (err) {
      console.error('Error updating payment status:', err);
      setError('Failed to update payment status. Please try again.');
      if (err.message === 'Authentication required' || (err.response && err.response.status === 401)) {
        logout();
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, logout, fetchSales]);

  const addCustomer = useCallback(async (customerData) => {
    if (!isAuthenticated()) return;
    setIsLoading(true);
    setError(null);
    try {
      const newCustomer = await createCustomer(customerData);
      setCustomers(prevCustomers => [...prevCustomers, newCustomer]);
      return newCustomer;
    } catch (err) {
      console.error('Error adding customer:', err);
      setError('Failed to add customer. Please try again.');
      if (err.message === 'Authentication required' || (err.response && err.response.status === 401)) {
        logout();
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, logout]);

  const addCustomerTab = useCallback(async (tabData) => {
    if (!isAuthenticated()) return;
    setIsLoading(true);
    setError(null);
    try {
      return await createCustomerTab(tabData);
    } catch (err) {
      console.error('Error creating customer tab:', err);
      setError('Failed to create customer tab. Please try again.');
      if (err.message === 'Authentication required' || (err.response && err.response.status === 401)) {
        logout();
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, logout]);

  const updateSaleCustomer = useCallback(async (saleId, customerId) => {
    if (!isAuthenticated()) return;
    setIsLoading(true);
    setError(null);
    try {
      await apiUpdateSaleCustomer(saleId, customerId);
      await fetchSales();
    } catch (err) {
      console.error('Error updating sale customer:', err);
      setError('Failed to update sale customer. Please try again.');
      if (err.message === 'Authentication required' || (err.response && err.response.status === 401)) {
        logout();
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, logout, fetchSales]);

  const searchSales = useCallback(async (params) => {
    if (!isAuthenticated()) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiSearchSales({
        ...params,
        admin: params.customer,
      });
      setSales(response.results || []);
      setSummary(response.summary || { total_done: 0, total_pending: 0 });
      setTotalSalesCount(response.count || 0);
      return response;
    } catch (err) {
      console.error('Error searching sales:', err);
      setError('Failed to search sales. Please try again.');
      if (err.message === 'Authentication required' || (err.response && err.response.status === 401)) {
        logout();
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, logout]);

  const refreshSales = useCallback(() => {
    fetchSales();
  }, [fetchSales]);

  const refreshCustomers = useCallback(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const fetchSummary = useCallback(async () => {
    if (!isAuthenticated()) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiSearchSales({ period: 'all' });
      setSummary(response.summary || { total_done: 0, total_pending: 0 });
      console.log('Summary fetched successfully');
    } catch (err) {
      console.error('Error fetching summary:', err);
      setError('Failed to fetch sales summary. Please try again.');
      if (err.message === 'Authentication required' || (err.response && err.response.status === 401)) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, logout]);

  return (
    <SalesContext.Provider value={{ 
      sales,
      customers,
      loading: isLoading,
      error,
      setError,
      summary,
      fetchSummary,
      last24HoursSummary,
      fetchLast24HoursSummary,
      addMultipleSales,
      updatePaymentStatus,
      fetchCustomers: refreshCustomers,
      fetchSales,
      addCustomer,
      addCustomerTab,
      updateCustomerTabLimit,
      refreshSales,
      totalSalesCount,
      searchSales,
      updateSaleCustomer,
    }}>
      {children}
    </SalesContext.Provider>
  );
};

export const useSales = () => {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
};
