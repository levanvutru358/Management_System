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
} from "@mui/material";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTask, updateTask, Task } from "../../services/taskService";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  dueDate: z.string(),
  status: z.enum(["Todo", "InProgress", "Done"]),
  priority: z.enum(["low", "medium", "high"]),
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
  const [files, setFiles] = useState<File[]>([]);

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
          dueDate: task.dueDate ?? new Date().toISOString().split("T")[0],
          status: task.status ?? "Todo",
          priority: task.priority ?? "medium",
        }
      : {
          title: "",
          description: "",
          dueDate: new Date().toISOString().split("T")[0],
          status: "Todo",
          priority: "medium",
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
      // Nếu muốn preview tên file đã upload từ backend, bạn có thể lưu vào state khác
      // hoặc tạo phần hiển thị riêng
    }
  }, [task]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setFiles(Array.from(e.target.files));
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
      const fullData = {
        ...data,
        subtasks: subtasks.map((s, index) => ({
          id: parseInt(s.id) || index,
          title: s.title,
          completed: s.completed ?? false,
        })),
        files,
      };

      if (task?.id) {
        await updateTask(task.id, fullData);
      } else {
        await createTask(fullData);
      }

      onSubmit();
    } catch (error) {
      console.error("Submit task error:", error);
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
        label="Due Date"
        type="date"
        {...register("dueDate")}
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
        <MenuItem value="InProgress">In Progress</MenuItem>
        <MenuItem value="Done">Done</MenuItem>
      </TextField>

      <TextField
        select
        label="Priority"
        {...register("priority")}
        fullWidth
        margin="normal"
      >
        <MenuItem value="low">Low</MenuItem>
        <MenuItem value="medium">Medium</MenuItem>
        <MenuItem value="high">High</MenuItem>
      </TextField>

      {/* File Upload */}
      <Button component="label" startIcon={<UploadFileIcon />} sx={{ mt: 2 }}>
        Upload File
        <input hidden multiple type="file" onChange={handleFileChange} />
      </Button>
      <div>
        {files.map((file) => (
          <div key={file.name}>{file.name}</div>
        ))}
      </div>

      {/* Subtasks */}
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