// frontend/src/components/task/AssignTaskForm.tsx
import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { assignTask, getUsers, User } from '../../services/taskService';

interface AssignTaskFormProps {
  taskId: number;
  open: boolean;
  onClose: () => void;
  onAssign: () => void;
}

const AssignTaskForm: React.FC<AssignTaskFormProps> = ({ taskId, open, onClose, onAssign }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await getUsers();
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async () => {
    if (selectedUserId === '') return;
    try {
      await assignTask(taskId, selectedUserId);
      onAssign(); // Callback để cập nhật danh sách task
      onClose();
    } catch (error) {
      console.error('Error assigning task:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Assign Task</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="normal">
          <InputLabel>User</InputLabel>
          <Select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value as number)}
            label="User"
          >
            <MenuItem value="">
              <em>Select a user</em>
            </MenuItem>
            {users.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                {user.name} ({user.email})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={selectedUserId === ''}>
          Assign
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignTaskForm;