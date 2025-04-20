import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  MenuItem,
  Checkbox,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTask, updateTask, Task } from "../../services/taskService";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";
import { Attachment } from "../../types/task";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  deadline: z.string(),
  status: z.enum(["Todo", "Doing", "Done", "Archived"]),
  priority: z.enum(["Low", "Medium", "High"]),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface TaskFormProps {
  task?: Task | null;
  onSubmit: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onSubmit }) => {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [subtaskInput, setSubtaskInput] = useState("");
  const [existingFiles, setExistingFiles] = useState<Attachment[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: task
      ? {
          title: task.title,
          description: task.description ?? "",
          deadline: task.deadline ?? new Date().toISOString().split("T")[0],
          status: task.status ?? "Todo",
          priority: task.priority ?? "Medium",
        }
      : {
          title: "",
          description: "",
          deadline: new Date().toISOString().split("T")[0],
          status: "Todo",
          priority: "Medium",
        },
  });

  useEffect(() => {
    if (task?.subtasks) {
      setSubtasks(
        task.subtasks.map((s, i) => ({
          id: s.id?.toString() || i.toString(),
          title: s.title,
          completed: s.completed ?? false,
        }))
      );
    }

    if (task?.attachments) {
      setExistingFiles(task.attachments);
    }
  }, [task]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setNewFiles(Array.from(e.target.files));
    }
  };

  const addSubtask = () => {
    if (!subtaskInput.trim()) return;
    setSubtasks([
      ...subtasks,
      { id: Date.now().toString(), title: subtaskInput, completed: false },
    ]);
    setSubtaskInput("");
  };

  const toggleSubtask = (id: string) => {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const removeSubtask = (id: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  };

  const onFormSubmit = async (data: TaskFormData) => {
    try {
      const formData = new FormData();

      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("deadline", data.deadline);
      formData.append("status", data.status);
      formData.append("priority", data.priority);

      formData.append(
        "subtasks",
        JSON.stringify(
          subtasks.map((s, index) => ({
            id: parseInt(s.id) || index,
            title: s.title,
            completed: s.completed ?? false,
          }))
        )
      );

      newFiles.forEach((file) => {
        formData.append("files", file);
      });

      if (task?.id) {
        await updateTask(task.id, formData);
      } else {
        await createTask(formData);
      }

      onSubmit();
    } catch (error: any) {
      console.error("Submit task error:", error);
      alert("Lỗi khi gửi task. Kiểm tra lại dữ liệu hoặc file upload.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <TextField
        label="Title"
        {...register("title")}
        error={!!errors.title}
        helperText={errors.title?.message}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Description"
        {...register("description")}
        error={!!errors.description}
        helperText={errors.description?.message}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Deadline"
        type="date"
        {...register("deadline")}
        InputLabelProps={{ shrink: true }}
        fullWidth
        margin="normal"
      />
      <TextField
        select
        label="Status"
        {...register("status")}
        fullWidth
        margin="normal"
      >
        <MenuItem value="Todo">To Do</MenuItem>
        <MenuItem value="Doing">Doing</MenuItem>
        <MenuItem value="Done">Done</MenuItem>
        <MenuItem value="Archived">Archived</MenuItem>
      </TextField>
      <TextField
        select
        label="Priority"
        {...register("priority")}
        fullWidth
        margin="normal"
      >
        <MenuItem value="Low">Low</MenuItem>
        <MenuItem value="Medium">Medium</MenuItem>
        <MenuItem value="High">High</MenuItem>
      </TextField>

      <Typography variant="subtitle1" sx={{ mt: 3 }}>
        Existing Attachments:
      </Typography>
      <List dense>
        {existingFiles.map((file) => (
          <ListItem key={file.id} disablePadding sx={{ mb: 1 }}>
            {file.path.match(/\.(jpg|jpeg|png|gif)$/i) ? (
              <a href={file.path} target="_blank" rel="noopener noreferrer">
                <img
                  src={file.path}
                  alt={file.filename}
                  style={{ maxWidth: "100%", maxHeight: 150, borderRadius: 4 }}
                />
              </a>
            ) : (
              <ListItemText
                primary={
                  <a
                    href={file.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#1976d2", textDecoration: "none" }}
                  >
                    📎 {file.filename}
                  </a>
                }
              />
            )}
          </ListItem>
        ))}
      </List>

      <Button component="label" startIcon={<UploadFileIcon />} sx={{ mt: 2 }}>
        Upload New File
        <input hidden multiple type="file" onChange={handleFileChange} />
      </Button>
      <div>
        {newFiles.map((file) => (
          <div key={file.name}>{file.name}</div>
        ))}
      </div>

      <Typography variant="subtitle1" sx={{ mt: 2 }}>
        Subtasks ({subtasks.filter((s) => s.completed).length}/{subtasks.length}{" "}
        completed)
      </Typography>

      <TextField
        label="New Subtask"
        value={subtaskInput}
        onChange={(e) => setSubtaskInput(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Button onClick={addSubtask} variant="outlined" size="small">
        Add Subtask
      </Button>

      <List>
        {subtasks.map((subtask) => (
          <ListItem key={subtask.id} dense>
            <Checkbox
              checked={subtask.completed}
              onChange={() => toggleSubtask(subtask.id)}
            />
            <ListItemText
              primary={subtask.title}
              sx={{
                textDecoration: subtask.completed ? "line-through" : "none",
              }}
            />
            <ListItemSecondaryAction>
              <IconButton edge="end" onClick={() => removeSubtask(subtask.id)}>
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Button type="submit" variant="contained" sx={{ mt: 2 }}>
        {task ? "Update Task" : "Create Task"}
      </Button>
    </form>
  );
};

export default TaskForm;
