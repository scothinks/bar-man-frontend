import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getInventoryItems, createInventoryItem } from '../services/api';
import { useAuth } from './AuthContext';

const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { logout } = useAuth();

  const fetchInventoryItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getInventoryItems();
      console.log('API Response:', response.data);
      const items = response.data.results || response.data; // Handle both paginated and non-paginated responses
      const formattedItems = Array.isArray(items) 
        ? items.map(item => ({
            ...item,
            cost: typeof item.cost === 'string' ? parseFloat(item.cost) : item.cost
          }))
        : [];
      console.log('Formatted Items:', formattedItems);
      setInventoryItems(formattedItems);
      setError(null);
    } catch (err) {
      console.error('Error fetching inventory items:', err);
      if (err.response && err.response.status === 401) {
        logout();
        setError('Session expired. Please login again.');
      } else {
        setError(`Failed to fetch inventory items: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [logout]);

  const addInventoryItem = useCallback(async (newItem) => {
    try {
      setLoading(true);
      const itemToAdd = {
        ...newItem,
        cost: typeof newItem.cost === 'string' ? parseFloat(newItem.cost) : newItem.cost
      };
      console.log('Adding item:', itemToAdd);
      const response = await createInventoryItem(itemToAdd);
      console.log('API Response for new item:', response.data);
      setInventoryItems(prevItems => {
        const updatedItems = [...prevItems, response.data];
        console.log('Updated inventory items:', updatedItems);
        return updatedItems;
      });
      setError(null);
      return response.data;
    } catch (err) {
      console.error('Error adding inventory item:', err);
      if (err.response && err.response.status === 401) {
        logout();
        setError('Session expired. Please login again.');
      } else {
        setError(`Failed to add inventory item: ${err.message}`);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [logout]);

  const refreshInventory = useCallback(() => {
    fetchInventoryItems();
  }, [fetchInventoryItems]);

  useEffect(() => {
    fetchInventoryItems();
  }, [fetchInventoryItems]);

  useEffect(() => {
    console.log('Current inventory items:', inventoryItems);
  }, [inventoryItems]);

  return (
    <InventoryContext.Provider value={{ 
      inventoryItems, 
      loading, 
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