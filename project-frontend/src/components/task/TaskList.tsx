// frontend/src/components/task/TaskList.tsx
import React from 'react';
import TaskCard from './TaskCard';
import { Task } from '../../services/taskService';

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onAssign: () => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onEdit, onDelete, onAssign }) => {
  return (
    <div>
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={() => onEdit(task)}
          onDelete={() => onDelete(task.id)}
          onAssign={onAssign}
        />
      ))}
    </div>
  );
};

export default TaskList;