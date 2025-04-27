// frontend/src/components/task/TaskForm.tsx
import React from 'react';
import { TextField, Button, MenuItem } from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTask, updateTask, Task } from '../../services/taskService';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  dueDate: z.string(),
  status: z.enum(['todo', 'in-progress', 'done']),
  priority: z.enum(['low', 'medium', 'high']),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  task?: Task | null; // Thêm null vào kiểu của task
  onSubmit: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onSubmit }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: task
      ? {
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          status: task.status,
          priority: task.priority,
        }
      : {
          status: 'todo' as const,
          priority: 'medium' as const,
          dueDate: new Date().toISOString().split('T')[0],
        },
  });

  const onFormSubmit = async (data: TaskFormData) => {
    try {
      if (task?.id) {
        await updateTask(task.id, data);
      } else {
        await createTask(data);
      }
      onSubmit();
    } catch (error) {
      console.error('Error submitting task:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
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
        {task ? 'Update Task' : 'Create Task'}
      </Button>
    </form>
  );
};

export default TaskForm;