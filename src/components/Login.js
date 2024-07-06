import React, { useState } from 'react';
import { TextField, Button, Typography, Alert, Box } from '@mui/material';
import { useAuth } from '../contexts';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    try {
      await loginUser(username, password);
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
      setError('Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, margin: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>Login</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TextField
        fullWidth
        margin="normal"
        label="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        disabled={loading}
      />
      <TextField
        fullWidth
        margin="normal"
        type="password"
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />
      <Button 
        type="submit" 
        variant="contained" 
        color="primary" 
        fullWidth 
        sx={{ mt: 2 }}
        disabled={loading}
      >
        {loading ? 'Logging in...' : 'Login'}
      </Button>
    </Box>
  );
};

export default Login;