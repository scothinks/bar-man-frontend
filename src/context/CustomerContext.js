import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCustomerTabs, createCustomerTab } from '../services/api';

const CustomerContext = createContext();

export const CustomerProvider = ({ children }) => {
  const [customerTabs, setCustomerTabs] = useState([]);

  const fetchCustomerTabs = async () => {
    try {
      const response = await getCustomerTabs();
      setCustomerTabs(response.data);
    } catch (error) {
      console.error('Failed to fetch customer tabs:', error);
    }
  };

  const addCustomerTab = async (tabData) => {
    try {
      const response = await createCustomerTab(tabData);
      setCustomerTabs([...customerTabs, response.data]);
    } catch (error) {
      console.error('Failed to create customer tab:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchCustomerTabs();
  }, []);

  return (
    <CustomerContext.Provider value={{ customerTabs, addCustomerTab, fetchCustomerTabs }}>
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = () => useContext(CustomerContext);