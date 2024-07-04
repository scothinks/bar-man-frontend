import React, { useState } from 'react';
import { useCustomer } from '../contexts/CustomerContext';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, TextField, Button } from '@mui/material';

const CustomerTabs = () => {
  const { customerTabs, addCustomerTab } = useCustomer();
  const [newCustomer, setNewCustomer] = useState({ name: '', phone_number: '' });

  const handleAddCustomer = async () => {
    try {
      await addCustomerTab(newCustomer);
      setNewCustomer({ name: '', phone_number: '' });
    } catch (error) {
      console.error('Failed to add customer:', error);
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>Customer Tabs</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Phone Number</TableCell>
              <TableCell align="right">Amount (₦)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customerTabs.map((tab) => (
              <TableRow key={tab.id}>
                <TableCell>{tab.customer_name}</TableCell>
                <TableCell>{tab.customer.phone_number}</TableCell>
                <TableCell align="right">{tab.amount}</TableCell>
              </TableRow>
            ))}
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