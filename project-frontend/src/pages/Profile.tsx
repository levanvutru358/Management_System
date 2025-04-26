import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Toolbar,
} from "@mui/material";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
import { getCurrentUser } from "../services/authService";
import api from "../services/api";
import { Navigate } from "react-router-dom";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
}

const Profile: React.FC = () => {
  const user = getCurrentUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const response = await api.get("/users/me");
        setProfile(response.data);
      } catch (err) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <Toolbar /> {/* Fix che nội dung do AppBar fixed */}
      <Box sx={{ display: "flex", flexGrow: 1 }}>
        <Sidebar />
        <Container sx={{ ml: "5px", mt: 2, mb: 2 }}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h4" gutterBottom>
              Profile
            </Typography>
            {loading && <CircularProgress />}
            {error && <Alert severity="error">{error}</Alert>}
            {profile && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography variant="body1">
                  <strong>Name:</strong> {profile.name}
                </Typography>
                <Typography variant="body1">
                  <strong>Email:</strong> {profile.email}
                </Typography>
                <Typography variant="body1">
                  <strong>Role:</strong> {profile.role}
                </Typography>
              </Box>
            )}
          </Paper>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default Profile;
