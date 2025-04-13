import * as SQLite from 'expo-sqlite';

export interface Note {
  id: number;
  text: string;
}

const db = SQLite.openDatabaseSync('notes.db');

export async function initNotes() {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL
    );
  `);
}

export async function getNotes(): Promise<Note[]> {
  return await db.getAllAsync<Note>('SELECT * FROM notes');
}

export async function addNote(text: string) {
  await db.runAsync(`INSERT INTO notes (text) VALUES (?)`, [text]);
}

export async function updateNote(id: number, text: string) {
  await db.runAsync(`UPDATE notes SET text = ? WHERE id = ?`, [text, id]);
}

export async function deleteNote(id: number) {
  await db.runAsync(`DELETE FROM notes WHERE id = ?`, [id]);
}
