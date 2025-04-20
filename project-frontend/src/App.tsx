// frontend/src/App.tsx
import React, { JSX } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Tasks from './pages/Tasks';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import { getCurrentUser } from './services/authService';

const ProtectedRoute: React.FC<{ children: JSX.Element; adminOnly?: boolean }> = ({ children, adminOnly }) => {
  const user = getCurrentUser();
  if (!user) {
    return <Navigate to="/login" />;
  }
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/tasks" />;
  }
  return children;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <Tasks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute adminOnly>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;