import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './contexts/AuthContext';
import { InventoryProvider } from './contexts/InventoryContext';
import { SalesProvider } from './contexts/SalesContext';
import { CustomerProvider } from './contexts/CustomerContext';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <InventoryProvider>
          <SalesProvider>
            <CustomerProvider>
              <App />
            </CustomerProvider>
          </SalesProvider>
        </InventoryProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

reportWebVitals();