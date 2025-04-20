import React, { useState, useEffect } from "react";
import { TextField, Button, MenuItem, Box } from "@mui/material";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTask, updateTask, Task } from "../../services/taskService";
import Checklist from "./Checklist";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  dueDate: z.string(),
  status: z.enum(["todo", "in-progress", "done"]),
  priority: z.enum(["low", "medium", "high"]),
  subtasks: z
    .array(
      z.object({
        id: z.number().optional(),
        title: z.string(),
        completed: z.boolean(),
      })
    )
    .optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  task?: Task | null;
  onSubmit: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: task
      ? {
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          status: task.status,
          priority: task.priority,
          subtasks: task.subtasks || [],
        }
      : {
          title: "",
          description: "",
          dueDate: new Date().toISOString().split("T")[0],
          status: "todo",
          priority: "medium",
          subtasks: [],
        },
  });

  const [subtasks, setSubtasks] = useState<TaskFormData["subtasks"]>(
    task?.subtasks || []
  );
  const [attachments, setAttachments] = useState<FileList | null>(null);

  // 👇 Bắt sự kiện submit
  const onFormSubmit = async (data: TaskFormData) => {
    try {
      const formData = new FormData();

      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("dueDate", data.dueDate);
      formData.append("status", data.status);
      formData.append("priority", data.priority);
      formData.append("subtasks", JSON.stringify(subtasks || []));

      if (attachments) {
        Array.from(attachments).forEach((file) => {
          formData.append("attachments", file);
        });
      }

      if (task?.id) {
        await updateTask(task.id, formData);
      } else {
        await createTask(formData);
      }

      onSubmit();
    } catch (error) {
      console.error("Submit error:", error);
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

      {/* ✅ Checklist */}
      <Checklist subtasks={subtasks || []} onChange={setSubtasks} />

      {/* ✅ File Upload */}
      <Box mt={2}>
        <label>
          <strong>Attachments</strong>
        </label>
        <input
          type="file"
          multiple
          onChange={(e) => setAttachments(e.target.files)}
          style={{ display: "block", marginTop: "8px" }}
        />
        {attachments && (
          <ul style={{ marginTop: "10px" }}>
            {Array.from(attachments).map((file, index) => (
              <li key={index}>
                {file.name}
                {file.type.startsWith("image/") && (
                  <Box mt={1}>
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      width="100"
                      style={{ borderRadius: 8 }}
                    />
                  </Box>
                )}
              </li>
            ))}
          </ul>
        )}
      </Box>

      <Button type="submit" variant="contained" sx={{ mt: 2 }}>
        {task ? "Update Task" : "Create Task"}
      </Button>
    </form>
  );
};

export default TaskForm;
