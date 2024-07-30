import React, { useState, useEffect, useCallback } from 'react';
import { getUsers, createUser } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  Typography, TextField, Button, Checkbox, FormControlLabel, CircularProgress, Alert, Snackbar,
  Card, CardContent, Grid, Tooltip, Skeleton, Box
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

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
  },
});

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
  }, [logout]);

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
    <ThemeProvider theme={theme}>
      <Box sx={{ padding: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
          Admin Management
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>User List</Typography>
                {isLoading ? (
                  <Skeleton variant="rectangular" width="100%" height={300} />
                ) : (
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
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>Create New User</Typography>
                <Box component="form" onSubmit={(e) => { e.preventDefault(); handleCreateUser(); }}>
                  <TextField
                    fullWidth
                    label="Username"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    margin="normal"
                    required
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    margin="normal"
                    required
                  />
                  <TextField
                    fullWidth
                    type="password"
                    label="Password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    margin="normal"
                    required
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
                  <Tooltip title="Create a new user">
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={handleCreateUser} 
                      disabled={isLoading}
                      startIcon={<PersonAddIcon />}
                      fullWidth
                      sx={{ mt: 2 }}
                    >
                      {isLoading ? 'Creating...' : 'Create User'}
                    </Button>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

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

export default AdminManagement;
