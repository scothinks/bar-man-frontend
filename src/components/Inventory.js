import React, { useEffect, useCallback, useMemo } from 'react';
import { useInventory } from '../contexts/InventoryContext';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Button, CircularProgress } from '@mui/material';
import { debounce } from 'lodash';

const Inventory = () => {
  const { inventoryItems, loading, error, fetchInventoryItems } = useInventory();

  const debouncedFetchInventoryItems = useMemo(
    () => debounce(() => {
      fetchInventoryItems();
    }, 1000),
    [fetchInventoryItems]
  );

  useEffect(() => {
    fetchInventoryItems();
  }, [fetchInventoryItems]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">Error: {error}</Typography>;
  if (!inventoryItems || !Array.isArray(inventoryItems) || inventoryItems.length === 0) {
    return <Typography>No inventory items available</Typography>;
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>Inventory Items</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="right">Cost</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventoryItems.map(item => (
              <TableRow key={item.id}>
                <TableCell component="th" scope="row">
                  {item.name}
                </TableCell>
                <TableCell align="right">{item.quantity}</TableCell>
                <TableCell align="right">₦{item.cost.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={debouncedFetchInventoryItems} 
        style={{ marginTop: '20px' }}
        disabled={loading}
      >
        Refresh Inventory Items
      </Button>
    </div>
  );
};

export default React.memo(Inventory);