import React, { useState, useEffect } from 'react';
import { useInventory } from '../contexts/InventoryContext';
import { useAuth } from '../contexts/AuthContext';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Button, CircularProgress, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Alert } from '@mui/material';

const formatCost = (cost) => {
  if (cost === null || cost === undefined) return 'N/A';
  const numCost = typeof cost === 'string' ? parseFloat(cost) : cost;
  return isNaN(numCost) ? 'N/A' : `₦${numCost.toFixed(2)}`;
};

const Inventory = () => {
  const { inventoryItems, loading, error, fetchInventoryItems, addInventoryItem } = useInventory();
  const { user } = useAuth();
  const [openDialog, setOpenDialog] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', cost: '', quantity: '', low_inventory_threshold: '' });
  const [addItemError, setAddItemError] = useState('');

  useEffect(() => {
    fetchInventoryItems();
  }, [fetchInventoryItems]);

  useEffect(() => {
    console.log('Inventory component rendered. Items:', JSON.stringify(inventoryItems, null, 2));
  }, [inventoryItems]);

  const handleOpenDialog = () => {
    console.log('Open dialog button clicked');
    setOpenDialog(true);
    setAddItemError('');
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setAddItemError('');
  };

  const handleInputChange = (e) => {
    setNewItem({ ...newItem, [e.target.name]: e.target.value });
  };

  const handleAddItem = async () => {
    try {
      console.log('Adding new item:', newItem);
      const addedItem = await addInventoryItem(newItem);
      console.log('Item added:', addedItem);
      handleCloseDialog();
      setNewItem({ name: '', cost: '', quantity: '', low_inventory_threshold: '' });
      fetchInventoryItems(); // Refresh the inventory list
    } catch (error) {
      console.error("Error adding item:", error);
      setAddItemError('Failed to add item. Please try again.');
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">Error: {error}</Alert>;

  console.log('Rendering inventory items:', JSON.stringify(inventoryItems, null, 2));

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      <Typography variant="h4" gutterBottom>Inventory Items</Typography>
      {user && user.can_update_inventory && (
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleOpenDialog} 
          style={{ marginBottom: '20px', zIndex: 2 }}
        >
          Add New Item
        </Button>
      )}
      {(!inventoryItems || inventoryItems.length === 0) ? (
        <Typography>No inventory items available (Total items: {inventoryItems ? inventoryItems.length : 0})</Typography>
      ) : (
        <TableContainer component={Paper} key={inventoryItems.length}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Cost</TableCell>
                <TableCell align="right">Low Inventory Threshold</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inventoryItems.map(item => (
                <TableRow key={item.id}>
                  <TableCell component="th" scope="row">{item.name}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">{formatCost(item.cost)}</TableCell>
                  <TableCell align="right">{item.low_inventory_threshold}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        disableEscapeKeyDown={false}
      >
        <DialogTitle>Add New Inventory Item</DialogTitle>
        <DialogContent>
          {addItemError && <Alert severity="error" sx={{ mb: 2 }}>{addItemError}</Alert>}
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Item Name"
            type="text"
            fullWidth
            value={newItem.name}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="cost"
            label="Cost"
            type="number"
            fullWidth
            value={newItem.cost}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="quantity"
            label="Quantity"
            type="number"
            fullWidth
            value={newItem.quantity}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="low_inventory_threshold"
            label="Low Inventory Threshold"
            type="number"
            fullWidth
            value={newItem.low_inventory_threshold}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAddItem} color="primary">
            Add Item
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Inventory;