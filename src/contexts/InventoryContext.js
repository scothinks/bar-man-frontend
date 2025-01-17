import React, { createContext, useContext, useCallback, useState } from 'react';
import { 
  getInventoryItems, 
  createInventoryItem, 
  updateInventoryItem as apiUpdateInventoryItem, 
  deleteInventoryItem as apiDeleteInventoryItem,
  confirmDeleteInventoryItem as apiConfirmDeleteInventoryItem,
  restoreInventoryItem as apiRestoreInventoryItem
} from '../services/api';
import { useAuth } from './AuthContext';

const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
  const { logout, isAuthenticated } = useAuth();
  const [inventoryItems, setInventoryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInventoryItems = useCallback(async (includeDeleted = false) => {
    if (!isAuthenticated()) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getInventoryItems(includeDeleted);
      console.log('Raw API response:', JSON.stringify(data, null, 2));
      const items = data.results || data;
      const formattedItems = Array.isArray(items)
        ? items.map(item => ({
            ...item,
            cost: typeof item.cost === 'string' ? parseFloat(item.cost) : item.cost,
            is_deleted: item.is_deleted === true || item.is_deleted === 'true',
          }))
        : [];
      console.log('Formatted inventory items:', JSON.stringify(formattedItems, null, 2));
      setInventoryItems(formattedItems);
    } catch (err) {
      console.error('Error fetching inventory items:', err);
      setError('Failed to fetch inventory items. Please try again.');
      if (err.message === 'Authentication required' || (err.response && err.response.status === 401)) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, logout]);

  const addInventoryItem = useCallback(async (newItem) => {
    if (!isAuthenticated()) return;
    setIsLoading(true);
    try {
      const itemToAdd = {
        ...newItem,
        cost: typeof newItem.cost === 'string' ? parseFloat(newItem.cost) : newItem.cost
      };
      const addedItem = await createInventoryItem(itemToAdd);
      setInventoryItems(prevItems => [...prevItems, addedItem]);
      return addedItem;
    } catch (err) {
      console.error('Error adding inventory item:', err);
      setError('Failed to add inventory item. Please try again.');
      if (err.message === 'Authentication required' || (err.response && err.response.status === 401)) {
        logout();
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, logout]);

  const updateInventoryItem = useCallback(async (id, updatedItem) => {
    if (!isAuthenticated()) return;
    setIsLoading(true);
    try {
      const updated = await apiUpdateInventoryItem(id, updatedItem);
      setInventoryItems(prevItems => prevItems.map(item => item.id === id ? updated : item));
      return updated;
    } catch (err) {
      console.error('Error updating inventory item:', err);
      setError('Failed to update inventory item. Please try again.');
      if (err.message === 'Authentication required' || (err.response && err.response.status === 401)) {
        logout();
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, logout]);

  const deleteInventoryItem = useCallback(async (id) => {
    if (!isAuthenticated()) return;
    setIsLoading(true);
    try {
      await apiDeleteInventoryItem(id);
      setInventoryItems(prevItems => prevItems.map(item => 
        item.id === id ? { ...item, is_deleted: true } : item
      ));
    } catch (err) {
      console.error('Error deleting inventory item:', err);
      setError('Failed to delete inventory item. Please try again.');
      if (err.message === 'Authentication required' || (err.response && err.response.status === 401)) {
        logout();
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, logout]);

  const confirmDeleteInventoryItem = useCallback(async (id) => {
    if (!isAuthenticated()) return;
    setIsLoading(true);
    try {
      await apiConfirmDeleteInventoryItem(id);
      setInventoryItems(prevItems => prevItems.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error confirming deletion of inventory item:', err);
      setError('Failed to confirm deletion of inventory item. Please try again.');
      if (err.message === 'Authentication required' || (err.response && err.response.status === 401)) {
        logout();
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, logout]);

  const restoreInventoryItem = useCallback(async (id) => {
    if (!isAuthenticated()) return;
    setIsLoading(true);
    try {
      const restored = await apiRestoreInventoryItem(id);
      setInventoryItems(prevItems => prevItems.map(item => 
        item.id === id ? { ...restored, is_deleted: false } : item
      ));
      return restored;
    } catch (err) {
      console.error('Error restoring inventory item:', err);
      setError('Failed to restore inventory item. Please try again.');
      if (err.message === 'Authentication required' || (err.response && err.response.status === 401)) {
        logout();
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, logout]);

  const refreshInventory = useCallback((includeDeleted = false) => {
    if (isAuthenticated()) {
      fetchInventoryItems(includeDeleted);
    }
  }, [isAuthenticated, fetchInventoryItems]);

  return (
    <InventoryContext.Provider value={{ 
      inventoryItems, 
      isLoading, 
      error, 
      fetchInventoryItems, 
      addInventoryItem,
      updateInventoryItem,
      deleteInventoryItem,
      confirmDeleteInventoryItem,
      restoreInventoryItem,
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