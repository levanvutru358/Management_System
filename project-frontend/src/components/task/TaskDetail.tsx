import React from "react";
import { Task } from "../../types/task"; // chỉnh đường dẫn nếu khác

interface TaskDetailProps {
  task: Task;
}

const TaskDetail: React.FC<TaskDetailProps> = ({ task }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{task.title}</h2>
      <p>{task.description}</p>

      {task.attachments && task.attachments.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">File đính kèm:</h3>
          <ul className="list-disc list-inside space-y-1">
            {task.attachments.map((file, index) => (
              <li key={index}>
                <a
                  href={file.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  📎 {file.filename}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TaskDetail;
