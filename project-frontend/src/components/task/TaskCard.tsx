import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Checkbox,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { Task } from "../../services/taskService";

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onAssign: () => void;
  onToggleSubtask: (
    taskId: number,
    subtaskId: number,
    completed: boolean
  ) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onAssign,
  onToggleSubtask,
}) => {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6">{task.title}</Typography>
        <Typography variant="body2">{task.description}</Typography>
        <Typography variant="body2">Due Date: {task.dueDate}</Typography>
        <Typography variant="body2">Status: {task.status}</Typography>
        <Typography variant="body2">Priority: {task.priority}</Typography>
        <Typography variant="body2">
          Assigned to:{" "}
          {task.assignedUserId
            ? `User ID ${task.assignedUserId}`
            : "Not assigned"}
        </Typography>

        {/* Subtasks */}
        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          Subtasks:
        </Typography>
        <List>
          {(task.subtasks || []).map((subtask) => (
            <ListItem key={subtask.id}>
              <Checkbox
                checked={subtask.completed}
                onChange={() =>
                  onToggleSubtask(task.id, subtask.id, !subtask.completed)
                }
              />
              <ListItemText primary={subtask.title} />
            </ListItem>
          ))}
        </List>

        <Box sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={onEdit} sx={{ mr: 1 }}>
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={onDelete}
            sx={{ mr: 1 }}
          >
            Delete
          </Button>
          <Button variant="outlined" onClick={onAssign}>
            Assign
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
