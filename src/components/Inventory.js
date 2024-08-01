import React, { useState, useMemo, useEffect } from 'react';
import { useInventory } from '../contexts/InventoryContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, 
  Button, CircularProgress, TextField, Dialog, DialogActions, DialogContent, DialogTitle, 
  Alert, Box, Tabs, Tab, IconButton, Snackbar, Switch, FormControlLabel, Card, CardContent,
  Grid, Tooltip, Skeleton
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';

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

const Inventory = () => {
  const { user, logout } = useAuth();
  const { 
    inventoryItems, 
    isLoading, 
    error, 
    fetchInventoryItems, 
    addInventoryItem, 
    updateInventoryItem,
    deleteInventoryItem,
    confirmDeleteInventoryItem,
    restoreInventoryItem,
    refreshInventory 
  } = useInventory();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add');
  const [selectedItem, setSelectedItem] = useState(null);
  const [newItem, setNewItem] = useState({ name: '', cost: '', quantity: '', low_inventory_threshold: '' });
  const [addItemError, setAddItemError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [searchLetter, setSearchLetter] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showDeleted, setShowDeleted] = useState(false);

  const itemsPerPage = 5;

  useEffect(() => {
    if (user) {
      console.log('User permissions:', {
        can_update_inventory: user.can_update_inventory,
        is_superuser: user.is_superuser
      });
      fetchInventoryItems(showDeleted);
    }
  }, [user, fetchInventoryItems, showDeleted]);

  useEffect(() => {
    console.log('Current inventory items:', JSON.stringify(inventoryItems, null,2));
    console.log('Deleted items:', JSON.stringify(inventoryItems.filter(item => item.is_deleted), null, 2));
  }, [inventoryItems]);

  const filteredItems = useMemo(() => {
    return inventoryItems.filter(item => 
      (searchLetter === '' || (item.name && item.name.toLowerCase().startsWith(searchLetter.toLowerCase()))) &&
      (showDeleted || !item.is_deleted)
    );
  }, [inventoryItems, searchLetter, showDeleted]);
  
  const lowInventoryItems = useMemo(() => {
    return inventoryItems.filter(item => item.quantity <= item.low_inventory_threshold && !item.is_deleted);
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
        await updateInventoryItem(selectedItem.id, newItem);
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
    if (window.confirm('Are you sure you want to delete this item? It will be moved to the deleted items list.')) {
      try {
        await deleteInventoryItem(itemId);
        refreshInventory();
        setSnackbar({ open: true, message: 'Item marked for deletion successfully', severity: 'success' });
      } catch (error) {
        console.error("Error deleting item:", error);
        setSnackbar({ open: true, message: 'Failed to delete item. Please try again.', severity: 'error' });
        if (error.response && error.response.status === 401) {
          logout();
        }
      }
    }
  };

  const handleConfirmDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to permanently delete this item? This action cannot be undone.')) {
      try {
        await confirmDeleteInventoryItem(itemId);
        refreshInventory();
        setSnackbar({ open: true, message: 'Item permanently deleted successfully', severity: 'success' });
      } catch (error) {
        console.error("Error confirming item deletion:", error);
        setSnackbar({ open: true, message: 'Failed to permanently delete item. Please try again.', severity: 'error' });
        if (error.response && error.response.status === 401) {
          logout();
        }
      }
    }
  };

  const handleRestoreItem = async (itemId) => {
    try {
      console.log(`Attempting to restore item with ID: ${itemId}`);
      const restoredItem = await restoreInventoryItem(itemId);
      console.log('Item restored:', restoredItem);
  
      // Refresh the inventory to ensure we have the latest data
      await refreshInventory();
  
      setSnackbar({ open: true, message: 'Item restored successfully', severity: 'success' });
    } catch (error) {
      console.error("Error restoring item:", error);
      
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
      }
  
      let errorMessage = 'Failed to restore item. Please try again.';
      if (error.response && error.response.data && error.response.data.detail) {
        errorMessage = error.response.data.detail;
      }
  
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
  
      if (error.response && error.response.status === 401) {
        console.log('Unauthorized access detected, logging out');
        logout();
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

  const handleShowDeletedChange = (event) => {
    setShowDeleted(event.target.checked);
  };

  if (!user) return <Typography>Please log in to view inventory.</Typography>;
  if (isLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">Error: {error}</Alert>;

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ padding: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
          Inventory Items
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Tabs value={tabValue} onChange={handleTabChange}>
                  <Tab label="All Stock" />
                  <Tab label="Low Stock" />
                </Tabs>
                
                {isLoading ? (
                  <Skeleton variant="rectangular" width="100%" height={400} />
                ) : (
                  <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell align="right">Quantity</TableCell>
                          <TableCell align="right">Cost</TableCell>
                          <TableCell align="right">Restock at</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(tabValue === 0 ? paginatedItems : lowInventoryItems).map(item => {
                          console.log(`Item ${item.id}:`, JSON.stringify(item, null, 2));
                          return (
                            <TableRow key={item.id} sx={item.is_deleted ? { backgroundColor: '#ffcccb' } : {}}>
                              <TableCell component="th" scope="row">{item.name}</TableCell>
                              <TableCell align="right">{item.quantity}</TableCell>
                              <TableCell align="right">{formatCost(item.cost)}</TableCell>
                              <TableCell align="right">{item.low_inventory_threshold}</TableCell>
                              <TableCell align="right">
                                {console.log(`Rendering buttons for item ${item.id}, is_deleted:`, item.is_deleted)}
                                {(user.can_update_inventory || user.is_superuser) && (
                                  <>
                                    {!item.is_deleted ? (
                                      <>
                                        <IconButton onClick={() => handleOpenDialog('edit', item)}>
                                          <EditIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleDeleteItem(item.id)}>
                                          <DeleteIcon />
                                        </IconButton>
                                      </>
                                    ) : (
                                      <>
                                        <IconButton onClick={() => handleRestoreItem(item.id)}>
                                          <RestoreIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleConfirmDelete(item.id)}>
                                          <DeleteIcon />
                                        </IconButton>
                                      </>
                                    )}
                                  </>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Inventory Actions
                </Typography>
                {user && user.can_update_inventory && (
                  <>
                    <Tooltip title="Add a new inventory item">
                      <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={() => handleOpenDialog('add')} 
                        startIcon={<AddIcon />}
                        fullWidth
                        sx={{ mb: 2 }}
                      >
                        Add New Item
                      </Button>
                    </Tooltip>
                    <TextField
                      label="Search by first letter"
                      value={searchLetter}
                      onChange={(e) => setSearchLetter(e.target.value)}
                      sx={{ mb: 2 }}
                      fullWidth
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showDeleted}
                          onChange={handleShowDeletedChange}
                          name="showDeleted"
                          color="primary"
                        />
                      }
                      label="Show Deleted Items"
                      sx={{ mb: 2 }}
                    />
                  </>
                )}
                <Tooltip title="Refresh inventory data">
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={refreshInventory}
                    fullWidth
                  >
                    Refresh Inventory
                  </Button>
                </Tooltip>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

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
              label="Low Stock"
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
    </ThemeProvider>
  );
};

export default Inventory;
