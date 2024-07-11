import React, { useEffect, useCallback, useState } from 'react';
import { useSales } from '../contexts/SalesContext';
import { useInventory } from '../contexts/InventoryContext';
import { useCustomer } from '../contexts/CustomerContext';
import { 
  Button, Typography, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  CircularProgress, Box, TextField, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { enUS } from 'date-fns/locale';
import { subDays } from 'date-fns';

const Sales = () => {
  const { 
    sales = [], 
    loading, 
    error, 
    updatePaymentStatus, 
    fetchSales, 
    summary,
    addSale,
    totalSalesCount
  } = useSales();
  const { inventoryItems = [] } = useInventory();
  const { customers, addCustomer } = useCustomer();
  const [newSale, setNewSale] = useState({ item: '', quantity: 1, customer: '' });
  const [newCustomer, setNewCustomer] = useState({ name: '', phone_number: '' });
  const [currentPage, setCurrentPage] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateFilter, setDateFilter] = useState('custom');
  const [openNewCustomerDialog, setOpenNewCustomerDialog] = useState(false);
  const itemsPerPage = 5;

  const fetchSalesData = useCallback((reset = false) => {
    const filters = {
      start_date: startDate ? startDate.toISOString().split('T')[0] : null,
      end_date: endDate ? endDate.toISOString().split('T')[0] : null,
      offset: currentPage * itemsPerPage,
      limit: itemsPerPage
    };
    console.log('Fetching sales with filters:', filters);
    fetchSales(filters, reset).catch((error) => {
      console.error('Error fetching sales:', error);
    });
  }, [fetchSales, startDate, endDate, currentPage, itemsPerPage]);

  useEffect(() => {
    fetchSalesData(true);
  }, [fetchSalesData, startDate, endDate, currentPage]);

  const handleUpdatePaymentStatus = async (saleId, newStatus) => {
    try {
      await updatePaymentStatus(saleId, newStatus);
      fetchSalesData(true);
    } catch (error) {
      console.error('Failed to update payment status:', error);
      alert('Failed to update payment status');
    }
  };

  const handleAddSale = async () => {
    try {
      await addSale(newSale);
      setNewSale({ item: '', quantity: 1, customer: '' });
      setCurrentPage(0);
      fetchSalesData(true);
    } catch (error) {
      console.error('Failed to add sale:', error);
      alert('Failed to add sale');
    }
  };

  const handleAddCustomer = async () => {
    try {
      const addedCustomer = await addCustomer(newCustomer);
      setNewSale({ ...newSale, customer: addedCustomer.id });
      setNewCustomer({ name: '', phone_number: '' });
      setOpenNewCustomerDialog(false);
    } catch (error) {
      console.error('Failed to add customer:', error);
      alert('Failed to add customer');
    }
  };

  const handleNextPage = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
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
    setCurrentPage(0);
  };

  if (loading && sales.length === 0) return <CircularProgress />;
  if (error) return <Typography color="error">Error: {error}</Typography>;

  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedSales = sales.slice(startIndex, endIndex);
  const hasMoreSales = endIndex < totalSalesCount;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enUS}>
      <Box sx={{ display: 'flex', flexDirection: 'row', height: '100vh', padding: 2 }}>
        <Box sx={{ flexGrow: 1, overflowY: 'auto', mr: 2 }}>
          <Typography variant="h4" gutterBottom>Sales List</Typography>
          <Typography variant="h6" gutterBottom>
            Total Done: ₦{summary.total_done?.toFixed(2) || '0.00'} | Total Pending: ₦{summary.total_pending?.toFixed(2) || '0.00'}
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
                  }}
                  renderInput={(params) => <TextField {...params} />}
                />
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newDate) => {
                    setEndDate(newDate);
                    setCurrentPage(0);
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
                {displayedSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>{sale.item_name}</TableCell>
                    <TableCell>{sale.quantity}</TableCell>
                    <TableCell>₦{sale.total_amount?.toFixed(2) || '0.00'}</TableCell>
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
            Showing {startIndex + 1} - {Math.min(endIndex, totalSalesCount)} of {totalSalesCount} sales
          </Typography>
        </Box>
        <Box sx={{ width: '300px' }}>
          <Typography variant="h6" gutterBottom>Add New Sale</Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel>Item</InputLabel>
            <Select
              value={newSale.item}
              onChange={(e) => setNewSale({ ...newSale, item: e.target.value })}
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
            value={newSale.quantity}
            onChange={(e) => setNewSale({ ...newSale, quantity: parseInt(e.target.value) })}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Customer</InputLabel>
            <Select
              value={newSale.customer}
              onChange={(e) => setNewSale({ ...newSale, customer: e.target.value })}
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
          {newSale.customer === 'new' && (
            <Button onClick={() => setOpenNewCustomerDialog(true)} fullWidth variant="outlined" sx={{ mt: 1 }}>
              Add New Customer
            </Button>
          )}
          <Button onClick={handleAddSale} variant="contained" fullWidth sx={{ mt: 2 }}>
            Add Sale
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
    </LocalizationProvider>
  );
};

export default Sales;