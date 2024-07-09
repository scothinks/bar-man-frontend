import React, { useState, useEffect } from 'react';
import { useSales } from '../contexts/SalesContext';
import { useInventory } from '../contexts/InventoryContext';
import { 
  TextField, Button, Select, MenuItem, FormControl, InputLabel, Typography, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle 
} from '@mui/material';

const Sales = () => {
  const { sales, customers, loading, error, addSale, updatePaymentStatus, fetchCustomers, addCustomer, addCustomerTab } = useSales();
  const { inventoryItems } = useInventory();
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [paymentStatus, setPaymentStatus] = useState('PENDING');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [openNewCustomerDialog, setOpenNewCustomerDialog] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone_number: '' });

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSale = async () => {
    if (!selectedItem) {
      alert('Please select an item');
      return;
    }
    try {
      const saleResponse = await addSale({ 
        item: selectedItem, 
        quantity, 
        payment_status: paymentStatus,
        customer: selectedCustomer 
      });

      if (paymentStatus === 'PENDING') {
        await addCustomerTab({
          customer: selectedCustomer,
          sale: saleResponse.id,
          amount: saleResponse.total_amount  // Assuming your sale response includes the total amount
        });
      }

      setSelectedItem('');
      setQuantity(1);
      setPaymentStatus('PENDING');
      setSelectedCustomer('');
      alert('Sale recorded successfully' + (paymentStatus === 'PENDING' ? ' and customer tab created' : ''));
    } catch (error) {
      console.error('Sale failed:', error);
      alert('Failed to record sale');
    }
  };

  const handleUpdatePaymentStatus = async (saleId, newStatus) => {
    try {
      await updatePaymentStatus(saleId, newStatus);
      if (newStatus === 'DONE') {
        // Here you might want to close the customer tab or mark it as paid
        // This depends on how your backend API is set up
        // await closeCustomerTab(saleId);
      }
      alert('Payment status updated successfully');
    } catch (error) {
      console.error('Failed to update payment status:', error);
      alert('Failed to update payment status');
    }
  };

  const handleOpenNewCustomerDialog = () => {
    setOpenNewCustomerDialog(true);
  };

  const handleCloseNewCustomerDialog = () => {
    setOpenNewCustomerDialog(false);
    setNewCustomer({ name: '', phone_number: '' });
  };

  const handleAddNewCustomer = async () => {
    try {
      const addedCustomer = await addCustomer(newCustomer);
      setSelectedCustomer(addedCustomer.id);
      handleCloseNewCustomerDialog();
      alert('New customer added successfully');
    } catch (error) {
      console.error('Failed to add new customer:', error);
      alert('Failed to add new customer');
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">Error: {error}</Typography>;

  return (
    <div>
      <Typography variant="h4" gutterBottom>Record Sale</Typography>
      <FormControl fullWidth margin="normal">
        <InputLabel>Item</InputLabel>
        <Select value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)}>
          {inventoryItems.map((item) => (
            <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        fullWidth
        type="number"
        label="Quantity"
        value={quantity}
        onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
        margin="normal"
      />
      <FormControl fullWidth margin="normal">
        <InputLabel>Payment Status</InputLabel>
        <Select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
          <MenuItem value="PENDING">Pending</MenuItem>
          <MenuItem value="DONE">Done</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth margin="normal">
        <InputLabel>Customer</InputLabel>
        <Select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)}>
          {customers && customers.map((customer) => (
            <MenuItem key={customer.id} value={customer.id}>{customer.name}</MenuItem>
          ))}
          <MenuItem value="new">
            <em>Add New Customer</em>
          </MenuItem>
        </Select>
      </FormControl>
      {selectedCustomer === 'new' && (
        <Button color="primary" onClick={handleOpenNewCustomerDialog}>
          Create New Customer
        </Button>
      )}
      <Button variant="contained" color="primary" onClick={handleSale} disabled={!selectedItem || selectedCustomer === 'new'}>
        Record Sale
      </Button>

      {/* New Customer Dialog */}
      <Dialog open={openNewCustomerDialog} onClose={handleCloseNewCustomerDialog}>
        <DialogTitle>Add New Customer</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Customer Name"
            type="text"
            fullWidth
            value={newCustomer.name}
            onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Phone Number"
            type="text"
            fullWidth
            value={newCustomer.phone_number}
            onChange={(e) => setNewCustomer({ ...newCustomer, phone_number: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewCustomerDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAddNewCustomer} color="primary">
            Add Customer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sales List Table */}
      <Typography variant="h4" gutterBottom style={{ marginTop: '2rem' }}>Sales List</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Payment Status</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Customer Tab</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>{sale.item_name}</TableCell>
                <TableCell>{sale.quantity}</TableCell>
                <TableCell>{sale.payment_status}</TableCell>
                <TableCell>{sale.customer_name}</TableCell>
                <TableCell>{sale.payment_status === 'PENDING' ? 'Yes' : 'No'}</TableCell>
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
    </div>
  );
};

export default Sales;