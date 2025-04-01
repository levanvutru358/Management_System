import React from 'react';
import { TextField, Button, MenuItem } from '@mui/material';
import { useCustomForm } from '../../hooks/useForm';
import { z } from 'zod';
import { createTask } from '../../services/taskService';
import { useAppDispatch } from '../../store/hooks';
import { addTask } from '../../store/slices/taskSlice';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  dueDate: z.string(),
  status: z.enum(['todo', 'in-progress', 'done']),
  priority: z.enum(['low', 'medium', 'high']),
});

type TaskFormData = z.infer<typeof taskSchema>;

const TaskForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const { register, handleSubmit, formState: { errors } } = useCustomForm<TaskFormData>({
    schema: taskSchema,
    defaultValues: {
      status: 'todo',
      priority: 'medium',
    },
  });

  const onSubmit = async (data: TaskFormData) => {
    const newTask = await createTask(data);
    dispatch(addTask(newTask));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        label="Title"
        {...register('title')}
        error={!!errors.title}
        helperText={errors.title?.message}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Description"
        {...register('description')}
        error={!!errors.description}
        helperText={errors.description?.message}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Due Date"
        type="date"
        {...register('dueDate')}
        InputLabelProps={{ shrink: true }}
        fullWidth
        margin="normal"
      />
      <TextField
        select
        label="Status"
        {...register('status')}
        fullWidth
        margin="normal"
      >
        <MenuItem value="todo">To Do</MenuItem>
        <MenuItem value="in-progress">In Progress</MenuItem>
        <MenuItem value="done">Done</MenuItem>
      </TextField>
      <TextField
        select
        label="Priority"
        {...register('priority')}
        fullWidth
        margin="normal"
      >
        <MenuItem value="low">Low</MenuItem>
        <MenuItem value="medium">Medium</MenuItem>
        <MenuItem value="high">High</MenuItem>
      </TextField>
      <Button type="submit" variant="contained" sx={{ mt: 2 }}>
        Create Task
      </Button>
    </form>
  );
};

export default TaskForm;