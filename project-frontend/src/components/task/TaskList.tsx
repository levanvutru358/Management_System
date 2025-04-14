import React from "react";
import TaskCard from "./TaskCard";
import { Task } from "../../services/taskService";

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onAssign: () => void;
  onToggleSubtask: (
    taskId: number,
    subtaskId: number,
    completed: boolean
  ) => void; // Add handler for subtasks
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onEdit,
  onDelete,
  onAssign,
  onToggleSubtask,
}) => {
  return (
    <div>
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={() => onEdit(task)}
          onDelete={() => onDelete(task.id)}
          onAssign={onAssign}
          onToggleSubtask={onToggleSubtask} // Pass the handler to TaskCard
        />
      ))}
    </div>
  );
};

export default TaskList;
