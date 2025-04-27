import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Tasks from "../pages/Tasks";
import Reports from "../pages/Reports";
import Profile from "../pages/Profile";
import Admin from "../pages/Admin";
import Calendar from "../pages/Calendar";
import Notifications from "../pages/Notifications";
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<ProtectedRoute component={Dashboard} />} />
      <Route path="/tasks" element={<ProtectedRoute component={Tasks} />} />
      <Route path="/reports" element={<ProtectedRoute component={Reports} />} />
      <Route path="/profile" element={<ProtectedRoute component={Profile} />} />
      <Route path="/admin" element={<ProtectedRoute component={Admin} />} />
      <Route path="/calendar" element={<ProtectedRoute component={Calendar} />} />
      <Route path="/notifications" element={<ProtectedRoute component={Notifications} />} />
      <Route path="/" element={<ProtectedRoute component={Dashboard} />} />
    </Routes>
  );
};

export default AppRoutes;