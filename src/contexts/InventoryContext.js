import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getInventoryItems } from '../services/api';
import { useAuth } from './AuthContext';

const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { logout } = useAuth();

  const fetchInventoryItems = useCallback(async (retryCount = 0) => {
    try {
      setLoading(true);
      const response = await getInventoryItems();
      setInventoryItems(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching inventory items:', err);
      if (err.response && err.response.status === 401) {
        logout();
        setError('Session expired. Please login again.');
      } else if (err.response && err.response.status === 429 && retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        console.log(`Rate limited. Retrying in ${delay}ms...`);
        setTimeout(() => fetchInventoryItems(retryCount + 1), delay);
        return; // Exit the function to prevent setting loading to false
      } else {
        setError(`Failed to fetch inventory items: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    fetchInventoryItems();
  }, [fetchInventoryItems]);

  return (
    <InventoryContext.Provider value={{ inventoryItems, loading, error, fetchInventoryItems }}>
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