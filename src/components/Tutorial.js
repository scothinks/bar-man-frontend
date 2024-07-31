import React from 'react';
import {
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Container,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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
    body1: {
      fontWeight: 'bold',
      color: '#1976d2',
    },
    body2: {
      fontFamily: 'Roboto, Arial, sans-serif',
    },
  },
});

const tutorialData = [
  {
    question: "How do I log in to BarMan?",
    answer: "To log in to BarMan, enter your username and password on the login page and click the 'Login' button. If you don't have an account, please contact your system administrator."
  },
  {
    question: "How do I add a new inventory item?",
    answer: "To add a new inventory item, go to the Inventory page, click on the 'Add New Item' button, fill in the required details such as name, quantity, and cost, then click 'Save'."
  },
  {
    question: "How do I record a sale?",
    answer: "To record a sale, navigate to the Sales page, select the items sold, specify the quantity, choose the customer (if applicable), and click 'Add Sale'. The inventory will be automatically updated."
  },
  {
    question: "How do I manage customer tabs?",
    answer: "Customer tabs can be managed on the Customer Tabs page. You can create a new tab, add charges to existing tabs, and mark tabs as paid. Ensure you set appropriate credit limits for customers."
  },
  {
    question: "What should I do if I notice low stock for an item?",
    answer: "If you notice an item is low in stock, go to the Inventory page, find the item, and update its quantity. You may also want to place an order with your supplier to restock the item."
  },
];

const Tutorial = () => {
  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            BarMan Tutorial
          </Typography>
          {tutorialData.map((item, index) => (
            <Accordion key={index}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel${index}a-content`}
                id={`panel${index}a-header`}
              >
                <Typography variant="body1">{item.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  {item.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default Tutorial;
