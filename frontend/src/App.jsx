import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getMe } from './services/authService';
import Navbar from './components/Navbar';
import AgeCalculator from './components/AgeCalculator';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Toast from './components/Toast';

function App() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  useEffect(() => {
    const verifySession = async () => {
      try {
        const data = await getMe();
        setAdmin(data.admin);
      } catch (err) {
        // Not authenticated
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };
    verifySession();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Navbar admin={admin} setAdmin={setAdmin} showToast={showToast} />
        
        <Routes>
          <Route 
            path="/" 
            element={<AgeCalculator showToast={showToast} />} 
          />
          <Route 
            path="/admin/login" 
            element={<AdminLogin admin={admin} setAdmin={setAdmin} showToast={showToast} />} 
          />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute admin={admin} loading={loading}>
                <AdminDashboard showToast={showToast} />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={closeToast} 
          />
        )}
      </div>
    </Router>
  );
}

export default App;
