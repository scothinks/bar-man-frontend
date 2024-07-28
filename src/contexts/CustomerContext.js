// In CustomerContext.js

import React, { createContext, useContext, useCallback, useState } from 'react';
import api, { batchCustomerOperations } from '../services/api';
import { useAuth } from './AuthContext';

const CustomerContext = createContext();

export const CustomerProvider = ({ children }) => {
  const { logout, isAuthenticated } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [customerTabs, setCustomerTabs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCustomerData = useCallback(async () => {
    if (!isAuthenticated()) return;
    setIsLoading(true);
    setError(null);
    try {
      const operations = [
        { operation: 'getCustomers' },
        { operation: 'getCustomerTabs' }
      ];
      const data = await batchCustomerOperations(operations);
      console.log('Customer data fetched:', data.customers.map(c => c.id));
      setCustomers(data.customers);
      setCustomerTabs(data.customerTabs);
      console.log('Customer data fetched successfully');
    } catch (err) {
      console.error('Error fetching customer data:', err);
      setError('Failed to fetch customer data. Please try again.');
      if (err.message === 'Authentication required' || (err.response && err.response.status === 401)) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, logout]);

  const addCustomer = useCallback(async (customerData) => {
    if (!isAuthenticated()) return;
    setIsLoading(true);
    setError(null);
    try {
      const operations = [
        { operation: 'createCustomer', data: customerData }
      ];
      const data = await batchCustomerOperations(operations);
      const newCustomer = data.createdCustomer;
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
      const operations = [
        { operation: 'createCustomerTab', data: tabData }
      ];
      const data = await batchCustomerOperations(operations);
      const newTab = data.createdTab;
      setCustomerTabs(prevTabs => [...prevTabs, newTab]);
      return newTab;
    } catch (err) {
      console.error('Error adding customer tab:', err);
      setError('Failed to add customer tab. Please try again.');
      if (err.message === 'Authentication required' || (err.response && err.response.status === 401)) {
        logout();
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, logout]);

  const updateCustomerTabLimit = useCallback(async (customerId, newLimit) => {
    if (!isAuthenticated()) return;
    setIsLoading(true);
    setError(null);
    try {
      console.log(`Attempting to update tab limit for customer ${customerId} to ${newLimit}`);
      const response = await api.patch(`/customers/${customerId}/`, { tab_limit: newLimit });
      console.log('Update response:', response.data);
      setCustomers(prevCustomers => 
        prevCustomers.map(c => c.id === customerId ? { ...c, tab_limit: newLimit } : c)
      );
      setCustomerTabs(prevTabs => 
        prevTabs.map(tab => tab.customer_id === customerId ? { ...tab, tab_limit: newLimit } : tab)
      );
      return response.data;
    } catch (err) {
      console.error('Error updating customer tab limit:', err);
      setError('Failed to update customer tab limit. Please try again.');
      if (err.response && err.response.status === 401) {
        logout();
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, logout]);

  const refreshCustomerData = useCallback(async () => {
    await fetchCustomerData();
  }, [fetchCustomerData]);

  return (
    <CustomerContext.Provider value={{ 
      customers, 
      customerTabs, 
      addCustomer, 
      addCustomerTab, 
      refreshCustomerData,
      error,
      isLoading,
      updateCustomerTabLimit,
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