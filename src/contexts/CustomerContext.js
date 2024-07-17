import React, { createContext, useContext, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getCustomers, createCustomer, getCustomerTabs, createCustomerTab } from '../services/api';
import { useAuth } from './AuthContext';

const CustomerContext = createContext();

export const CustomerProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const { logout, isAuthenticated } = useAuth();
  

  const {
    data: customers = [],
    isLoading: customersLoading,
    error: customersError,
  } = useQuery('customers', getCustomers, {
    enabled: isAuthenticated(),
    onError: (err) => {
      console.error('Error fetching customers:', err);
      if (err.message === 'Authentication required' || (err.response && err.response.status === 401)) {
        logout();
      }
    },
  });

  const {
    data: customerTabs = [],
    isLoading: customerTabsLoading,
    error: customerTabsError,
  } = useQuery('customerTabs', getCustomerTabs, {
    enabled: isAuthenticated(),
    onError: (err) => {
      console.error('Error fetching customer tabs:', err);
      if (err.message === 'Authentication required' || (err.response && err.response.status === 401)) {
        logout();
      }
    },
  });

  const addCustomerMutation = useMutation(createCustomer, {
    onSuccess: (newCustomer) => {
      queryClient.setQueryData('customers', (oldCustomers) => [...(oldCustomers || []), newCustomer]);
    },
    onError: (err) => {
      console.error('Error adding customer:', err);
      if (err.message === 'Authentication required' || (err.response && err.response.status === 401)) {
        logout();
      }
    },
  });

  const addCustomerTabMutation = useMutation(createCustomerTab, {
    onSuccess: (newTab) => {
      queryClient.setQueryData('customerTabs', (oldTabs) => [...(oldTabs || []), newTab]);
    },
    onError: (err) => {
      console.error('Error adding customer tab:', err);
      if (err.message === 'Authentication required' || (err.response && err.response.status === 401)) {
        logout();
      }
    },
  });

  const addCustomer = useCallback((customerData) => addCustomerMutation.mutateAsync(customerData), [addCustomerMutation]);
  const addCustomerTab = useCallback((tabData) => addCustomerTabMutation.mutateAsync(tabData), [addCustomerTabMutation]);

  const fetchCustomers = useCallback(() => {
    queryClient.invalidateQueries('customers');
  }, [queryClient]);

  const fetchCustomerTabs = useCallback(() => {
    queryClient.invalidateQueries('customerTabs');
  }, [queryClient]);

  return (
    <CustomerContext.Provider value={{ 
      customers, 
      customerTabs, 
      addCustomer, 
      addCustomerTab, 
      fetchCustomers, 
      fetchCustomerTabs,
      error: customersError || customerTabsError,
      isLoading: customersLoading || customerTabsLoading,
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