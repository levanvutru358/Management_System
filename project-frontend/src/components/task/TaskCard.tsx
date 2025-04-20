import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { Task } from "../../services/taskService";
import AssignTaskForm from "./AssignTaskForm";

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onAssign: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onAssign,
}) => {
  const [openAssign, setOpenAssign] = useState(false);

  const handleOpenAssign = () => setOpenAssign(true);
  const handleCloseAssign = () => setOpenAssign(false);

  const subtasks = task.subtasks ?? [];

  return (
    <>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6">{task.title}</Typography>
          <Typography variant="body2">{task.description}</Typography>
          <Typography variant="body2">Deadline: {task.deadline}</Typography>
          <Typography variant="body2">Status: {task.status}</Typography>
          <Typography variant="body2">Priority: {task.priority}</Typography>
          <Typography variant="body2">
            Assigned to:{" "}
            {task.assignedTo ? `User ID ${task.assignedTo}` : "Not assigned"}
          </Typography>

          {/* Checklist - hiển thị dạng chấm tròn */}
          {subtasks.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: "bold", mb: 1 }}
              >
                Checklist
              </Typography>
              <ul style={{ paddingLeft: "1.2em", margin: 0 }}>
                {subtasks.map((subtask) => (
                  <li key={subtask.id}>
                    <Typography
                      variant="body2"
                      sx={{
                        textDecoration: subtask.completed
                          ? "line-through"
                          : "none",
                        color: subtask.completed ? "gray" : "inherit",
                      }}
                    >
                      {subtask.title}
                    </Typography>
                  </li>
                ))}
              </ul>
            </Box>
          )}

          {/* Attachments */}
          {Array.isArray(task.attachments) && task.attachments.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: "bold", mb: 1 }}
              >
                Attachments
              </Typography>
              <List dense>
                {task.attachments.map((file) => (
                  <ListItem key={file.id}>
                    <Typography component="span" sx={{ mr: 1 }}>
                      📎
                    </Typography>
                    <ListItemText
                      primary={
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: "none", color: "#1976d2" }}
                        >
                          {file.filename}
                        </a>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Actions */}
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
            <Button variant="outlined" onClick={handleOpenAssign}>
              Assign
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Assign Modal */}
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
