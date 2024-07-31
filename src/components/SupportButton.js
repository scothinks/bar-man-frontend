import React, { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box, Typography } from '@mui/material';
import SupportIcon from '@mui/icons-material/Support';
import { createTheme, ThemeProvider } from '@mui/material/styles';

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
    h6: {
      fontWeight: 'bold',
    },
    subtitle1: {
      fontWeight: 'bold',
    },
  },
});

const SupportButton = ({ sx }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [screenshot, setScreenshot] = useState(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', { name, email, message, screenshot });
    handleClose();
  };

  const handleScreenshotUpload = (e) => {
    const file = e.target.files[0];
    setScreenshot(file);
  };

  return (
    <ThemeProvider theme={theme}>
      <Button
        variant="outlined"
        startIcon={<SupportIcon />}
        onClick={handleOpen}
        sx={{ height: '100%', ...sx }}
        fullWidth
      >
        Support
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Contact Support</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Message"
              multiline
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              margin="normal"
              required
            />
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Upload Screenshot (optional)
              </Typography>
              <input
                accept="image/*"
                type="file"
                onChange={handleScreenshotUpload}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Send</Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default SupportButton;
