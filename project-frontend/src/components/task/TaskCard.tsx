import React, { useState } from "react";
import { Card, CardContent, Typography, Button, Box } from "@mui/material";
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
  const subtasks = task.subtasks || [];
  const attachments = task.attachments || [];

  const handleOpenAssign = () => setOpenAssign(true);
  const handleCloseAssign = () => setOpenAssign(false);

  return (
    <>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {task.title}
          </Typography>

          {/* Hiển thị số file đính kèm */}
          {attachments.length > 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}
            >
              📎 {attachments.length} file
            </Typography>
          )}

          <Typography variant="body2" sx={{ mb: 0.5 }}>
            {task.description}
          </Typography>
          <Typography variant="body2">Deadline: {task.deadline}</Typography>
          <Typography variant="body2">Status: {task.status}</Typography>
          <Typography variant="body2">Priority: {task.priority}</Typography>
          <Typography variant="body2">
            Assigned to:{" "}
            {task.assignedTo ||
              (task.assignedTo ? `User ID ${task.assignedTo}` : "Not assigned")}
          </Typography>

          {/* Checklist và Attachments */}
          {(subtasks.length > 0 || attachments.length > 0) && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 2,
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              {/* Checklist */}
              {subtasks.length > 0 && (
                <Box sx={{ flex: "1 1 45%", minWidth: "250px" }}>
                  <Typography variant="subtitle1" fontWeight="bold" mb={1}>
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
                            wordBreak: "break-word",
                          }}
                        >
                          {subtask.title}
                        </Typography>
                      </li>
                    ))}
                  </ul>
                </Box>
              )}

              {/* Attachments (simple version) */}
              {attachments.length > 0 && (
                <Box sx={{ flex: "1 1 45%", minWidth: "250px" }}>
                  <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                    Attachments
                  </Typography>
                  <ul style={{ paddingLeft: "1.2em", margin: 0 }}>
                    {attachments.map((file, index) => (
                      <li key={index}>
                        <a
                          href={file.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            textDecoration: "none",
                            color: "#1976d2",
                            wordBreak: "break-word",
                          }}
                        >
                          📎 {file.filename}
                        </a>
                      </li>
                    ))}
                  </ul>
                </Box>
              )}
            </Box>
          )}

          {/* Action Buttons */}
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
