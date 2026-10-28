import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './features/auth/AuthContext.jsx';
import { ToastProvider } from './components/Toast/ToastContext.jsx';
import { supabase } from './lib/supabase'; // <-- Idinagdag para sa test
import './styles/globals.css';

// Test kung nabasa ang Supabase URL
console.log("Supabase Connected:", import.meta.env.VITE_SUPABASE_URL ? "YES" : "NO");

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);