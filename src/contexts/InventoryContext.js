import React, { createContext, useContext, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getInventoryItems, createInventoryItem } from '../services/api';
import { useAuth } from './AuthContext';

const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
  const { logout, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: inventoryItems = [],
    isLoading,
    error,
    refetch: fetchInventoryItems,
  } = useQuery('inventoryItems', getInventoryItems, {
    enabled: false, // We'll manually enable this query
    onError: (err) => {
      console.error('Error fetching inventory items:', err);
      if (err.message === 'Authentication required' || (err.response && err.response.status === 401)) {
        logout();
      }
    },
    select: (data) => {
      const items = data.results || data;
      return Array.isArray(items)
        ? items.map(item => ({
            ...item,
            cost: typeof item.cost === 'string' ? parseFloat(item.cost) : item.cost
          }))
        : [];
    },
  });

  // Use useEffect to fetch inventory items when authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      fetchInventoryItems();
    }
  }, [isAuthenticated, fetchInventoryItems]);

  const addItemMutation = useMutation(createInventoryItem, {
    onSuccess: (data) => {
      queryClient.setQueryData('inventoryItems', (oldData) => [...(oldData || []), data]);
    },
    onError: (err) => {
      console.error('Error adding inventory item:', err);
      if (err.message === 'Authentication required' || (err.response && err.response.status === 401)) {
        logout();
      }
    },
  });

  const addInventoryItem = useCallback(async (newItem) => {
    const itemToAdd = {
      ...newItem,
      cost: typeof newItem.cost === 'string' ? parseFloat(newItem.cost) : newItem.cost
    };
    return addItemMutation.mutateAsync(itemToAdd);
  }, [addItemMutation]);

  const refreshInventory = useCallback(() => {
    if (isAuthenticated()) {
      queryClient.invalidateQueries('inventoryItems');
    }
  }, [queryClient, isAuthenticated]);

  return (
    <InventoryContext.Provider value={{ 
      inventoryItems, 
      isLoading, 
      error, 
      fetchInventoryItems, 
      addInventoryItem,
      refreshInventory
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};