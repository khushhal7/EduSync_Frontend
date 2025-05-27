// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext'; // <-- Import AuthProvider
import './index.css';
import App from './App.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css'; // <-- ADD THIS LINE


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider> {/* <-- Wrap App (and implicitly its routes) with AuthProvider */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
