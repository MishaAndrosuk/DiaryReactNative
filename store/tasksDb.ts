import * as SQLite from 'expo-sqlite';
import { Task } from '../types';

export const db = SQLite.openDatabaseSync('tasks.db');

export async function init() {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        priority TEXT CHECK(priority IN ('low', 'mid', 'high')) NOT NULL,
        status TEXT CHECK(status IN ('in progress', 'completed')) NOT NULL
      );
    `);
  }

export async function addItem(task: Omit<Task, 'id'>) {
    await db.runAsync(
        `INSERT INTO tasks (title, description, date, priority, status) VALUES (?, ?, ?, ?, ?);`,
        [task.title, task.description ?? '', task.date, task.priority, task.status]
    );
}


export async function deleteItem(id: number) {
    await db.runAsync(`DELETE FROM tasks WHERE id = ?;`, [id]);
}

export async function updateItem(task: Task) {
    await db.runAsync(
        `UPDATE tasks SET title = ?, date = ?, priority = ?, status = ? WHERE id = ?;`,
        [task.title, task.date, task.priority, task.status, task.id]
    );
}

export async function getItems(): Promise<Task[]> {
    const items = await db.getAllAsync<Task>('SELECT * FROM tasks');
    return items;
}
