import React, { useEffect, useCallback, useState } from 'react';
import { useSales } from '../contexts/SalesContext';
import { useInventory } from '../contexts/InventoryContext';
import { useCustomer } from '../contexts/CustomerContext';
import { 
  Button, Typography, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  CircularProgress, Box, TextField, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { enUS } from 'date-fns/locale';

const Sales = () => {
  const { 
    sales = [], 
    loading, 
    error, 
    updatePaymentStatus, 
    fetchSales, 
    summary,
    addSale
  } = useSales();
  const { inventoryItems = [] } = useInventory();
  const { customers } = useCustomer();
  const [newSale, setNewSale] = useState({ item: '', quantity: 1, customer: '' });
  const [currentPage, setCurrentPage] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const fetchSalesData = useCallback((reset = false) => {
    const filters = {
      start_date: startDate ? startDate.toISOString().split('T')[0] : null,
      end_date: endDate ? endDate.toISOString().split('T')[0] : null,
      offset: currentPage * 5,
      limit: 5
    };
    console.log('Fetching sales with filters:', filters);
    fetchSales(filters, reset).catch((error) => {
      console.error('Error fetching sales:', error);
    });
  }, [fetchSales, startDate, endDate, currentPage]);

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
      fetchSalesData(true);
    } catch (error) {
      console.error('Failed to add sale:', error);
      alert('Failed to add sale');
    }
  };

  const handleNextPage = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  if (loading && sales.length === 0) return <CircularProgress />;
  if (error) return <Typography color="error">Error: {error}</Typography>;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enUS}>
      <Box sx={{ display: 'flex', flexDirection: 'row', height: '100vh', padding: 2 }}>
        <Box sx={{ flexGrow: 1, overflowY: 'auto', mr: 2 }}>
          <Typography variant="h4" gutterBottom>Sales List</Typography>
          <Typography variant="h6" gutterBottom>
            Total Done: ₦{summary.total_done?.toFixed(2) || '0.00'} | Total Pending: ₦{summary.total_pending?.toFixed(2) || '0.00'}
          </Typography>
          <Box sx={{ display: 'flex', mb: 2 }}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
              renderInput={(params) => <TextField {...params} />}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={setEndDate}
              renderInput={(params) => <TextField {...params} sx={{ ml: 2 }} />}
            />
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
                {sales.map((sale) => (
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
            <Button onClick={handleNextPage} disabled={sales.length < 5}>Next</Button>
          </Box>
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
            </Select>
          </FormControl>
          <Button onClick={handleAddSale} variant="contained" fullWidth sx={{ mt: 2 }}>
            Add Sale
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default Sales;