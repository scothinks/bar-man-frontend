import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createSale, updateSalePaymentStatus, getCustomers, createCustomer, createCustomerTab } from '../services/api';

const SalesContext = createContext();

export const SalesProvider = ({ children }) => {
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const addSale = useCallback(async (saleData) => {
    setLoading(true);
    try {
      const response = await createSale(saleData);
      setSales(prevSales => [...prevSales, response.data]);
      setError(null);
      return response.data;
    } catch (err) {
      setError('Failed to add sale');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePaymentStatus = useCallback(async (saleId, status) => {
    setLoading(true);
    try {
      const response = await updateSalePaymentStatus(saleId, status);
      setSales(prevSales => prevSales.map(sale => 
        sale.id === saleId ? { ...sale, payment_status: status } : sale
      ));
      setError(null);
      return response.data;
    } catch (err) {
      setError('Failed to update payment status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addCustomer = useCallback(async (customerData) => {
    setLoading(true);
    try {
      const response = await createCustomer(customerData);
      setCustomers(prevCustomers => [...prevCustomers, response.data]);
      setError(null);
      return response.data;
    } catch (err) {
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
      // You might want to update some state here to reflect the new tab
      setError(null);
      return response.data;
    } catch (err) {
      setError('Failed to create customer tab');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);


  return (
    <SalesContext.Provider value={{ 
      sales, 
      customers, 
      loading, 
      error, 
      addSale, 
      updatePaymentStatus, 
      fetchCustomers,
      addCustomer,
      addCustomerTab
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