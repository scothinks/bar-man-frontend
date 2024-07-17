import React, { useState, useEffect } from 'react';
import { useCustomer } from '../contexts/CustomerContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  Typography, TextField, Button, CircularProgress, Alert, Snackbar, Box
} from '@mui/material';

const CustomerTabs = () => {
  const { user, checkAuth, logout } = useAuth();
  const { customers, customerTabs, addCustomer, fetchCustomers, fetchCustomerTabs } = useCustomer();
  const [newCustomer, setNewCustomer] = useState({ name: '', phone_number: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        await Promise.all([fetchCustomers(), fetchCustomerTabs()]);
        setSnackbar({ open: true, message: 'Data fetched successfully', severity: 'success' });
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data. Please try again.');
        setSnackbar({ open: true, message: 'Failed to fetch data. Please try again.', severity: 'error' });
        if (err.message === 'Authentication required' || (err.response && err.response.status === 401)) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, fetchCustomers, fetchCustomerTabs, logout]);

  const handleAddCustomer = async () => {
    try {
      await addCustomer(newCustomer);
      setNewCustomer({ name: '', phone_number: '' });
      await fetchCustomers();
      setSnackbar({ open: true, message: 'Customer added successfully', severity: 'success' });
    } catch (error) {
      console.error('Failed to add customer:', error);
      setSnackbar({ open: true, message: 'Failed to add customer. Please try again.', severity: 'error' });
      if (error.message === 'Authentication required' || (error.response && error.response.status === 401)) {
        logout();
      }
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  if (!user) return <Typography>Please log in to view customer tabs.</Typography>;
  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
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
      <Box component="form" onSubmit={(e) => { e.preventDefault(); handleAddCustomer(); }}>
        <TextField
          fullWidth
          label="Name"
          value={newCustomer.name}
          onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Phone Number"
          value={newCustomer.phone_number}
          onChange={(e) => setNewCustomer({ ...newCustomer, phone_number: e.target.value })}
          margin="normal"
          required
        />
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleAddCustomer}
          disabled={!newCustomer.name || !newCustomer.phone_number}
        >
          Add Customer
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CustomerTabs;