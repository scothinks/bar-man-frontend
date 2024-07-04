import React, { useState, useEffect } from 'react';
import { getUsers, createUser } from '../services/api';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, TextField, Button, Checkbox, FormControlLabel } from '@mui/material';

const AdminManagement = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    can_update_inventory: false,
    can_report_sales: false,
    can_create_tabs: false,
    can_update_tabs: false,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleCreateUser = async () => {
    try {
      await createUser(newUser);
      fetchUsers();
      setNewUser({
        username: '',
        email: '',
        password: '',
        can_update_inventory: false,
        can_report_sales: false,
        can_create_tabs: false,
        can_update_tabs: false,
      });
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

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
                  {user.can_update_tabs && 'Update Tabs'}
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
      <Button variant="contained" color="primary" onClick={handleCreateUser}>
        Create User
      </Button>
    </div>
  );
};

export default AdminManagement;