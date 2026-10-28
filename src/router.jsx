import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import Login from '@/features/auth/Login';
import Signup from '@/features/auth/Signup';
import Dashboard from '@/features/dashboard/Dashboard';
import ClientsPage from '@/features/clients/ClientsPage';
import InvoicesPage from '@/features/invoices/InvoicesPage';
import InvoiceDetail from '@/features/invoices/InvoiceDetail';
import RemindersPage from '@/features/reminders/RemindersPage';

// BAGONG IMPORT PARA SA REPORTS:
import ReportsPage from '@/features/reports/ReportsPage'; 

// BAGONG IMPORT PARA SA PRODUCTS:
import ProductsPage from '@/features/products/ProductsPage'; 

// BAGONG IMPORT PARA SA SETTINGS (Totoong page na ito, hindi na Placeholder):
import SettingsPage from '@/features/settings/SettingsPage';

// ITO YUNG MGA NATITIRANG COMING SOON PAGES:
import { ExpensesPage, HelpPage } from '@/features/misc/PlaceholderPages'; 

import { useAuth } from '@/features/auth/AuthContext';

function PublicOnly({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : children;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
      <Route path="/signup" element={<PublicOnly><Signup /></PublicOnly>} />
      
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="invoices/:id" element={<InvoiceDetail />} />
        <Route path="reminders" element={<RemindersPage />} />
        
        <Route path="reports" element={<ReportsPage />} />
        <Route path="products" element={<ProductsPage />} /> 
        
        {/* Ito na yung totoong Settings Page */}
        <Route path="settings" element={<SettingsPage />} /> 
        
        {/* Ito na lang yung mga Coming Soon */}
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="help" element={<HelpPage />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}