import React, { useState, useEffect } from 'react';
import { useCustomer } from '../contexts/CustomerContext';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, TextField, Button, CircularProgress } from '@mui/material';

const CustomerTabs = () => {
  const { customers, customerTabs, addCustomer, fetchCustomers, fetchCustomerTabs } = useCustomer();
  const [newCustomer, setNewCustomer] = useState({ name: '', phone_number: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchCustomers(), fetchCustomerTabs()]);
      setLoading(false);
    };
    fetchData();
  }, [fetchCustomers, fetchCustomerTabs]);

  const handleAddCustomer = async () => {
    try {
      await addCustomer(newCustomer);
      setNewCustomer({ name: '', phone_number: '' });
    } catch (error) {
      console.error('Failed to add customer:', error);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>Customers</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Phone Number</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(customers) && customers.length > 0 ? (
              customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.phone_number}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2}>No customers found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h4" gutterBottom style={{ marginTop: '20px' }}>Customer Tabs</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Customer Name</TableCell>
              <TableCell align="right">Amount (₦)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(customerTabs) && customerTabs.length > 0 ? (
              customerTabs.map((tab) => (
                <TableRow key={tab.id}>
                  <TableCell>{tab.customer_name}</TableCell>
                  <TableCell align="right">{tab.amount}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2}>No customer tabs found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h6" gutterBottom style={{ marginTop: '20px' }}>Add New Customer</Typography>
      <TextField
        fullWidth
        label="Name"
        value={newCustomer.name}
        onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
        margin="normal"
      />
      <TextField
        fullWidth
        label="Phone Number"
        value={newCustomer.phone_number}
        onChange={(e) => setNewCustomer({ ...newCustomer, phone_number: e.target.value })}
        margin="normal"
      />
      <Button variant="contained" color="primary" onClick={handleAddCustomer}>
        Add Customer
      </Button>
    </div>
  );
};

export default CustomerTabs;