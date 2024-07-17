import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { useSales } from '../contexts/SalesContext';
import { useInventory } from '../contexts/InventoryContext';
import { useCustomer } from '../contexts/CustomerContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Button, Typography, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  CircularProgress, Box, TextField, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert, Snackbar, IconButton
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { enUS } from 'date-fns/locale';
import { subDays } from 'date-fns';
import { AddCircle, RemoveCircle } from '@mui/icons-material';

const formatCost = (cost) => {
  if (cost === null || cost === undefined) return 'N/A';
  const numCost = typeof cost === 'string' ? parseFloat(cost) : cost;
  if (isNaN(numCost)) return 'N/A';
  return `₦${numCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const Sales = () => {
  const { user, checkAuth, logout } = useAuth();
  const { 
    sales = [], 
    loading, 
    error, 
    updatePaymentStatus, 
    fetchSales, 
    summary,
    addMultipleSales,
    totalSalesCount
  } = useSales();
  const { inventoryItems = [] } = useInventory();
  const { customers, addCustomer } = useCustomer();
  const [newSales, setNewSales] = useState([{ item: '', quantity: 1 }]);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone_number: '' });
  const [currentPage, setCurrentPage] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateFilter, setDateFilter] = useState('all');
  const [openNewCustomerDialog, setOpenNewCustomerDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const itemsPerPage = 5;

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const fetchSalesData = useCallback((reset = false) => {
    if (!user) return;
    const newPage = reset ? 0 : currentPage;
    const filters = {
      start_date: startDate ? startDate.toISOString().split('T')[0] : null,
      end_date: endDate ? endDate.toISOString().split('T')[0] : null,
      offset: newPage * itemsPerPage,
      limit: itemsPerPage
    };
    console.log('Fetching sales with filters:', filters);
    fetchSales(filters, reset).catch((error) => {
      console.error('Error fetching sales:', error);
      setSnackbar({ open: true, message: 'Failed to fetch sales. Please try again.', severity: 'error' });
      if (error.message === 'Authentication required' || (error.response && error.response.status === 401)) {
        logout();
      }
    });
    if (reset) {
      setCurrentPage(0);
    }
  }, [fetchSales, startDate, endDate, currentPage, itemsPerPage, user, logout]);

  useEffect(() => {
    if (user) {
      fetchSalesData(true);
    }
  }, [fetchSalesData, user, startDate, endDate, dateFilter]);

  const handleUpdatePaymentStatus = async (saleId, newStatus) => {
    try {
      await updatePaymentStatus(saleId, newStatus);
      fetchSalesData(true);
      setSnackbar({ open: true, message: 'Payment status updated successfully', severity: 'success' });
    } catch (error) {
      console.error('Failed to update payment status:', error);
      setSnackbar({ open: true, message: 'Failed to update payment status. Please try again.', severity: 'error' });
      if (error.message === 'Authentication required' || (error.response && error.response.status === 401)) {
        logout();
      }
    }
  };

  const handleAddSales = async () => {
    try {
      await addMultipleSales(newSales);
      setNewSales([{ item: '', quantity: 1 }]);
      setCurrentPage(0);
      fetchSalesData(true);
      setSnackbar({ open: true, message: 'Sales added successfully', severity: 'success' });
    } catch (error) {
      console.error('Failed to add sales:', error);
      setSnackbar({ open: true, message: 'Failed to add sales. Please try again.', severity: 'error' });
      if (error.message === 'Authentication required' || (error.response && error.response.status === 401)) {
        logout();
      }
    }
  };

  const handleAddCustomer = async () => {
    try {
      const addedCustomer = await addCustomer(newCustomer);
      setNewSales(newSales.map(sale => ({ ...sale, customer: addedCustomer.id })));
      setNewCustomer({ name: '', phone_number: '' });
      setOpenNewCustomerDialog(false);
      setSnackbar({ open: true, message: 'Customer added successfully', severity: 'success' });
    } catch (error) {
      console.error('Failed to add customer:', error);
      setSnackbar({ open: true, message: 'Failed to add customer. Please try again.', severity: 'error' });
      if (error.message === 'Authentication required' || (error.response && error.response.status === 401)) {
        logout();
      }
    }
  };

  const handleNextPage = () => {
    setCurrentPage(prev => prev + 1);
    fetchSalesData(false);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
    fetchSalesData(false);
  };

  const handleDateFilterChange = (filter) => {
    setDateFilter(filter);
    const today = new Date();
    switch (filter) {
      case 'all':
        setStartDate(null);
        setEndDate(null);
        break;
      case 'yesterday':
        setStartDate(subDays(today, 1));
        setEndDate(subDays(today, 1));
        break;
      case 'last7':
        setStartDate(subDays(today, 7));
        setEndDate(today);
        break;
      case 'last30':
        setStartDate(subDays(today, 30));
        setEndDate(today);
        break;
      case 'last90':
        setStartDate(subDays(today, 90));
        setEndDate(today);
        break;
      default:
        // 'custom' - do nothing, let user select dates
        break;
    }
    fetchSalesData(true);
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

  const filteredSales = useMemo(() => {
  return sales.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);
}, [sales, currentPage, itemsPerPage]);

  if (!user) return <Typography>Please log in to view sales.</Typography>;
  if (loading && sales.length === 0) return <CircularProgress />;
  if (error) return <Alert severity="error">Error: {error}</Alert>;

  const hasMoreSales = filteredSales.length === itemsPerPage;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enUS}>
      <Box sx={{ display: 'flex', flexDirection: 'row', height: '100vh', padding: 2 }}>
        <Box sx={{ flexGrow: 1, overflowY: 'auto', mr: 2 }}>
          <Typography variant="h4" gutterBottom>Sales List</Typography>
          <Typography variant="h6" gutterBottom>
            Total Done: {formatCost(summary.total_done)} | Total Pending: {formatCost(summary.total_pending)}
          </Typography>
          <Box sx={{ display: 'flex', mb: 2, alignItems: 'center' }}>
            <FormControl sx={{ minWidth: 120, mr: 2 }}>
              <InputLabel>Date Filter</InputLabel>
              <Select value={dateFilter} onChange={(e) => handleDateFilterChange(e.target.value)}>
                <MenuItem value="all">All time</MenuItem>
                <MenuItem value="yesterday">Yesterday</MenuItem>
                <MenuItem value="last7">Last 7 days</MenuItem>
                <MenuItem value="last30">Last 30 days</MenuItem>
                <MenuItem value="last90">Last 90 days</MenuItem>
                <MenuItem value="custom">Custom</MenuItem>
              </Select>
            </FormControl>
            {dateFilter === 'custom' && (
              <>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newDate) => {
                    setStartDate(newDate);
                    setCurrentPage(0);
                    fetchSalesData(true);
                  }}
                  renderInput={(params) => <TextField {...params} />}
                />
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newDate) => {
                    setEndDate(newDate);
                    setCurrentPage(0);
                    fetchSalesData(true);
                  }}
                  renderInput={(params) => <TextField {...params} sx={{ ml: 2 }} />}
                />
              </>
            )}
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Payment Status</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>{sale.item_name}</TableCell>
                    <TableCell>{sale.quantity}</TableCell>
                    <TableCell>{formatCost(sale.total_amount)}</TableCell>
                    <TableCell>{sale.payment_status}</TableCell>
                    <TableCell>{sale.customer_name}</TableCell>
                    <TableCell>
                      <Button 
                        onClick={() => handleUpdatePaymentStatus(sale.id, sale.payment_status === 'PENDING' ? 'DONE' : 'PENDING')}
                      >
                        {sale.payment_status === 'PENDING' ? 'Mark as Paid' : 'Mark as Pending'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button onClick={handlePreviousPage} disabled={currentPage === 0}>Previous</Button>
            <Button onClick={handleNextPage} disabled={!hasMoreSales}>Next</Button>
          </Box>
          <Typography>
            Showing {filteredSales.length > 0 ? currentPage * itemsPerPage + 1 : 0} - {Math.min((currentPage + 1) * itemsPerPage, totalSalesCount)} of {totalSalesCount} sales
          </Typography>
        </Box>
        <Box sx={{ width: '300px' }}>
          <Typography variant="h6" gutterBottom>Add New Sales</Typography>
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
          <Button onClick={handleAddSales} variant="contained" fullWidth sx={{ mt: 2 }}>
            Add Sales
          </Button>
        </Box>
      </Box>
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
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </LocalizationProvider>
  );
};

export default Sales;
