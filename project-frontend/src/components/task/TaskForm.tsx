import React, { useState } from "react";
import {
  TextField,
  Button,
  MenuItem,
  Box,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createTask,
  updateTask,
  Task,
  Subtask,
} from "../../services/taskService";
import { Add, Delete, AttachFile } from "@mui/icons-material";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  dueDate: z.string(),
  status: z.enum(["todo", "in-progress", "done"]),
  priority: z.enum(["low", "medium", "high"]),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  task?: Task | null;
  onSubmit: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onSubmit }) => {
  const [subtasks, setSubtasks] = useState<Subtask[]>(task?.subtasks || []);
  const [attachments, setAttachments] = useState<File[]>([]); // Danh sách tệp đính kèm
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormData>({
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
          status: "todo" as const,
          priority: "medium" as const,
          dueDate: new Date().toISOString().split("T")[0],
        },
  });

  const handleAddSubtask = () => {
    setSubtasks([...subtasks, { id: 0, title: "", completed: false }]);
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleSubtaskChange = (index: number, value: string) => {
    const updatedSubtasks = [...subtasks];
    updatedSubtasks[index].title = value;
    setSubtasks(updatedSubtasks);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setAttachments([...attachments, ...Array.from(event.target.files)]);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const onFormSubmit = async (data: TaskFormData) => {
    try {
      const taskData = {
        ...data,
        subtasks: subtasks.map((subtask) => ({
          ...subtask,
          id: subtask.id ?? 0,
        })),
        attachments, // Gửi danh sách tệp đính kèm
      };
      if (task?.id) {
        await updateTask(task.id, taskData);
      } else {
        await createTask(taskData);
      }
      onSubmit();
    } catch (error) {
      console.error("Error submitting task:", error);
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
        <MenuItem value="todo">To Do</MenuItem>
        <MenuItem value="in-progress">In Progress</MenuItem>
        <MenuItem value="done">Done</MenuItem>
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

      {/* Subtasks */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1">Subtasks</Typography>
        {subtasks.map((subtask, index) => (
          <Box
            key={index}
            sx={{ display: "flex", alignItems: "center", mt: 1 }}
          >
            <TextField
              value={subtask.title}
              onChange={(e) => handleSubtaskChange(index, e.target.value)}
              placeholder="Subtask title"
              fullWidth
              margin="normal"
            />
            <IconButton
              onClick={() => handleRemoveSubtask(index)}
              color="error"
            >
              <Delete />
            </IconButton>
          </Box>
        ))}
        <Button onClick={handleAddSubtask} startIcon={<Add />} sx={{ mt: 1 }}>
          Add Subtask
        </Button>
      </Box>

      {/* Attachments */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1">Attachments</Typography>
        <Button
          variant="outlined"
          component="label"
          startIcon={<AttachFile />}
          sx={{ mt: 1 }}
        >
          Upload File
          <input type="file" hidden multiple onChange={handleFileChange} />
        </Button>
        <List>
          {attachments.map((file, index) => (
            <ListItem
              key={index}
              sx={{ display: "flex", justifyContent: "space-between" }}
            >
              <ListItemText primary={file.name} />
              <IconButton
                onClick={() => handleRemoveAttachment(index)}
                color="error"
              >
                <Delete />
              </IconButton>
            </ListItem>
          ))}
        </List>
      </Box>

      <Button type="submit" variant="contained" sx={{ mt: 2 }}>
        {task ? "Update Task" : "Create Task"}
      </Button>
    </form>
  );
};

export default TaskForm;
