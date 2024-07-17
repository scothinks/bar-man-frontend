import React, { createContext, useContext, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { createMultipleSales, updateSalePaymentStatus, getCustomers, createCustomer, createCustomerTab, getSales } from '../services/api';
import { useAuth } from './AuthContext';

const SalesContext = createContext();

export const SalesProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const { logout, isAuthenticated } = useAuth();

  const {
    data: salesData = { sales: [], summary: { total_done: 0, total_pending: 0 }, count: 0 },
    isLoading: salesLoading,
    error: salesError,
    refetch: refetchSales,
  } = useQuery(['sales'], () => getSales({ limit: 5, page: 1 }), {
    enabled: isAuthenticated(),
    onError: (err) => {
      console.error('Error fetching sales:', err);
      if (err.message === 'Authentication required' || (err.response && err.response.status === 401)) {
        logout();
      }
    },
  });

  const {
    data: customers = [],
    isLoading: customersLoading,
    error: customersError,
  } = useQuery(['customers'], getCustomers, {
    enabled: isAuthenticated(),
    onError: (err) => {
      console.error('Error fetching customers:', err);
      if (err.message === 'Authentication required' || (err.response && err.response.status === 401)) {
        logout();
      }
    },
  });

  const addMultipleSalesMutation = useMutation(createMultipleSales, {
    onSuccess: () => {
      queryClient.invalidateQueries('sales');
    },
    onError: (err) => {
      console.error('Error adding sales:', err);
      if (err.message === 'Authentication required' || (err.response && err.response.status === 401)) {
        logout();
      }
    },
  });

  const updatePaymentStatusMutation = useMutation(
    ({ saleId, status }) => updateSalePaymentStatus(saleId, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('sales');
      },
      onError: (err) => {
        console.error('Error updating payment status:', err);
        if (err.message === 'Authentication required' || (err.response && err.response.status === 401)) {
          logout();
        }
      },
    }
  );

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
    onError: (err) => {
      console.error('Error creating customer tab:', err);
      if (err.message === 'Authentication required' || (err.response && err.response.status === 401)) {
        logout();
      }
    },
  });

  const addMultipleSales = useCallback((salesData) => addMultipleSalesMutation.mutateAsync(salesData), [addMultipleSalesMutation]);
  const updatePaymentStatus = useCallback((saleId, status) => updatePaymentStatusMutation.mutateAsync({ saleId, status }), [updatePaymentStatusMutation]);
  const addCustomer = useCallback((customerData) => addCustomerMutation.mutateAsync(customerData), [addCustomerMutation]);
  const addCustomerTab = useCallback((tabData) => addCustomerTabMutation.mutateAsync(tabData), [addCustomerTabMutation]);

  const refreshSales = useCallback(() => {
    queryClient.invalidateQueries('sales');
  }, [queryClient]);

  const refreshCustomers = useCallback(() => {
    queryClient.invalidateQueries('customers');
  }, [queryClient]);

  return (
    <SalesContext.Provider value={{ 
      sales: salesData.sales,
      customers,
      loading: salesLoading || customersLoading,
      error: salesError || customersError,
      summary: salesData.summary,
      addMultipleSales,
      updatePaymentStatus,
      fetchCustomers: refreshCustomers,
      fetchSales: refetchSales,
      addCustomer,
      addCustomerTab,
      refreshSales,
      totalSalesCount: salesData.count,
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
