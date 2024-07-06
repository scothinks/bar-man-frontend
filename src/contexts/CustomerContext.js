import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCustomerTabs, createCustomerTab } from '../services/api';

const CustomerContext = createContext();

export const CustomerProvider = ({ children }) => {
  const [customerTabs, setCustomerTabs] = useState([]);

  useEffect(() => {
    fetchCustomerTabs();
  }, []);

  const fetchCustomerTabs = async () => {
    try {
      const response = await getCustomerTabs();
      setCustomerTabs(response.data);
    } catch (error) {
      console.error('Error fetching customer tabs:', error);
    }
  };

  const addCustomerTab = async (tabData) => {
    try {
      const response = await createCustomerTab(tabData);
      setCustomerTabs([...customerTabs, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error adding customer tab:', error);
      throw error;
    }
  };

  return (
    <CustomerContext.Provider value={{ customerTabs, addCustomerTab }}>
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