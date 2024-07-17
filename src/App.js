import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
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
import ErrorBoundary from './components/ErrorBoundary';
import useNetworkStatus from './hooks/useNetworkStatus';

const Navigation = () => {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) return null;

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component={Link} to="/" style={{ textDecoration: 'none', color: 'white', flexGrow: 1 }}>
          BarMan
        </Typography>
        <Box>
          {user && (
            <>
              <Button color="inherit" component={Link} to="/">Inventory</Button>
              <Button color="inherit" component={Link} to="/sales">Sales</Button>
              <Button color="inherit" component={Link} to="/customer-tabs">Customer Tabs</Button>
              {user.is_superuser && (
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

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
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <InventoryProvider>
            <CustomerProvider>
              <Router>
                <Navigation />
                <Container>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<PrivateRoute><Inventory /></PrivateRoute>} />
                    <Route path="/sales" element={<PrivateRoute><SalesProvider><Sales /></SalesProvider></PrivateRoute>} />
                    <Route path="/customer-tabs" element={<PrivateRoute><CustomerTabs /></PrivateRoute>} />
                    <Route path="/admin" element={<PrivateRoute><AdminManagement /></PrivateRoute>} />
                  </Routes>
                </Container>
                <NetworkStatusAlert />
              </Router>
            </CustomerProvider>
          </InventoryProvider>
        </AuthProvider>
        <ReactQueryDevtools />
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

const PrivateRoute = ({ children }) => {
  const { user, isLoading, error, checkAuth } = useAuth();

  React.useEffect(() => {
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