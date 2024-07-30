import React, { useEffect, useCallback, useState } from 'react';
import { useSales } from '../contexts/SalesContext';
import { useInventory } from '../contexts/InventoryContext';
import { useCustomer } from '../contexts/CustomerContext';
import { useAuth } from '../contexts/AuthContext';
import {
  Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  CircularProgress, Box, TextField, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert, Snackbar, IconButton,
  Card, CardContent, Grid, Tooltip, Skeleton
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { enUS } from 'date-fns/locale';
import { subDays } from 'date-fns';
import { AddCircle, RemoveCircle, Search, Refresh } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import ErrorAlert from './ErrorAlert';

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
      fontSize: '2rem',
      color: '#1976d2',
    },
    h6: {
      fontWeight: 'bold',
      fontSize: '1.5rem',
      color: '#1976d2',
    },
  },
  components: {
    MuiInputLabel: {
      styleOverrides: {
        root: {
          transform: 'translate(14px, 10px) scale(1)',
          '&.MuiInputLabel-shrink': {
            transform: 'translate(14px, -6px) scale(0.75)',
          },
        },
      },
    },
  },
});

const formatCost = (cost) => {
  if (cost === null || cost === undefined) return 'N/A';
  const numCost = typeof cost === 'string' ? parseFloat(cost) : cost;
  if (isNaN(numCost)) return 'N/A';
  return `₦${numCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const Sales = () => {
  const { user, checkAuth, logout } = useAuth();
  const {
    sales,
    loading,
    error: salesError,
    updatePaymentStatus,
    addMultipleSales,
    searchSales,
    summary,
    totalSalesCount,
    updateCustomerTabLimit,
    updateSaleCustomer
  } = useSales();
  const { inventoryItems = [] } = useInventory();
  const { customers, addCustomer } = useCustomer();
  const [newSales, setNewSales] = useState([{ item: '', quantity: 1, customer: '' }]);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone_number: '' });
  const [currentPage, setCurrentPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateFilter, setDateFilter] = useState('all');
  const [openNewCustomerDialog, setOpenNewCustomerDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 5;
  const [error, setError] = useState(null);
  const [openCustomerDialog, setOpenCustomerDialog] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  const displayError = salesError || error;

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const fetchSalesData = useCallback((page = 0, reset = false) => {
    if (!user) return;
    const newPage = reset ? 0 : page;
    const filters = {
      customer: searchTerm || undefined,
      start_date: startDate ? startDate.toISOString().split('T')[0] : undefined,
      end_date: endDate ? endDate.toISOString().split('T')[0] : undefined,
      period: dateFilter !== 'custom' ? dateFilter : undefined,
      page: newPage + 1,
      page_size: itemsPerPage
    };

    Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);

    console.log('Fetching sales with filters:', filters);
    searchSales(filters)
      .then((data) => {
        setHasNextPage(!!data.next);
        setHasPreviousPage(!!data.previous);
        setCurrentPage(newPage);
      })
      .catch((error) => {
        console.error('Error fetching sales:', error);
        setError('Failed to fetch sales. Please try again.');
        if (error.message === 'Authentication required' || (error.response && error.response.status === 401)) {
          logout();
        }
      });
  }, [searchSales, searchTerm, startDate, endDate, dateFilter, itemsPerPage, user, logout]);

  useEffect(() => {
    if (user) {
      fetchSalesData(0, true);
    }
  }, [fetchSalesData, user, startDate, endDate, dateFilter, searchTerm]);

  const handleUpdatePaymentStatus = async (saleId, newStatus) => {
    try {
      await updatePaymentStatus(saleId, newStatus);
      fetchSalesData(currentPage, true);
      setSnackbar({ open: true, message: 'Payment status updated successfully', severity: 'success' });
    } catch (error) {
      console.error('Failed to update payment status:', error);
      setError('Failed to update payment status. Please try again.');
    }
  };

  const handleAddSales = async () => {
    try {
      console.log('Attempting to add sales:', newSales);
      const salesData = newSales.map(sale => ({
        ...sale,
        customer: sale.customer || null,  
        recorded_by: user.id
      }));
      await addMultipleSales(salesData);
      setNewSales([{ item: '', quantity: 1, customer: '' }]);
      fetchSalesData(0, true);
      setSnackbar({ open: true, message: 'Sales added successfully', severity: 'success' });
    } catch (error) {
      console.error('Failed to add sales:', error);
      if (error.response && error.response.data) {
        console.error('Error response data:', error.response.data);
        let errorMessage = '';
        if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.non_field_errors) {
          errorMessage = error.response.data.non_field_errors[0];
        } else {
          errorMessage = 'Failed to add sales. Please try again.';
        }
        setError(errorMessage);
        setSnackbar({ open: true, message: errorMessage, severity: 'error' });
        
        if (errorMessage.includes("Insufficient inventory")) {
          const { item_name, available, requested } = error.response.data;
          setError(`Not enough ${item_name} in store. Available: ${available}, Requested: ${requested}`);
          setSnackbar({ open: true, message: `Insufficient inventory for ${item_name}`, severity: 'error' });
        } else if (errorMessage.includes("Tab limit exceeded")) {
          const { customer_name, current_limit, required_limit, customer_id } = error.response.data;
          console.log(`Tab limit exceeded for customer ${customer_name} (ID: ${customer_id}). Current limit: ${current_limit}, Required: ${required_limit}`);
          const shouldUpdate = window.confirm(
            `${customer_name} has reached their tab limit of ${formatCost(current_limit)}. ` +
            `This sale requires a limit of ${formatCost(required_limit)}. ` +
            `Would you like to update the tab limit?`
          );
          if (shouldUpdate) {
            try {
              console.log(`Attempting to update tab limit for customer ${customer_id} to ${required_limit}`);
              await updateCustomerTabLimit(customer_id, required_limit);
              console.log('Tab limit updated, retrying sale...');
              await addMultipleSales(newSales);
              setNewSales([{ item: '', quantity: 1 }]);
              fetchSalesData(0, true);
              setSnackbar({ open: true, message: 'Tab limit updated and sales added successfully', severity: 'success' });
            } catch (updateError) {
              console.error('Failed to update tab limit and add sales:', updateError);
              setError('Failed to update tab limit and add sales. Please try again.');
              setSnackbar({ open: true, message: 'Failed to update tab limit and add sales', severity: 'error' });
            }
          } else {
            setError(`Sale could not be completed because ${customer_name} has reached their tab limit.`);
            setSnackbar({ open: true, message: `Sale cancelled due to tab limit`, severity: 'warning' });
          }
        }
      } else {
        console.error('Unexpected error structure:', error);
        setError('An unexpected error occurred. Please try again.');
        setSnackbar({ open: true, message: 'An unexpected error occurred', severity: 'error' });
      }
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  const handleAddCustomer = async () => {
    try {
      const tabLimit = prompt("Enter tab limit for the new customer (optional):");
      const customerData = { ...newCustomer, tab_limit: tabLimit ? parseFloat(tabLimit) : 0 };
      const addedCustomer = await addCustomer(customerData);
      if (selectedSaleId) {
        await updateSaleCustomer(selectedSaleId, addedCustomer.id);
        fetchSalesData(currentPage, true);
      } else {
        setNewSales(newSales.map(sale => ({ ...sale, customer: addedCustomer.id })));
      }
      setNewCustomer({ name: '', phone_number: '' });
      setOpenNewCustomerDialog(false);
      setSnackbar({ open: true, message: 'Customer added successfully', severity: 'success' });
    } catch (error) {
      console.error('Failed to add customer:', error);
      setError('Failed to add customer. Please try again.');
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      fetchSalesData(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (hasPreviousPage) {
      fetchSalesData(currentPage - 1);
    }
  };

  const handleDateFilterChange = (filter) => {
    setDateFilter(filter);
    const today = new Date();
    switch (filter) {
      case 'all':
        setStartDate(null);
        setEndDate(null);
        break;
      case 'day':
        setStartDate(subDays(today, 1));
        setEndDate(today);
        break;
      case 'week':
        setStartDate(subDays(today, 7));
        setEndDate(today);
        break;
      case 'month':
        setStartDate(subDays(today, 30));
        setEndDate(today);
        break;
      case 'year':
        setStartDate(subDays(today, 365));
        setEndDate(today);
        break;
      default:
        break;
    }
    fetchSalesData(0, true);
  };

  const handleCustomDateChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
    setDateFilter('custom');
    fetchSalesData(0, true);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const addNewSaleField = () => {
    setNewSales([...newSales, { item: '', quantity: 1 }]);
  };

  const removeSaleField = (index) => {
    setNewSales(newSales.filter((_, i) => i !== index));
  };

  const handleSaleChange = (index, field, value) => {
    const updatedSales = [...newSales];
    updatedSales[index][field] = value;
    setNewSales(updatedSales);
  };

  const handleAddCustomerToSale = (saleId) => {
    setSelectedSaleId(saleId);
    setSelectedCustomerId('');
    setOpenCustomerDialog(true);
  };

  const handleCustomerSelection = async () => {
    if (selectedCustomerId === 'new') {
      setOpenNewCustomerDialog(true);
    } else if (selectedCustomerId) {
      try {
        await updateSaleCustomer(selectedSaleId, selectedCustomerId);
        fetchSalesData(currentPage, true);
        setSnackbar({ open: true, message: 'Customer added to sale successfully', severity: 'success' });
      } catch (error) {
        console.error('Failed to add customer to sale:', error);
        setError('Failed to add customer to sale. Please try again.');
      }
    }
    setOpenCustomerDialog(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enUS}>
        {!user ? (
          <Typography>Please log in to view sales.</Typography>
        ) : (
          <Box sx={{ padding: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
              Sales Report
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', mb: 2, alignItems: 'center' }}>
                      <TextField
                        label="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ mr: 2 }}
                        InputProps={{
                          startAdornment: (
                            <IconButton>
                              <Search />
                            </IconButton>
                          ),
                        }}
                      />
                      <FormControl sx={{ minWidth: 120, mr: 2 }}>
                        <InputLabel>Date Filter</InputLabel>
                        <Select value={dateFilter} onChange={(e) => handleDateFilterChange(e.target.value)}>
                          <MenuItem value="all">All time</MenuItem>
                          <MenuItem value="day">Last 24 hours</MenuItem>
                          <MenuItem value="week">Last 7 days</MenuItem>
                          <MenuItem value="month">Last 30 days</MenuItem>
                          <MenuItem value="year">Last Year</MenuItem>
                          <MenuItem value="custom">Custom</MenuItem>
                        </Select>
                      </FormControl>
                      {dateFilter === 'custom' && (
                        <>
                          <DatePicker
                            label="Start Date"
                            value={startDate}
                            onChange={(newDate) => handleCustomDateChange(newDate, endDate)}
                            renderInput={(params) => <TextField {...params} />}
                          />
                          <DatePicker
                            label="End Date"
                            value={endDate}
                            onChange={(newDate) => handleCustomDateChange(startDate, newDate)}
                            renderInput={(params) => <TextField {...params} sx={{ ml: 2 }} />}
                          />
                        </>
                      )}
                      <Tooltip title="Refresh sales data">
                        <IconButton onClick={() => fetchSalesData(currentPage, true)}>
                          <Refresh />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    
                    {loading ? (
                      <Skeleton variant="rectangular" width="100%" height={400} />
                    ) : (
                      <TableContainer component={Paper}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Item</TableCell>
                              <TableCell>Qty</TableCell>
                              <TableCell>Total</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Customer</TableCell>
                              <TableCell>Agent</TableCell>
                              <TableCell>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {sales.map((sale) => (
                              <TableRow key={sale.id}>
                                <TableCell>{sale.item_name}</TableCell>
                                <TableCell>{sale.quantity}</TableCell>
                                <TableCell>{formatCost(sale.total_amount)}</TableCell>
                                <TableCell>{sale.payment_status}</TableCell>
                                <TableCell>{sale.customer_name || 'N/A'}</TableCell>
                                <TableCell>{sale.recorded_by_username}</TableCell>
                                <TableCell>
                                  <Button 
                                    variant="contained"
                                    color={sale.payment_status === 'PENDING' ? 'error' : 'primary'}
                                    onClick={() => handleUpdatePaymentStatus(sale.id, sale.payment_status === 'PENDING' ? 'DONE' : 'PENDING')}
                                  >
                                    {sale.payment_status === 'PENDING' ? 'Mark as Paid' : 'Mark as Pending'}
                                  </Button>
                                  {!sale.customer_name && (
                                    <Button
                                      variant="outlined"
                                      onClick={() => handleAddCustomerToSale(sale.id)}
                                    >
                                      Add Customer
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card sx={{ mb: 4 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Summary
                    </Typography>
                    <Typography variant="body1">
                      Total Done: {formatCost(summary.total_done)}
                    </Typography>
                    <Typography variant="body1">
                      Total Pending: {formatCost(summary.total_pending)}
                    </Typography>
                    <Tooltip title="Refresh summary">
                      <IconButton onClick={() => fetchSalesData(currentPage, true)}>
                        <Refresh />
                      </IconButton>
                    </Tooltip>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Add New Sales
                    </Typography>
                    {newSales.map((sale, index) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <FormControl fullWidth margin="normal">
                          <InputLabel>Item</InputLabel>
                          <Select
                            value={sale.item}
                            onChange={(e) => handleSaleChange(index, 'item', e.target.value)}
                          >
                            {inventoryItems.map((item) => (
                              <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <TextField
                          fullWidth
                          label="Quantity"
                          type="number"
                          value={sale.quantity}
                          onChange={(e) => handleSaleChange(index, 'quantity', parseInt(e.target.value))}
                          margin="normal"
                        />
                        <IconButton onClick={() => removeSaleField(index)} color="secondary">
                          <RemoveCircle />
                        </IconButton>
                      </Box>
                    ))}
                    <Button onClick={addNewSaleField} variant="outlined" fullWidth startIcon={<AddCircle />} sx={{ mb: 2 }}>
                      Add Another Item
                    </Button>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Customer</InputLabel>
                      <Select
                        value={newSales[0].customer || ''}
                        onChange={(e) => setNewSales(newSales.map(sale => ({ ...sale, customer: e.target.value })))}
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {customers.map((customer) => (
                          <MenuItem key={customer.id} value={customer.id}>{customer.name}</MenuItem>
                        ))}
                        <MenuItem value="new">
                          <em>Add New Customer</em>
                        </MenuItem>
                      </Select>
                    </FormControl>
                    {newSales[0].customer === 'new' && (
                      <Button onClick={() => setOpenNewCustomerDialog(true)} fullWidth variant="outlined" sx={{ mt: 1 }}>
                        Add New Customer
                      </Button>
                    )}
                    <Tooltip title="Add new sales">
                      <Button onClick={handleAddSales} variant="contained" fullWidth sx={{ mt: 2 }} startIcon={<AddCircle />}>
                        Add Sales
                      </Button>
                    </Tooltip>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {sales.length > 0 && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Button onClick={handlePreviousPage} disabled={!hasPreviousPage}>Previous</Button>
                  <Button onClick={handleNextPage} disabled={!hasNextPage}>Next</Button>
                </Box>
                <Typography>
                  Showing {currentPage * itemsPerPage + 1} - {Math.min((currentPage + 1) * itemsPerPage, totalSalesCount)} of {totalSalesCount} sales
                </Typography>
              </>
            )}

            <Dialog open={openNewCustomerDialog} onClose={() => setOpenNewCustomerDialog(false)}>
              <DialogTitle>Add New Customer</DialogTitle>
              <DialogContent>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Name"
                  fullWidth
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                />
                <TextField
                  margin="dense"
                  label="Phone Number"
                  fullWidth
                  value={newCustomer.phone_number}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone_number: e.target.value })}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenNewCustomerDialog(false)}>Cancel</Button>
                <Button onClick={handleAddCustomer}>Add</Button>
              </DialogActions>
            </Dialog>
            <Dialog open={openCustomerDialog} onClose={() => setOpenCustomerDialog(false)}>
              <DialogTitle>Select or Add Customer</DialogTitle>
              <DialogContent>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Customer</InputLabel>
                  <Select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {customers.map((customer) => (
                      <MenuItem key={customer.id} value={customer.id}>{customer.name}</MenuItem>
                    ))}
                    <MenuItem value="new">
                      <em>Add New Customer</em>
                    </MenuItem>
                  </Select>
                </FormControl>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenCustomerDialog(false)}>Cancel</Button>
                <Button onClick={handleCustomerSelection}>Confirm</Button>
              </DialogActions>
            </Dialog>
            <ErrorAlert error={displayError} onClose={handleCloseError} />
            <Snackbar
              open={snackbar.open}
              autoHideDuration={6000}
              onClose={handleCloseSnackbar}
            >
              <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                {snackbar.message}
              </Alert>
            </Snackbar>
            {loading && (
              <Box sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                zIndex: 9999,
              }}>
                <CircularProgress />
              </Box>
            )}
          </Box>
        )}
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default Sales;
