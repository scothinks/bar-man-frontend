import React, { useState, useEffect, useCallback } from 'react';
import { getUsers, createUser, updateUser } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  Typography, TextField, Button, Checkbox, FormControlLabel, CircularProgress, Alert, Snackbar,
  Card, CardContent, Grid, Tooltip, Skeleton, Box, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';

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
    can_manage_users: false,
  });
  const [editingUser, setEditingUser] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const canAccessAdminManagement = user && (user.can_manage_users || (user.can_update_inventory && user.can_report_sales && user.can_create_customers && user.can_create_tabs && user.can_update_tabs));

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
    } catch (error) {
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
    if (user && canAccessAdminManagement) {
      fetchUsers();
    }
  }, [user, fetchUsers, canAccessAdminManagement]);

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
        can_manage_users: false,
      });
      setSnackbar({ open: true, message: 'User created successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to create user. Please try again.', severity: 'error' });
      if (error.message === 'Authentication required' || (error.response && error.response.status === 401)) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEditDialog = (user) => {
    setEditingUser(user);
  };

  const handleUpdateUser = async () => {
    setIsLoading(true);
    try {
      await updateUser(editingUser.id, editingUser);
      await fetchUsers();
      setSnackbar({ open: true, message: 'User updated successfully', severity: 'success' });
      setEditingUser(null);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to update user. Please try again.', severity: 'error' });
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

  if (!user) {
    return <Typography>Please log in to access admin management.</Typography>;
  }
  if (!canAccessAdminManagement) {
    return <Alert severity="error">You don't have permission to access this page.</Alert>;
  }
  if (isLoading) {
    return <CircularProgress />;
  }
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

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
                          <TableCell>Actions</TableCell>
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
                              {user.can_create_customers && 'Create Customers, '}
                              {user.can_manage_users && 'Manage Users'}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outlined"
                                color="primary"
                                startIcon={<EditIcon />}
                                onClick={() => handleOpenEditDialog(user)}
                              >
                                Edit
                              </Button>
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
                  <FormControlLabel
                    control={<Checkbox checked={newUser.can_manage_users} onChange={(e) => setNewUser({ ...newUser, can_manage_users: e.target.checked })} />}
                    label="Can Manage Users"
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

        <Dialog open={!!editingUser} onClose={() => setEditingUser(null)}>
          <DialogTitle>Edit User Permissions</DialogTitle>
          <DialogContent>
            {editingUser && (
              <>
                <Typography variant="h6">{editingUser.username}</Typography>
                <FormControlLabel
                  control={<Checkbox checked={editingUser.can_update_inventory} onChange={(e) => setEditingUser({...editingUser, can_update_inventory: e.target.checked})} />}
                  label="Can Update Inventory"
                />
                <FormControlLabel
                  control={<Checkbox checked={editingUser.can_report_sales} onChange={(e) => setEditingUser({...editingUser, can_report_sales: e.target.checked})} />}
                  label="Can Report Sales"
                />
                <FormControlLabel
                  control={<Checkbox checked={editingUser.can_create_tabs} onChange={(e) => setEditingUser({...editingUser, can_create_tabs: e.target.checked})} />}
                  label="Can Create Tabs"
                />
                <FormControlLabel
                  control={<Checkbox checked={editingUser.can_update_tabs} onChange={(e) => setEditingUser({...editingUser, can_update_tabs: e.target.checked})} />}
                  label="Can Update Tabs"
                />
                <FormControlLabel
                  control={<Checkbox checked={editingUser.can_create_customers} onChange={(e) => setEditingUser({...editingUser, can_create_customers: e.target.checked})} />}
                  label="Can Create Customers"
                />
                <FormControlLabel
                  control={<Checkbox checked={editingUser.can_manage_users} onChange={(e) => setEditingUser({...editingUser, can_manage_users: e.target.checked})} />}
                  label="Can Manage Users"
                />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditingUser(null)}>Cancel</Button>
            <Button onClick={handleUpdateUser} color="primary">
              Update
            </Button>
          </DialogActions>
        </Dialog>

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