import { openDB } from 'idb';

const DB_NAME = 'APMusicDB';
const DB_VERSION = 3;

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('songs')) {
        const store = db.createObjectStore('songs', { keyPath: 'id', autoIncrement: true });
        store.createIndex('title', 'title', { unique: false });
        store.createIndex('dateAdded', 'dateAdded', { unique: false });
      }
    },
  });
};

export const addSong = async (file) => {
  const db = await initDB();
  const song = {
    title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
    file: file,
    type: file.type,
    dateAdded: new Date(),
  };
  return db.add('songs', song);
};

export const getAllSongs = async () => {
  const db = await initDB();
  return db.getAll('songs');
};

export const deleteSong = async (id) => {
  const db = await initDB();
  return db.delete('songs', id);
};
