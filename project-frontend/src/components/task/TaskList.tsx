import React from "react";
import { Box, Button, Typography } from "@mui/material";

interface Task {
  id: string;
  title: string;
  dueDate: string;
  status: string;
  priority: string;
  assignedTo?: string;
}

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onAssign: (task: Task) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onEdit,
  onDelete,
  onAssign,
}) => {
  return (
    <Box
      sx={{
        mt: "64px", // khoảng trống để tránh đè lên header
        height: "calc(100vh - 64px)", // chỉ lấy phần còn lại của màn hình
        overflowY: "auto",
        p: 2,
      }}
    >
      {tasks.length === 0 ? (
        <Typography>No tasks available</Typography>
      ) : (
        tasks.map((task) => (
          <Box
            key={task.id}
            sx={{ mb: 2, p: 2, border: "1px solid #ddd", borderRadius: "4px" }}
          >
            <Typography variant="h6">{task.title}</Typography>
            <Typography>Due Date: {task.dueDate}</Typography>
            <Typography>Status: {task.status}</Typography>
            <Typography>Priority: {task.priority}</Typography>
            <Typography>
              Assigned to: {task.assignedTo || "Not assigned"}
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Button onClick={() => onEdit(task)} sx={{ mr: 1 }}>
                Edit
              </Button>
              <Button
                onClick={() => onDelete(task.id)}
                sx={{ mr: 1 }}
                color="error"
              >
                Delete
              </Button>
              <Button onClick={() => onAssign(task)} color="primary">
                Assign
              </Button>
            </Box>
          </Box>
        ))
      )}
    </Box>
  );
};

export default TaskList;
