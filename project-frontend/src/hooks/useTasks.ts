import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchTasks } from '../store/slices/taskSlice';
import { getTasks } from '../services/taskService';

export const useTasks = () => {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector((state) => state.tasks.tasks);

  useEffect(() => {
    const loadTasks = async () => {
      const taskList = await getTasks();
      dispatch(fetchTasks(taskList));
    };
    loadTasks();
  }, [dispatch]);

  return tasks;
};