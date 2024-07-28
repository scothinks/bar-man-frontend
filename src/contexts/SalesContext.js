import React, { createContext, useContext, useCallback, useState } from 'react';
import { 
  createMultipleSales, 
  updateSalePaymentStatus, 
  getCustomers, 
  createCustomer, 
  createCustomerTab, 
  getSales,
  searchSales as apiSearchSales,
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

  const addMultipleSales = useCallback(async (salesData) => {
    if (!isAuthenticated()) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await createMultipleSales(salesData);
      await fetchSales();
      return response; 
    } catch (err) {
      console.error('Error adding sales:', err);
      setError('Failed to add sales. Please try again.');
      if (err.message === 'Authentication required' || (err.response && err.response.status === 401)) {
        logout();
      }
      throw err;
    } finally {
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

  const searchSales = useCallback(async (params) => {
    if (!isAuthenticated()) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiSearchSales(params);
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

  return (
    <SalesContext.Provider value={{ 
      sales,
      customers,
      loading: isLoading,
      error,
      summary,
      addMultipleSales,
      updatePaymentStatus,
      fetchCustomers: refreshCustomers,
      fetchSales,
      addCustomer,
      addCustomerTab,
      refreshSales,
      totalSalesCount,
      searchSales,  
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