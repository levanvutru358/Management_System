import React, { useEffect, useState } from "react";
import { Box, Typography, Container, Paper, Toolbar, List, ListItem, ListItemText } from "@mui/material";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
import { getCurrentUser } from "../services/authService";
import { Navigate } from "react-router-dom";
import { getTaskStats, Task } from "../services/taskService";
import api from "../services/api";

interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  overdue: number;
}

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  userId: number;
  taskId: number;
}

interface TaskHistory {
  task: Task;
  comments: Comment[];
}

const Reports: React.FC = () => {
  const user = getCurrentUser();
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [taskHistories, setTaskHistories] = useState<TaskHistory[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsData = await getTaskStats();
        setStats(statsData);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    const fetchHistories = async () => {
      try {
        const response = await api.get("/tasks");
        const tasks: Task[] = response.data;
        const histories = await Promise.all(
          tasks.map(async (task) => {
            const historyResponse = await api.get(`/reports/history/${task.id}`);
            return historyResponse.data;
          })
        );
        setTaskHistories(histories);
      } catch (error) {
        console.error("Error fetching task histories:", error);
      }
    };

    fetchStats();
    fetchHistories();
  }, []);

  if (!user || user.role !== "admin") {
    return <Navigate to="/" />;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <Toolbar />
      <Box sx={{ display: "flex", flexGrow: 1 }}>
        <Sidebar />
        <Container sx={{ ml: "5px", mt: 2, mb: 2 }}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h4" gutterBottom>
              Reports
            </Typography>
            {stats && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6">Task Statistics</Typography>
                <Typography>Total Tasks: {stats.total}</Typography>
                <Typography>Todo: {stats.todo}</Typography>
                <Typography>In Progress: {stats.inProgress}</Typography>
                <Typography>Done: {stats.done}</Typography>
                <Typography>Overdue: {stats.overdue}</Typography>
              </Box>
            )}
            <Typography variant="h6">Task Histories</Typography>
            {taskHistories.map((history) => (
              <Box key={history.task.id} sx={{ mb: 2, border: "1px solid #ddd", p: 2, borderRadius: "4px" }}>
                <Typography variant="subtitle1">{history.task.title}</Typography>
                <List dense>
                  {history.comments.map((comment) => (
                    <ListItem key={comment.id}>
                      <ListItemText
                        primary={comment.content}
                        secondary={`User ID ${comment.userId} - ${new Date(comment.createdAt).toLocaleString()}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            ))}
          </Paper>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default Reports;