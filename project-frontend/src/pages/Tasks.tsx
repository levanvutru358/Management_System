// src/pages/Tasks.tsx
import React, { useEffect } from 'react';
import { Box, Container, Typography } from '@mui/material';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import TaskForm from '../components/task/TaskForm';
import TaskList from '../components/task/TaskList';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { fetchTasks } from '../store/slices/taskSlice';
import { getTasks } from '../services/taskService';

const Tasks: React.FC = () => {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector((state) => state.tasks.tasks);

  useEffect(() => {
    const loadTasks = async () => {
      const taskList = await getTasks();
      dispatch(fetchTasks(taskList));
    };
    loadTasks();
  }, [dispatch]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        <Sidebar />
        <Container sx={{ ml: '240px', mt: 2 }}>
          <Typography variant="h4">Tasks</Typography>
          <TaskForm />
          <TaskList tasks={tasks} />
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default Tasks;
