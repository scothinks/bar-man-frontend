import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
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
    h6: {
      fontWeight: 'bold',
      color: '#1976d2', 
    },
    body1: {
      fontWeight: 'normal',
    },
  },
});

const TermsAndConditions = ({ open, onClose }) => {
  return (
    <ThemeProvider theme={theme}>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" color="primary">Terms and Conditions</Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" paragraph>
            Welcome to BarMan. By using our service, you agree to comply with and be bound by the following terms and conditions of use, which together with our privacy policy govern BarMan's relationship with you in relation to this service.
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" color="primary">1. Compliance with Nigerian Laws</Typography>
            <Typography variant="body1">
              Users must comply with all applicable Nigerian laws while using BarMan. The service must not be used for any illegal activities, including but not limited to money laundering, tax evasion, or the sale of prohibited substances.
            </Typography>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" color="primary">2. Future Monetization</Typography>
            <Typography variant="body1">
              BarMan reserves the right to monetize features or implement paid access to the service in the future. Users will be notified of any changes to the pricing structure or service offerings in advance.
            </Typography>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" color="primary">3. Data Privacy</Typography>
            <Typography variant="body1">
              Your records and data stored within BarMan are private. We do not have access to your individual records or transactions. However, we may collect and use anonymized, aggregated data for service improvement and analysis purposes.
            </Typography>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" color="primary">4. Intellectual Property</Typography>
            <Typography variant="body1">
              The content, organization, graphics, design, and other matters related to BarMan are protected under applicable copyrights and other proprietary laws. The copying, redistribution, use, or publication by you of any such matters or any part of the service is strictly prohibited.
            </Typography>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" color="primary">5. Limitation of Liability</Typography>
            <Typography variant="body1">
              BarMan will not be liable for any indirect, incidental, special, or consequential damages resulting from the use of the service.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default TermsAndConditions;
