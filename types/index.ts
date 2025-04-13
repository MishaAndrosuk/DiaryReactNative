export interface Task {
    id: number;
    title: string;
    description?: string;
    date: string;
    priority: 'low' | 'mid' | 'high';
    status: 'in progress' | 'completed';
  }