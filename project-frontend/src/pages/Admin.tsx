import React, { useEffect, useState } from "react";
import { Box, Typography, Container, List, ListItem, ListItemText, Button } from "@mui/material";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
import { getCurrentUser } from "../services/authService";
import api from "../services/api";
import { Navigate } from "react-router-dom";

interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}

const Admin: React.FC = () => {
  const user = getCurrentUser();
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const toggleUserStatus = async (id: number, action: "lock" | "unlock") => {
    try {
      await api.put(`/admin/users/${id}/${action}`);
      setUsers(users.map((u) => (u.id === id ? { ...u, isActive: action === "unlock" } : u)));
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (!user || user.role !== "admin") {
    return <Navigate to="/" />;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <Box sx={{ display: "flex", flexGrow: 1 }}>
        <Sidebar />
        <Container sx={{ ml: "5px", mt: 2 }}>
          <Typography variant="h4">Admin Controls</Typography>
          <Typography variant="h6">Manage Users</Typography>
          <List>
            {users.map((u) => (
              <ListItem key={u.id} sx={{ border: "1px solid #ddd", mb: 1, borderRadius: "4px" }}>
                <ListItemText primary={`${u.name} (${u.email})`} secondary={`Active: ${u.isActive ? "Yes" : "No"}`} />
                <Button
                  onClick={() => toggleUserStatus(u.id, u.isActive ? "lock" : "unlock")}
                  variant="outlined"
                  color={u.isActive ? "error" : "success"}
                >
                  {u.isActive ? "Lock" : "Unlock"}
                </Button>
              </ListItem>
            ))}
          </List>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default Admin;