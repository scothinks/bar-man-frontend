import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createSale, updateSalePaymentStatus, getCustomers, createCustomer, createCustomerTab, getSales } from '../services/api';

const SalesContext = createContext();

export const SalesProvider = ({ children }) => {
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({ total_done: 0, total_pending: 0 });
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getCustomers();
      setCustomers(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch customers');
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSales = useCallback(async (filters = {}, reset = false) => {
    setLoading(true);
    try {
      const response = await getSales(filters);
      console.log('Fetched sales data:', response.data);
      setSales(prevSales => reset ? response.data.sales : [...prevSales, ...response.data.sales]);
      setSummary(response.data.summary || { total_done: 0, total_pending: 0 });
      setNextPage(response.data.next);
      setPreviousPage(response.data.previous);
      setTotalCount(response.data.count);
      setError(null);
    } catch (err) {
      console.error('Error fetching sales:', err);
      setError('Failed to fetch sales');
      setSales([]);
      setSummary({ total_done: 0, total_pending: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMoreSales = useCallback(async () => {
    if (nextPage) {
      setLoading(true);
      try {
        const response = await getSales({ page: new URL(nextPage).searchParams.get('page') });
        setSales(prevSales => [...prevSales, ...response.data.sales]);
        setNextPage(response.data.next);
        setPreviousPage(response.data.previous);
        setTotalCount(response.data.count);
      } catch (err) {
        console.error('Error loading more sales:', err);
        setError('Failed to load more sales');
      } finally {
        setLoading(false);
      }
    }
  }, [nextPage]);

  useEffect(() => {
    fetchCustomers();
    fetchSales({}, true);
  }, [fetchCustomers, fetchSales]);

  const addSale = useCallback(async (saleData) => {
    setLoading(true);
    try {
      const response = await createSale(saleData);
      await fetchSales({}, true); // Refresh sales data after adding a new sale
      setError(null);
      return response.data;
    } catch (err) {
      console.error('Error adding sale:', err);
      setError('Failed to add sale');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchSales]);

  const updatePaymentStatus = useCallback(async (saleId, status) => {
    setLoading(true);
    try {
      const response = await updateSalePaymentStatus(saleId, status);
      await fetchSales({}, true); // Refresh sales data after updating payment status
      setError(null);
      return response.data;
    } catch (err) {
      console.error('Error updating payment status:', err);
      setError('Failed to update payment status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchSales]);

  const addCustomer = useCallback(async (customerData) => {
    setLoading(true);
    try {
      const response = await createCustomer(customerData);
      setCustomers(prevCustomers => Array.isArray(prevCustomers) ? [...prevCustomers, response.data] : [response.data]);
      setError(null);
      return response.data;
    } catch (err) {
      console.error('Error adding customer:', err);
      setError('Failed to add customer');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addCustomerTab = useCallback(async (tabData) => {
    setLoading(true);
    try {
      const response = await createCustomerTab(tabData);
      setError(null);
      return response.data;
    } catch (err) {
      console.error('Error creating customer tab:', err);
      setError('Failed to create customer tab');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshSales = useCallback((filters = {}) => {
    fetchSales(filters, true);
  }, [fetchSales]);

  return (
    <SalesContext.Provider value={{ 
      sales, 
      customers, 
      loading, 
      error, 
      summary,
      addSale, 
      updatePaymentStatus, 
      fetchCustomers,
      fetchSales,
      addCustomer,
      addCustomerTab,
      refreshSales,
      loadMoreSales,
      hasMoreSales: !!nextPage,
      totalSalesCount: totalCount
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