import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, Container, TextField } from "@mui/material";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
import TaskForm from "../components/task/TaskForm";
import TaskCard from "../components/task/TaskCard";
import { Task, getTasks, deleteTask, searchTasks } from "../services/taskService";

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [open, setOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [searchKeyword, setSearchKeyword] = useState("");

  const fetchTasks = async (keyword: string = "") => {
    try {
      const tasksData = keyword ? await searchTasks(keyword) : await getTasks();
      setTasks(tasksData);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSearch = () => {
    fetchTasks(searchKeyword);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTask(id);
      fetchTasks(searchKeyword);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setOpen(true);
  };

  const handleAdd = () => {
    setEditingTask(undefined);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingTask(undefined);
  };

  const handleTaskUpdated = () => {
    fetchTasks(searchKeyword);
    handleClose();
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <Box sx={{ display: "flex", flexGrow: 1 }}>
        <Sidebar />
        <Container sx={{ ml: "5px", mt: 2 }}>
          <Typography variant="h4">Tasks</Typography>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              label="Search Tasks"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              fullWidth
            />
            <Button variant="contained" onClick={handleSearch}>
              Search
            </Button>
            <Button variant="contained" onClick={handleAdd}>
              Add Task
            </Button>
          </Box>
          <Box>
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={() => handleEdit(task)}
                onDelete={() => handleDelete(task.id)}
                onAssign={() => fetchTasks(searchKeyword)}
              />
            ))}
          </Box>
          <Dialog open={open} onClose={handleClose}>
            <DialogTitle>{editingTask ? "Edit Task" : "Add Task"}</DialogTitle>
            <DialogContent>
              <TaskForm task={editingTask} onSubmit={handleTaskUpdated} />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default Tasks;