import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task } from '../../types/task';

interface TaskState {
  tasks: Task[];
}

const initialState: TaskState = {
  tasks: [],
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    fetchTasks(state, action: PayloadAction<Task[]>) {
      state.tasks = action.payload;
    },
    addTask(state, action: PayloadAction<Task>) {
      state.tasks.push(action.payload);
    },
  },
});

export const { fetchTasks, addTask } = taskSlice.actions;
export default taskSlice.reducer;