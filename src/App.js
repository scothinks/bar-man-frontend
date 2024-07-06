import React, { useEffect } from 'react';  
import { initializeApi, validateToken } from './services/api';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { AppBar, Toolbar, Button, Typography, Box, Container } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SalesProvider } from './contexts/SalesContext';
import { CustomerProvider } from './contexts/CustomerContext';
import { InventoryProvider } from './contexts/InventoryContext';
import Inventory from './components/Inventory';
import Sales from './components/Sales';
import CustomerTabs from './components/CustomerTabs';
import AdminManagement from './components/AdminManagement';
import Login from './components/Login';


const Navigation = () => {
  const { user, logout } = useAuth();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component={Link} to="/" style={{ textDecoration: 'none', color: 'white', flexGrow: 1 }}>
          BarMan
        </Typography>
        <Box>
          <Button color="inherit" component={Link} to="/">Inventory</Button>
          <Button color="inherit" component={Link} to="/sales">Sales</Button>
          <Button color="inherit" component={Link} to="/customer-tabs">Customer Tabs</Button>
          {user && user.is_superuser && (
            <Button color="inherit" component={Link} to="/admin">Admin Management</Button>
          )}
          {user ? (
            <Button color="inherit" onClick={logout}>Logout</Button>
          ) : (
            <Button color="inherit" component={Link} to="/login">Login</Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

const App = () => {
  useEffect(() => {
    initializeApi();
  }, []);  

  useEffect(() => {
    const checkAuth = async () => {
      const isValid = await validateToken();
      if (!isValid) {
        // Redirect to login or show auth error
      }
    };
    checkAuth();
  }, []);

  return (
    <AuthProvider>
      <InventoryProvider>
        <SalesProvider>
          <CustomerProvider>
            <Router>
              <Navigation />
              <Container>
                <Routes>
                  <Route path="/" element={<Inventory />} />
                  <Route path="/sales" element={<Sales />} />
                  <Route path="/customer-tabs" element={<CustomerTabs />} />
                  <Route path="/admin" element={<AdminManagement />} />
                  <Route path="/login" element={<Login />} />
                </Routes>
              </Container>
            </Router>
          </CustomerProvider>
        </SalesProvider>
      </InventoryProvider>
    </AuthProvider>
  );
};

export default App;