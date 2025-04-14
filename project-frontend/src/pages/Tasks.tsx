import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Container,
} from "@mui/material";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
import TaskForm from "../components/task/TaskForm";
import TaskList from "../components/task/TaskList";
import {
  Task,
  getTasks,
  deleteTask,
  updateTask,
} from "../services/taskService";

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [open, setOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  const fetchTasks = async () => {
    try {
      const tasksData = await getTasks();
      setTasks(tasksData);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await deleteTask(id);
      fetchTasks();
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
    fetchTasks();
    handleClose();
  };

  const handleToggleSubtask = async (
    taskId: number,
    subtaskId: number,
    completed: boolean
  ) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const updatedSubtasks: Task["subtasks"] = task.subtasks.map(
        (subtask: Task["subtasks"][number]): Task["subtasks"][number] =>
          subtask.id === subtaskId ? { ...subtask, completed } : subtask
      );

      await updateTask(taskId, { subtasks: updatedSubtasks });
      fetchTasks();
    } catch (error) {
      console.error("Error toggling subtask:", error);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <Box sx={{ display: "flex", flexGrow: 1 }}>
        <Sidebar />
        <Container sx={{ ml: "5px", mt: 2 }}>
          <Typography variant="h4">Tasks</Typography>
          <Button variant="contained" onClick={handleAdd} sx={{ mb: 1 }}>
            Add Task
          </Button>
          <TaskList
            tasks={tasks}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAssign={fetchTasks}
            onToggleSubtask={handleToggleSubtask}
          />
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
