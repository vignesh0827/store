import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import StockView from './pages/StockView';
import Inward from './pages/Inward';
import Outward from './pages/Outward';
import Suppliers from './pages/Suppliers';
import SupplierPayments from './pages/SupplierPayments';
import Attendance from './pages/Attendance';
import About from './pages/About';
import Help from './pages/Help';
import Prices from './pages/Prices';
import UserManagement from './pages/UserManagement';
import Wastage from './pages/Wastage';
import { Toaster } from 'react-hot-toast';

const ProtectedRoute = ({ children, roles = [] }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const userRole = localStorage.getItem('user_role');

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles.length > 0 && !roles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="stock" element={<ProtectedRoute roles={['manager']}><StockView /></ProtectedRoute>} />
          <Route path="inward" element={<ProtectedRoute roles={['manager']}><Inward /></ProtectedRoute>} />
          <Route path="outward" element={<Outward />} />
          <Route path="wastage" element={<ProtectedRoute roles={['manager']}><Wastage /></ProtectedRoute>} />
          <Route path="suppliers" element={<ProtectedRoute roles={['manager']}><Suppliers /></ProtectedRoute>} />
          <Route path="supplier-payments" element={<ProtectedRoute roles={['manager']}><SupplierPayments /></ProtectedRoute>} />
          <Route path="attendance" element={<ProtectedRoute roles={['manager']}><Attendance /></ProtectedRoute>} />
          <Route path="prices" element={<ProtectedRoute roles={['manager']}><Prices /></ProtectedRoute>} />
          <Route path="users" element={<ProtectedRoute roles={['manager']}><UserManagement /></ProtectedRoute>} />
          <Route path="about" element={<About />} />
          <Route path="help" element={<Help />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
