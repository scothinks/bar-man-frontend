import React, { createContext, useState, useContext } from 'react';
import { createSale } from '../services/api';

const SalesContext = createContext();

export const SalesProvider = ({ children }) => {
  const [sales, setSales] = useState([]);

  const addSale = async (saleData) => {
    try {
      const response = await createSale(saleData);
      setSales([...sales, response.data]);
    } catch (error) {
      console.error('Failed to create sale:', error);
      throw error;
    }
  };

  return (
    <SalesContext.Provider value={{ sales, addSale }}>
      {children}
    </SalesContext.Provider>
  );
};

export const useSales = () => useContext(SalesContext);