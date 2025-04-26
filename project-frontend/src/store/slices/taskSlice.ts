// src/store/slices/taskSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task } from '../../types/task';
import { Comment } from '../../types/comment';

interface TaskState {
  tasks: Task[];
  comments: { [taskId: number]: Comment[] };
}

const initialState: TaskState = {
  tasks: [],
  comments: {},
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
    fetchComments(state, action: PayloadAction<{ taskId: number; comments: Comment[] }>) {
      const { taskId, comments } = action.payload;
      state.comments[taskId] = comments;
    },
    addComment(state, action: PayloadAction<{ taskId: number; comment: Comment }>) {
      const { taskId, comment } = action.payload;
      if (state.comments[taskId]) {
        state.comments[taskId].push(comment);
      } else {
        state.comments[taskId] = [comment];
      }
    },
  },
});

export const { fetchTasks, addTask, fetchComments, addComment } = taskSlice.actions;
export default taskSlice.reducer;
