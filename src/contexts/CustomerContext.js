import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCustomers, createCustomer, getCustomerTabs, createCustomerTab } from '../services/api';

const CustomerContext = createContext();

export const CustomerProvider = ({ children }) => {
  const [customers, setCustomers] = useState([]);
  const [customerTabs, setCustomerTabs] = useState([]);
  const [error, setError] = useState(null);

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await getCustomers();
      setCustomers(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
      setError('Failed to fetch customers');
    }
  }, []);

  const fetchCustomerTabs = useCallback(async () => {
    try {
      const response = await getCustomerTabs();
      setCustomerTabs(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (error) {
      console.error('Error fetching customer tabs:', error);
      setCustomerTabs([]);
      setError('Failed to fetch customer tabs');
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
    fetchCustomerTabs();
  }, [fetchCustomers, fetchCustomerTabs]);

  const addCustomer = async (customerData) => {
    try {
      const response = await createCustomer(customerData);
      setCustomers(prevCustomers => [...prevCustomers, response.data]);
      setError(null);
      return response.data;
    } catch (error) {
      console.error('Error adding customer:', error);
      setError('Failed to add customer');
      throw error;
    }
  };

  const addCustomerTab = async (tabData) => {
    try {
      const response = await createCustomerTab(tabData);
      setCustomerTabs(prevTabs => [...prevTabs, response.data]);
      setError(null);
      return response.data;
    } catch (error) {
      console.error('Error adding customer tab:', error);
      setError('Failed to add customer tab');
      throw error;
    }
  };

  return (
    <CustomerContext.Provider value={{ 
      customers, 
      customerTabs, 
      addCustomer, 
      addCustomerTab, 
      fetchCustomers, 
      fetchCustomerTabs,
      error 
    }}>
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
};