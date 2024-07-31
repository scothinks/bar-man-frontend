import React, { useState, useEffect } from 'react';
import {
  TextField, Button, Typography, Alert, Box, CircularProgress, Grid, Link
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
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
    },
  },
});

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const { login, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      return;
    }
    setIsLoading(true);
    try {
      await login(username, password);
      navigate('/home');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTutorial = () => {
    console.log('Opening tutorial');
    navigate('/tutorial');
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ maxWidth: 400, margin: 'auto', mt: 4 }}>
        <Typography variant="h4" gutterBottom>Login</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
          />
          <TextField
            fullWidth
            margin="normal"
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            fullWidth 
            sx={{ mt: 2 }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Login'}
          </Button>
        </Box>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={6}>
            <Button
              variant="outlined"
              startIcon={<HelpOutlineIcon />}
              onClick={handleTutorial}
              fullWidth
            >
              Tutorial
            </Button>
          </Grid>
          <Grid item xs={6}>
            <SupportButton fullWidth />
          </Grid>
        </Grid>
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

export default Login;
