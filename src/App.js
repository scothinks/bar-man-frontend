import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { AppBar, Toolbar, Button, Typography, Box, Container } from '@mui/material';
import { AuthProvider, useAuth } from './contexts';
import Inventory from './components/Inventory';
import Sales from './components/Sales';
import CustomerTabs from './components/CustomerTabs';
import AdminManagement from './components/AdminManagement';
import Login from './components/Login'; // You'll need to create this component

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
  return (
    <AuthProvider>
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
    </AuthProvider>
  );
};

export default App;