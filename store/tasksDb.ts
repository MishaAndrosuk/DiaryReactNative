import * as SQLite from 'expo-sqlite';
import { Task } from '../types';

export const taskDb = SQLite.openDatabaseSync('tasks.db');

export async function init() {
    await taskDb.execAsync(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    priority TEXT CHECK(priority IN ('low', 'mid', 'high')) NOT NULL,
    status TEXT CHECK(status IN ('in progress', 'completed')) NOT NULL
  );
`);
}


export async function addItem(task: Omit<Task, 'id'>): Promise<number> {
    const result = await taskDb.runAsync(
        `INSERT INTO tasks (title, description, date, priority, status) VALUES (?, ?, ?, ?, ?);`,
        [task.title, task.description ?? '', task.date, task.priority, task.status]
    );
    console.log('SQLite insert result:', result);
    return result.lastInsertRowId as number;
}


export async function deleteItem(id: number) {
    await taskDb.runAsync(`DELETE FROM tasks WHERE id = ?;`, [id]);
}

export async function updateItem(task: Task) {
    await taskDb.runAsync(
        `UPDATE tasks SET title = ?, date = ?, priority = ?, status = ? WHERE id = ?;`,
        [task.title, task.date, task.priority, task.status, task.id]
    );
}

export async function getItems(): Promise<Task[]> {
    const items = await taskDb.getAllAsync<Task>('SELECT * FROM tasks');
    return items;
}
