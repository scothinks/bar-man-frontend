import React, { useState, useMemo, useEffect } from 'react';
import { useInventory } from '../contexts/InventoryContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, 
  Button, CircularProgress, TextField, Dialog, DialogActions, DialogContent, DialogTitle, 
  Alert, Box, Tabs, Tab, IconButton, Snackbar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const formatCost = (cost) => {
  if (cost === null || cost === undefined) return 'N/A';
  const numCost = typeof cost === 'string' ? parseFloat(cost) : cost;
  if (isNaN(numCost)) return 'N/A';
  return `₦${numCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const Inventory = () => {
  const { user, logout } = useAuth();
  const { inventoryItems, isLoading, error, fetchInventoryItems, addInventoryItem, refreshInventory } = useInventory();
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add');
  const [selectedItem, setSelectedItem] = useState(null);
  const [newItem, setNewItem] = useState({ name: '', cost: '', quantity: '', low_inventory_threshold: '' });
  const [addItemError, setAddItemError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [searchLetter, setSearchLetter] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const itemsPerPage = 10;

  useEffect(() => {
    if (user) {
      fetchInventoryItems();
    }
  }, [user, fetchInventoryItems]);

  const filteredItems = useMemo(() => {
    return inventoryItems.filter(item => 
      searchLetter === '' || (item.name && item.name.toLowerCase().startsWith(searchLetter.toLowerCase()))
    );
  }, [inventoryItems, searchLetter]);
  
  const lowInventoryItems = useMemo(() => {
    return inventoryItems.filter(item => item.quantity <= item.low_inventory_threshold);
  }, [inventoryItems]);

  const paginatedItems = useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const handleOpenDialog = (mode, item = null) => {
    setDialogMode(mode);
    setSelectedItem(item);
    if (mode === 'add') {
      setNewItem({ name: '', cost: '', quantity: '', low_inventory_threshold: '' });
    } else if (mode === 'edit' && item) {
      setNewItem({ ...item });
    }
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

  const handleSaveItem = async () => {
    try {
      if (dialogMode === 'add') {
        await addInventoryItem(newItem);
      } else if (dialogMode === 'edit') {
        // Implement updateInventoryItem in InventoryContext and use it here
        // await updateInventoryItem(selectedItem.id, newItem);
      }
      handleCloseDialog();
      refreshInventory();
      setSnackbar({ open: true, message: `Item ${dialogMode === 'add' ? 'added' : 'updated'} successfully`, severity: 'success' });
    } catch (error) {
      console.error(`Error ${dialogMode === 'add' ? 'adding' : 'updating'} item:`, error);
      setAddItemError(`Failed to ${dialogMode === 'add' ? 'add' : 'update'} item. Please try again.`);
      setSnackbar({ open: true, message: `Failed to ${dialogMode === 'add' ? 'add' : 'update'} item. Please try again.`, severity: 'error' });
      if (error.response && error.response.status === 401) {
        logout();
      }
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        // Implement deleteInventoryItem in InventoryContext and use it here
        // await deleteInventoryItem(itemId);
        refreshInventory();
        setSnackbar({ open: true, message: 'Item deleted successfully', severity: 'success' });
      } catch (error) {
        console.error("Error deleting item:", error);
        setSnackbar({ open: true, message: 'Failed to delete item. Please try again.', severity: 'error' });
        if (error.response && error.response.status === 401) {
          logout();
        }
      }
    }
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredItems.length / itemsPerPage) - 1));
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  if (!user) return <Typography>Please log in to view inventory.</Typography>;
  if (isLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">Error: {error}</Alert>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Inventory Items</Typography>
      
      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tab label="All Items" />
        <Tab label="Low Inventory" />
      </Tabs>

      {user && user.can_update_inventory && (
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => handleOpenDialog('add')} 
          style={{ margin: '20px 0' }}
        >
          Add New Item
        </Button>
      )}

      <TextField
        label="Search by first letter"
        value={searchLetter}
        onChange={(e) => setSearchLetter(e.target.value)}
        style={{ marginLeft: '20px' }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="right">Cost</TableCell>
              <TableCell align="right">Low Inventory Threshold</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(tabValue === 0 ? paginatedItems : lowInventoryItems).map(item => (
              <TableRow key={item.id}>
                <TableCell component="th" scope="row">{item.name}</TableCell>
                <TableCell align="right">{item.quantity}</TableCell>
                <TableCell align="right">{formatCost(item.cost)}</TableCell>
                <TableCell align="right">{item.low_inventory_threshold}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpenDialog('edit', item)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteItem(item.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {tabValue === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button onClick={handlePreviousPage} disabled={currentPage === 0}>Previous</Button>
          <Button onClick={handleNextPage} disabled={(currentPage + 1) * itemsPerPage >= filteredItems.length}>Next</Button>
        </Box>
      )}

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
      >
        <DialogTitle>{dialogMode === 'add' ? 'Add New Inventory Item' : 'Edit Inventory Item'}</DialogTitle>
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
          <Button onClick={handleSaveItem} color="primary">
            {dialogMode === 'add' ? 'Add Item' : 'Save Changes'}
          </Button>
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
  );
};

export default Inventory;