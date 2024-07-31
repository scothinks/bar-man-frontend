import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import { AppBar, Toolbar, Button, Typography, Box, Container, CircularProgress, Snackbar } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SalesProvider } from './contexts/SalesContext';
import { CustomerProvider } from './contexts/CustomerContext';
import { InventoryProvider } from './contexts/InventoryContext';
import Inventory from './components/Inventory';
import Sales from './components/Sales';
import CustomerTabs from './components/CustomerTabs';
import AdminManagement from './components/AdminManagement';
import Login from './components/Login';
import Home from './components/Home';
import ErrorBoundary from './components/ErrorBoundary';
import Tutorial from './components/Tutorial';
import useNetworkStatus from './hooks/useNetworkStatus';

const Navigation = () => {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) return null;

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component={Link} to="/home" style={{ textDecoration: 'none', color: 'white', flexGrow: 1 }}>
          BarMan
        </Typography>
        <Box>
          {user && (
            <>
              <Button color="inherit" component={Link} to="/home">Home</Button>
              <Button color="inherit" component={Link} to="/inventory">Inventory</Button>
              <Button color="inherit" component={Link} to="/sales">Sales</Button>
              <Button color="inherit" component={Link} to="/customer-tabs">Customer Tabs</Button>
              {user && (user.can_manage_users || (user.can_update_inventory && user.can_report_sales && user.can_create_customers && user.can_create_tabs && user.can_update_tabs)) && (
                <Button color="inherit" component={Link} to="/admin">Admin Management</Button>
              )}
              <Button color="inherit" onClick={logout}>Logout</Button>
            </>
          )}
          {!user && (
            <Button color="inherit" component={Link} to="/login">Login</Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

const NetworkStatusAlert = () => {
  const isOnline = useNetworkStatus();
  return (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      open={!isOnline}
      message="You are offline. Some features may be unavailable."
    />
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <InventoryProvider>
          <CustomerProvider>
            <SalesProvider>
              <Router>
                <Navigation />
                <Container>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
                    <Route path="/inventory" element={<PrivateRoute><Inventory /></PrivateRoute>} />
                    <Route path="/sales" element={<PrivateRoute><Sales /></PrivateRoute>} />
                    <Route path="/customer-tabs" element={<PrivateRoute><CustomerTabs /></PrivateRoute>} />
                    <Route path="/admin" element={<PrivateRoute><AdminManagement /></PrivateRoute>} />
                    <Route path="/tutorial" element={<Tutorial />} />
                    <Route path="/" element={<Navigate to="/home" replace />} />
                  </Routes>
                </Container>
                <NetworkStatusAlert />
              </Router>
            </SalesProvider>
          </CustomerProvider>
        </InventoryProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

const PrivateRoute = ({ children }) => {
  const { user, isLoading, error, checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return user ? children : <Navigate to="/login" />;
};

export default App;