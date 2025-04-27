import React, { useEffect, useState } from "react";
import { Box, Typography, Container, List, ListItem, ListItemText, Button } from "@mui/material";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
import api from "../services/api";

interface Notification {
  id: number;
  message: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications");
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <Box sx={{ display: "flex", flexGrow: 1 }}>
        <Sidebar />
        <Container sx={{ ml: "5px", mt: 2 }}>
          <Typography variant="h4">Notifications</Typography>
          <List>
            {notifications.map((notification) => (
              <ListItem key={notification.id} sx={{ border: "1px solid #ddd", mb: 1, borderRadius: "4px" }}>
                <ListItemText
                  primary={notification.message}
                  secondary={`Created: ${new Date(notification.createdAt).toLocaleString()} ${notification.readAt ? `- Read: ${new Date(notification.readAt).toLocaleString()}` : ""}`}
                  sx={{ color: notification.isRead ? "gray" : "inherit" }}
                />
                {!notification.isRead && (
                  <Button onClick={() => markAsRead(notification.id)} variant="outlined">
                    Mark as Read
                  </Button>
                )}
              </ListItem>
            ))}
          </List>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default Notifications;