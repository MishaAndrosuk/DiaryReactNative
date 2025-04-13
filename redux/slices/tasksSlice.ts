import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task } from '../../types';

interface TasksState {
  tasks: Task[];
  inProgressCount: number;
}

const initialState: TasksState = {
  tasks: [],
  inProgressCount: 0,
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
      state.inProgressCount = action.payload.filter(task => task.status === 'in progress').length;
    },
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.push(action.payload);
      if (action.payload.status === 'in progress') {
        state.inProgressCount++;
      }
    },
    updateTask: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        const wasInProgress = state.tasks[index].status === 'in progress';
        const nowInProgress = action.payload.status === 'in progress';
        if (wasInProgress && !nowInProgress) {
          state.inProgressCount--;
        } else if (!wasInProgress && nowInProgress) {
          state.inProgressCount++;
        }
        state.tasks[index] = action.payload;
      }
    },
    deleteTask: (state, action: PayloadAction<number>) => {
      const task = state.tasks.find(t => t.id === action.payload);
      if (task?.status === 'in progress') {
        state.inProgressCount--;
      }
      state.tasks = state.tasks.filter(t => t.id !== action.payload);
    },
    markTaskCompleted: (state, action: PayloadAction<number>) => {
      const task = state.tasks.find(t => t.id === action.payload);
      if (task && task.status !== 'completed') {
        if (task.status === 'in progress') {
          state.inProgressCount--;
        }
        task.status = 'completed';
      }
    },
  },
});

export const {
  setTasks,
  addTask,
  updateTask,
  deleteTask,
  markTaskCompleted,
} = tasksSlice.actions;

export default tasksSlice.reducer;