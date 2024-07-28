import React, { useState, useEffect, useCallback } from 'react';
import { getUsers, createUser } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  Typography, TextField, Button, Checkbox, FormControlLabel, CircularProgress, Alert, Snackbar
} from '@mui/material';

const AdminManagement = () => {
  const { user, checkAuth, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    can_update_inventory: false,
    can_report_sales: false,
    can_create_tabs: false,
    can_update_tabs: false,
    can_create_customers: false,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError('Failed to fetch users. Please try again.');
      setSnackbar({ open: true, message: 'Failed to fetch users. Please try again.', severity: 'error' });
      if (error.message === 'Authentication required' || (error.response && error.response.status === 401)) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  },  [logout, setSnackbar]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user && user.is_superuser) {
      fetchUsers();
    }
  }, [user, fetchUsers]);


  const handleCreateUser = async () => {
    setIsLoading(true);
    try {
      await createUser(newUser);
      await fetchUsers();
      setNewUser({
        username: '',
        email: '',
        password: '',
        can_update_inventory: false,
        can_report_sales: false,
        can_create_tabs: false,
        can_update_tabs: false,
        can_create_customers: false,
      });
      setSnackbar({ open: true, message: 'User created successfully', severity: 'success' });
    } catch (error) {
      console.error('Failed to create user:', error);
      setSnackbar({ open: true, message: 'Failed to create user. Please try again.', severity: 'error' });
      if (error.message === 'Authentication required' || (error.response && error.response.status === 401)) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  if (!user) return <Typography>Please log in to access admin management.</Typography>;
  if (!user.is_superuser) return <Alert severity="error">You don't have permission to access this page.</Alert>;
  if (isLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <div>
      <Typography variant="h4" gutterBottom>Admin Management</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Permissions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.can_update_inventory && 'Update Inventory, '}
                  {user.can_report_sales && 'Report Sales, '}
                  {user.can_create_tabs && 'Create Tabs, '}
                  {user.can_update_tabs && 'Update Tabs, '}
                  {user.can_create_customers && 'Create Customers'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="h6" gutterBottom style={{ marginTop: '20px' }}>Create New User</Typography>
      <TextField
        fullWidth
        label="Username"
        value={newUser.username}
        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
        margin="normal"
      />
      <TextField
        fullWidth
        label="Email"
        value={newUser.email}
        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
        margin="normal"
      />
      <TextField
        fullWidth
        type="password"
        label="Password"
        value={newUser.password}
        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
        margin="normal"
      />
      <FormControlLabel
        control={<Checkbox checked={newUser.can_update_inventory} onChange={(e) => setNewUser({ ...newUser, can_update_inventory: e.target.checked })} />}
        label="Can Update Inventory"
      />
      <FormControlLabel
        control={<Checkbox checked={newUser.can_report_sales} onChange={(e) => setNewUser({ ...newUser, can_report_sales: e.target.checked })} />}
        label="Can Report Sales"
      />
      <FormControlLabel
        control={<Checkbox checked={newUser.can_create_tabs} onChange={(e) => setNewUser({ ...newUser, can_create_tabs: e.target.checked })} />}
        label="Can Create Tabs"
      />
      <FormControlLabel
        control={<Checkbox checked={newUser.can_update_tabs} onChange={(e) => setNewUser({ ...newUser, can_update_tabs: e.target.checked })} />}
        label="Can Update Tabs"
      />
      <FormControlLabel
        control={<Checkbox checked={newUser.can_create_customers} onChange={(e) => setNewUser({ ...newUser, can_create_customers: e.target.checked })} />}
        label="Can Create Customers"
      />
      <Button variant="contained" color="primary" onClick={handleCreateUser} disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create User'}
      </Button>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AdminManagement;