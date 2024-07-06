import React, { useState } from 'react';
import { useSales } from '../contexts/SalesContext';
import { useInventory } from '../contexts/InventoryContext';
import { TextField, Button, Select, MenuItem, FormControl, InputLabel, Typography, CircularProgress } from '@mui/material';

const Sales = () => { 
  const { addSale } = useSales();
  const { inventoryItems, loading, error } = useInventory();
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState(1);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">Error: {error}</Typography>;
  if (!inventoryItems || !Array.isArray(inventoryItems) || inventoryItems.length === 0) {
    return <Typography>No inventory items available</Typography>;
  }

  const handleSale = async () => {
    if (!selectedItem) {
      alert('Please select an item');
      return;
    }
    try {
      await addSale({ item: selectedItem, quantity });
      setSelectedItem('');
      setQuantity(1);
      alert('Sale recorded successfully');
    } catch (error) {
      console.error('Sale failed:', error);
      alert('Failed to record sale');
    }
  };

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
      <Button variant="contained" color="primary" onClick={handleSale} disabled={!selectedItem}>
        Record Sale
      </Button>
    </div>
  );
};

export default Sales;