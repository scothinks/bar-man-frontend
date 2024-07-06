import React, { createContext, useContext, useState } from 'react';
import { createSale } from '../services/api';

const SalesContext = createContext();

export const SalesProvider = ({ children }) => {
  const [sales, setSales] = useState([]);

  const addSale = async (saleData) => {
    try {
      const response = await createSale(saleData);
      setSales([...sales, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error adding sale:', error);
      throw error;
    }
  };

  return (
    <SalesContext.Provider value={{ sales, addSale }}>
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