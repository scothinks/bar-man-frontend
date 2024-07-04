import React, { useState } from 'react';
import { useSales } from '../contexts/SalesContext';
import { useInventory } from '../contexts/InventoryContext';
import { TextField, Button, Select, MenuItem, FormControl, InputLabel, Typography } from '@mui/material';

const Sales = () => {
  const { addSale } = useSales();
  const { inventory } = useInventory();
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleSale = async () => {
    try {
      await addSale({ item: selectedItem, quantity });
      setSelectedItem('');
      setQuantity(1);
    } catch (error) {
      console.error('Sale failed:', error);
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>Record Sale</Typography>
      <FormControl fullWidth margin="normal">
        <InputLabel>Item</InputLabel>
        <Select value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)}>
          {inventory.map((item) => (
            <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        fullWidth
        type="number"
        label="Quantity"
        value={quantity}
        onChange={(e) => setQuantity(parseInt(e.target.value))}
        margin="normal"
      />
      <Button variant="contained" color="primary" onClick={handleSale}>
        Record Sale
      </Button>
    </div>
  );
};

export default Sales;