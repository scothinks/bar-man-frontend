import React, { useEffect, useState } from 'react';
import {
  Typography, Grid, Paper, Button, Box, List, ListItem,
  ListItemText, Divider, Link
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSales } from '../contexts/SalesContext';
import { useInventory } from '../contexts/InventoryContext';
import InventoryIcon from '@mui/icons-material/Inventory';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import PeopleIcon from '@mui/icons-material/People';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SupportButton from './SupportButton';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import TermsAndConditions from './TermsAndConditions';

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
      color: '#1976d2',
    },
    h5: {
      fontWeight: 'bold',
      color: '#1976d2',
    },
    h6: {
      fontWeight: 'bold',
      color: '#1976d2',
    },
    subtitle1: {
      fontWeight: 'bold',
    },
  },
});

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { summary, fetchSummary, last24HoursSummary, fetchLast24HoursSummary } = useSales();
  const { inventoryItems, fetchInventoryItems } = useInventory();
  const [termsOpen, setTermsOpen] = useState(false);

  useEffect(() => {
    fetchSummary();
    fetchLast24HoursSummary();
    fetchInventoryItems();
  }, [fetchSummary, fetchLast24HoursSummary, fetchInventoryItems]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
  };

  const NavButton = ({ to, icon, label }) => (
    <Button
      variant="contained"
      startIcon={icon}
      onClick={() => navigate(to)}
      fullWidth
      sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', p: 2 }}
    >
      {label}
    </Button>
  );

  const lowStockItems = inventoryItems.filter(item => item.quantity <= item.low_inventory_threshold);

  const handleTutorial = () => {
    navigate('/tutorial');
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ flexGrow: 1, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome to BarMan, {user.username}!
        </Typography>
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Sales Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography>Total Sales (Done): {formatCurrency(summary.total_done)}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>Pending Sales: {formatCurrency(summary.total_pending)}</Typography>
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>
            Last 24 Hours
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography>Sales (Done): {formatCurrency(last24HoursSummary.total_done)}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>Pending: {formatCurrency(last24HoursSummary.total_pending)}</Typography>
            </Grid>
          </Grid>
        </Paper>
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Low Stock Items
          </Typography>
          {lowStockItems.length > 0 ? (
            <List dense>
              {lowStockItems.map((item) => (
                <ListItem key={item.id}>
                  <ListItemText
                    primary={item.name}
                    secondary={`Quantity: ${item.quantity} (Threshold: ${item.low_inventory_threshold})`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>No items are currently low in stock.</Typography>
          )}
        </Paper>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <NavButton to="/inventory" icon={<InventoryIcon />} label="Inventory" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <NavButton to="/sales" icon={<PointOfSaleIcon />} label="Sales" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <NavButton to="/customer-tabs" icon={<PeopleIcon />} label="Customer Tabs" />
          </Grid>
          {user && (user.can_manage_users || (user.can_update_inventory && user.can_report_sales && user.can_create_customers && user.can_create_tabs && user.can_update_tabs)) && (
            <Grid item xs={12} sm={6} md={3}>
              <NavButton to="/admin" icon={<AdminPanelSettingsIcon />} label="Admin Management" />
            </Grid>
          )}
        </Grid>
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            startIcon={<HelpOutlineIcon />}
            onClick={handleTutorial}
            fullWidth
            sx={{ height: '100%' }}
          >
            Tutorial
          </Button>
          <SupportButton sx={{ height: '100%' }} />
        </Box>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Link component="button" variant="body2" onClick={() => setTermsOpen(true)}>
            Terms and Conditions
          </Link>
        </Box>
        <TermsAndConditions open={termsOpen} onClose={() => setTermsOpen(false)} />
      </Box>
    </ThemeProvider>
  );
};

export default Home;
