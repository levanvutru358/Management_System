import React from "react";
import { Container, Typography, Box, Paper, Toolbar } from "@mui/material";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
import { getCurrentUser } from "../services/authService";
import { Navigate } from "react-router-dom";

const Reports: React.FC = () => {
  const user = getCurrentUser();

  if (!user || user.role !== "admin") {
    return <Navigate to="/" />;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <Toolbar /> {/* Giải quyết vấn đề bị che bởi AppBar */}
      <Box sx={{ display: "flex", flexGrow: 1 }}>
        <Sidebar />
        <Container sx={{ ml: "5px", mt: 2, mb: 2 }}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h4" gutterBottom>
              Reports
            </Typography>
            <Typography>Task reports will be displayed here.</Typography>
          </Paper>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default Reports;
