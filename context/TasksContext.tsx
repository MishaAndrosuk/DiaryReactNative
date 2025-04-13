import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Task } from '../types';
import * as db from '../store/tasksDb';

interface TasksContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  getTodayTasks: () => Task[];
}

const TasksContext = createContext<TasksContextType | null>(null);

export const useTasks = () => {
  const context = useContext(TasksContext);
  if (!context) throw new Error('useTasks must be used inside TasksProvider');
  return context;
};

export const TasksProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const load = async () => {
    await db.init();
    const items = await db.getItems();
    setTasks(items);
  };

  const addTask = async (task: Omit<Task, 'id'>) => {
    await db.addItem(task);
    await load();
  };

  const updateTask = async (task: Task) => {
    await db.updateItem(task);
    await load();
  };

  const deleteTask = async (id: number) => {
    await db.deleteItem(id);
    await load();
  };

  const getTodayTasks = () => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter((t) => t.date.startsWith(today));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <TasksContext.Provider
      value={{ tasks, addTask, updateTask, deleteTask, getTodayTasks }}
    >
      {children}
    </TasksContext.Provider>
  );
};
