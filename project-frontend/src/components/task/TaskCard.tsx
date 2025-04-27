import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  TextField,
} from "@mui/material";
import { Task, getTaskComments, addTaskComment } from "../../services/taskService";
import { Comment } from "../../types/task";
import AssignTaskForm from "./AssignTaskForm";
import api from "../../services/api";

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
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const commentsData = await getTaskComments(task.id);
        // Đảm bảo commentsData là một mảng và khớp với kiểu Comment
        if (Array.isArray(commentsData)) {
          setComments(commentsData);
        } else {
          console.error("Invalid comments data:", commentsData);
          setComments([]);
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
        setComments([]);
      }
    };
    fetchComments();
  }, [task.id]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const addedComment = await addTaskComment(task.id, newComment);
      setComments((prevComments) => [...prevComments, addedComment]);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const syncWithGoogleCalendar = async () => {
    try {
      await api.post(`/integrations/calendar/${task.id}`);
      alert("Task synced with Google Calendar");
    } catch (error) {
      console.error("Error syncing with Google Calendar:", error);
      alert("Failed to sync with Google Calendar");
    }
  };

  const sendEmailReminder = async () => {
    try {
      await api.post(`/integrations/email/${task.id}`);
      alert("Email reminder sent");
    } catch (error) {
      console.error("Error sending email reminder:", error);
      alert("Failed to send email reminder");
    }
  };

  const handleOpenAssign = () => setOpenAssign(true);
  const handleCloseAssign = () => setOpenAssign(false);

  const subtasks = task.subtasks ?? [];

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
            Assigned to: {task.assignedUserId ? `User ID ${task.assignedUserId}` : "Not assigned"}
          </Typography>

          {/* Checklist */}
          {subtasks.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                Checklist
              </Typography>
              <ul style={{ paddingLeft: "1.2em", margin: 0 }}>
                {subtasks.map((subtask) => (
                  <li key={subtask.id}>
                    <Typography
                      variant="body2"
                      sx={{
                        textDecoration: subtask.completed ? "line-through" : "none",
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
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
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

          {/* Comments */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
              Comments
            </Typography>
            <List dense>
              {comments.map((comment) => (
                <ListItem key={comment.id}>
                  <ListItemText
                    primary={comment.content}
                    secondary={
                      comment.userId && comment.createdAt
                        ? `User ID ${comment.userId} - ${new Date(comment.createdAt).toLocaleString()}`
                        : "Unknown user - Unknown date"
                    }
                  />
                </ListItem>
              ))}
            </List>
            <TextField
              label="Add a comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              fullWidth
              margin="normal"
            />
            <Button onClick={handleAddComment} variant="contained" sx={{ mt: 1 }}>
              Add Comment
            </Button>
          </Box>

          {/* Actions */}
          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" onClick={onEdit} sx={{ mr: 1 }}>
              Edit
            </Button>
            <Button variant="outlined" color="error" onClick={onDelete} sx={{ mr: 1 }}>
              Delete
            </Button>
            <Button variant="outlined" onClick={handleOpenAssign} sx={{ mr: 1 }}>
              Assign
            </Button>
            <Button variant="outlined" onClick={syncWithGoogleCalendar} sx={{ mr: 1 }}>
              Sync with Google Calendar
            </Button>
            <Button variant="outlined" onClick={sendEmailReminder}>
              Send Email Reminder
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