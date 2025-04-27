import React, { useState } from 'react';
import { Card, CardContent, Typography, Button, Box } from '@mui/material';
import { Task } from '../../services/taskService';
import AssignTaskForm from './AssignTaskForm';

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onAssign: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onAssign }) => {
  const [openAssign, setOpenAssign] = useState(false);

  const handleOpenAssign = () => setOpenAssign(true);
  const handleCloseAssign = () => setOpenAssign(false);

  return (
    <>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6">{task.title}</Typography>
          <Typography variant="body2">{task.description}</Typography>
          <Typography variant="body2">Due Date: {task.dueDate}</Typography>
          <Typography variant="body2">Status: {task.status}</Typography>
          <Typography variant="body2">Priority: {task.priority}</Typography>
          <Typography variant="body2">
            Assigned to: {task.assignedUserId ? `User ID ${task.assignedUserId}` : 'Not assigned'}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" onClick={onEdit} sx={{ mr: 1 }}>
              Edit
            </Button>
            <Button variant="outlined" color="error" onClick={onDelete} sx={{ mr: 1 }}>
              Delete
            </Button>
            <Button variant="outlined" onClick={handleOpenAssign}>
              Assign
            </Button>
          </Box>
        </CardContent>
      </Card>
      <AssignTaskForm
        taskId={task.id}
        open={openAssign}
        onClose={handleCloseAssign}
        onAssign={onAssign}
      />
    </>
  );
};

export default TaskCard;