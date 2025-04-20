import React, { useState, useEffect } from "react";

interface Subtask {
  id?: number;
  title: string;
  completed: boolean;
}

interface ChecklistProps {
  subtasks: Subtask[];
  onChange: (updated: Subtask[]) => void;
}

const Checklist: React.FC<ChecklistProps> = ({ subtasks, onChange }) => {
  const [items, setItems] = useState<Subtask[]>(subtasks || []);

  useEffect(() => {
    setItems(subtasks); // cập nhật khi props thay đổi từ server
  }, [subtasks]);

  const handleToggle = (index: number) => {
    const updated = [...items];
    updated[index].completed = !updated[index].completed;
    setItems(updated);
    onChange(updated);
  };

  const handleTitleChange = (index: number, title: string) => {
    const updated = [...items];
    updated[index].title = title;
    setItems(updated);
    onChange(updated);
  };

  const handleAdd = () => {
    const updated = [...items, { title: "", completed: false }];
    setItems(updated);
    onChange(updated);
  };

  const handleDelete = (index: number) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
    onChange(updated);
  };

  return (
    <div className="mb-4">
      <h3 className="text-md font-semibold mb-2">Checklist</h3>
      {items.map((item, index) => (
        <div key={index} className="flex items-center mb-2">
          <input
            type="checkbox"
            checked={item.completed}
            onChange={() => handleToggle(index)}
            className="mr-2"
          />
          <input
            type="text"
            value={item.title}
            onChange={(e) => handleTitleChange(index, e.target.value)}
            className="border px-2 py-1 rounded w-full mr-2"
            placeholder="Tên công việc con..."
          />
          <button
            type="button"
            onClick={() => handleDelete(index)}
            className="text-red-500 hover:underline"
          >
            Xoá
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAdd}
        className="text-blue-500 hover:underline mt-2"
      >
        + Thêm checklist
      </button>
    </div>
  );
};

export default Checklist;
