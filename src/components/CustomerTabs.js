import React, { useState, useEffect, useCallback } from 'react';
import { useCustomer } from '../contexts/CustomerContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  Typography, TextField, Button, CircularProgress, Alert, Snackbar, Box, Dialog, DialogActions, DialogContent, DialogTitle,
  Card, CardContent, Grid, Tooltip, Skeleton, IconButton
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h4: {
      fontWeight: 'bold',
      color: '#1976d2',
    },
    h5: {
      fontWeight: 'bold',
      color: '#1976d2',
    },
    h6: {
      fontWeight: 'bold',
      color: '#1976d2',
    },
  },
});

const CustomerTabs = () => {
  const { user, checkAuth } = useAuth();
  const { customers, customerTabs, addCustomer, refreshCustomerData, updateCustomerTabLimit, error: customerError, isLoading: customerLoading } = useCustomer();
  const [newCustomer, setNewCustomer] = useState({ name: '', phone_number: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [newTabLimit, setNewTabLimit] = useState('');

  const initializeData = useCallback(async () => {
    await checkAuth();
    if (user) {
      await refreshCustomerData();
    }
  }, [checkAuth, user, refreshCustomerData]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user) {
      refreshCustomerData();
    }
  }, [user, refreshCustomerData]);

  useEffect(() => {
    console.log('Customers:', customers);
    console.log('Customer Tabs:', customerTabs);
  }, [customers, customerTabs]);

  const handleRefresh = () => {
    refreshCustomerData();
  };

  const handleAddCustomer = async () => {
    try {
      await addCustomer(newCustomer);
      setNewCustomer({ name: '', phone_number: '' });
      refreshCustomerData();
      setSnackbar({ open: true, message: 'Customer added successfully', severity: 'success' });
    } catch (error) {
      console.error('Failed to add customer:', error);
      setSnackbar({ open: true, message: 'Failed to add customer. Please try again.', severity: 'error' });
    }
  };

  const handleOpenDialog = (tab) => {
    setSelectedCustomer({
      id: tab.customer_id, 
      name: tab.customer_name
    });
    setNewTabLimit(tab.tab_limit ? tab.tab_limit.toString() : '0');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedCustomer(null);
    setNewTabLimit('');
  };
  
  const handleUpdateTabLimit = async () => {
    try {
      console.log(`Updating tab limit for customer ${selectedCustomer.id} to ${newTabLimit}`);
      await updateCustomerTabLimit(selectedCustomer.id, parseFloat(newTabLimit));
      setSnackbar({ open: true, message: 'Tab limit updated successfully', severity: 'success' });
      handleCloseDialog();
      await refreshCustomerData();
      console.log('Customer data after refresh:', customers, customerTabs);
    } catch (error) {
      console.error('Failed to update tab limit:', error);
      setSnackbar({ open: true, message: 'Failed to update tab limit. Please try again.', severity: 'error' });
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(value);
  };

  if (!user) return <Typography>Please log in to view customer tabs.</Typography>;
  if (customerLoading) return <CircularProgress />;
  if (customerError) return <Alert severity="error">{customerError}</Alert>;

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ padding: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4">Customers and Tabs</Typography>
          <Tooltip title="Refresh customer data">
            <Button
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              variant="outlined"
            >
              Refresh Data
            </Button>
          </Tooltip>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>Customers</Typography>
                {customerLoading ? (
                  <Skeleton variant="rectangular" width="100%" height={200} />
                ) : (
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
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>Customer Tabs</Typography>
                {customerLoading ? (
                  <Skeleton variant="rectangular" width="100%" height={200} />
                ) : (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Customer Name</TableCell>
                          <TableCell align="right">Amount (₦)</TableCell>
                          <TableCell align="right">Tab Limit (₦)</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Array.isArray(customerTabs) && customerTabs.length > 0 ? (
                          customerTabs.map((tab) => (
                            <TableRow key={tab.id}>
                              <TableCell>{tab.customer_name}</TableCell>
                              <TableCell align="right">{formatCurrency(tab.amount)}</TableCell>
                              <TableCell align="right">{tab.tab_limit ? formatCurrency(tab.tab_limit) : 'Not set'}</TableCell>
                              <TableCell align="right">
                                <Tooltip title="Update Tab Limit">
                                  <IconButton onClick={() => handleOpenDialog(tab)}>
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4}>No customer tabs found</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Add New Customer</Typography>
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
                  <Tooltip title="Add a new customer">
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={handleAddCustomer}
                      disabled={!newCustomer.name || !newCustomer.phone_number}
                      startIcon={<PersonAddIcon />}
                    >
                      Add Customer
                    </Button>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Dialog open={dialogOpen} onClose={handleCloseDialog}>
          <DialogTitle>Update Tab Limit</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="New Tab Limit"
              type="number"
              fullWidth
              value={newTabLimit}
              onChange={(e) => setNewTabLimit(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleUpdateTabLimit}>Update</Button>
          </DialogActions>
        </Dialog>

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
    </ThemeProvider>
  );
};

export default CustomerTabs;
