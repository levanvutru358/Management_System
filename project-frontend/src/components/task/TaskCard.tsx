// src/components/task/TaskCard.tsx
import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { Task } from '../../types/task';
import CommentBox from './CommentBox';

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6">{task.title}</Typography>
        <Typography>{task.description}</Typography>
        <Typography>Due: {task.dueDate}</Typography>
        <Typography>Status: {task.status}</Typography>
        <Typography>Priority: {task.priority}</Typography>

        {/* Thêm CommentBox ở đây */}
        <CommentBox taskId={task.id} />
      </CardContent>
    </Card>
  );
};

export default TaskCard;
