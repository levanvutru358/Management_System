import React from "react";
import { Task } from "../../types/task";

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onAssign: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onAssign }) => {
  return (
    <div className="border p-4 mb-4 rounded shadow">
      <h3 className="text-xl font-semibold">{task.title}</h3>
      <p>{task.description}</p>
      <p>Due Date: {task.deadline}</p>
      <p>Status: {task.status}</p>
      <p>Priority: {task.priority}</p>
      <p>Assigned to: {task.assignedTo ? task.assignedTo.name : "Not assigned"}</p>

      {/* ✅ Checklist */}
      {task.subtasks && task.subtasks.length > 0 && (
        <div className="mt-2">
          <strong>Checklist:</strong>
          <ul className="list-disc pl-5">
            {task.subtasks.map((subtask) => (
              <li key={subtask.id}>
                <input type="checkbox" checked={subtask.completed} readOnly className="mr-2" />
                {subtask.title}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ✅ Attachments */}
      {task.attachments && task.attachments.length > 0 && (
        <div className="mt-2">
          <strong>Attachments:</strong>
          <ul className="list-disc pl-5">
            {task.attachments.map((file) => (
              <li key={file.id}>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  {file.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button onClick={onEdit} className="btn btn-primary">Edit</button>
        <button onClick={onDelete} className="btn btn-danger">Delete</button>
        <button onClick={onAssign} className="btn btn-secondary">Assign</button>
      </div>
    </div>
  );
};

export default TaskCard;
