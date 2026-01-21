import { openDB } from 'idb';

const DB_NAME = 'APMusicDB';
const DB_VERSION = 4;

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('songs')) {
        const store = db.createObjectStore('songs', { keyPath: 'id', autoIncrement: true });
        store.createIndex('title', 'title', { unique: false });
        store.createIndex('dateAdded', 'dateAdded', { unique: false });
      }
      if (!db.objectStoreNames.contains('playlists')) {
        const store = db.createObjectStore('playlists', { keyPath: 'id', autoIncrement: true });
        store.createIndex('name', 'name', { unique: true });
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

// Playlists
export const getPlaylists = async () => {
  const db = await initDB();
  return db.getAll('playlists');
};

export const addSongToPlaylist = async (playlistName, songId) => {
  const db = await initDB();
  const tx = db.transaction('playlists', 'readwrite');
  const store = tx.objectStore('playlists');
  const index = store.index('name');

  let playlist = await index.get(playlistName);

  if (!playlist) {
    // Create new if not exists
    await store.add({
      name: playlistName,
      songs: [songId],
      createdAt: new Date()
    });
  } else {
    // Add song if not in playlist
    if (!playlist.songs.includes(songId)) {
      playlist.songs.push(songId);
      await store.put(playlist);
    }
  }
  await tx.done;
};

export const getPlaylistSongs = async (playlistId) => {
  const db = await initDB();
  const playlist = await db.get('playlists', playlistId);
  if (!playlist) return [];

  const allSongs = await db.getAll('songs');
  // Return songs that are in the playlist.
  return allSongs.filter(song => playlist.songs.includes(song.id));
};

export const removeSongFromPlaylist = async (playlistId, songId) => {
  const db = await initDB();
  const playlist = await db.get('playlists', playlistId);
  if (playlist) {
    playlist.songs = playlist.songs.filter(id => id !== songId);
    await db.put('playlists', playlist);
  }
};
