import React, { useEffect, useState } from 'react';
import { Play, Clock, Trash2, Search } from 'lucide-react';
import { addSong, getAllSongs, deleteSong } from '../services/db';
import { usePlayer } from '../context/PlayerContext';
import '../styles/SongList.css';

const SongList = () => {
    const [songs, setSongs] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const { playSong, currentSong } = usePlayer();

    const loadSongs = async () => {
        const storedSongs = await getAllSongs();
        setSongs(storedSongs);
    };

    useEffect(() => {
        loadSongs();
    }, []);

    const handleFileUpload = async (event) => {
        const files = event.target.files;
        if (!files) return;

        try {
            for (const file of files) {
                // Compatibility: Check MIME type OR file extension for iOS
                const isAudio = file.type.startsWith('audio/') ||
                    /\.(mp3|wav|m4a|aac|ogg)$/i.test(file.name);

                if (isAudio) {
                    await addSong(file);
                }
            }
            await loadSongs();
        } catch (error) {
            console.error("Error importing songs:", error);
            alert("Gagal mengimport lagu. Coba refresh halaman. (Error: " + error.message + ")");
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm("Delete this song?")) {
            await deleteSong(id);
            await loadSongs();
        }
    };

    const filteredSongs = songs.filter(song =>
        song.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="song-list-container">
            <div className="header">
                <h1>Your Library</h1>

                <div className="search-container">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        placeholder="Search for songs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>

                <label className="import-btn">
                    Import Songs
                    <input
                        type="file"
                        accept="audio/*, .mp3, .wav, .m4a, .aac, .ogg"
                        multiple
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                    />
                </label>
            </div>

            <div className="song-table">
                <div className="table-header">
                    <div className="col-play">#</div>
                    <div className="col-title">Title</div>
                    <div className="col-date">Date Added</div>
                    <div className="col-action"></div>
                </div>

                {filteredSongs.map((song, index) => (
                    <div
                        key={song.id}
                        className={`table-row ${currentSong?.id === song.id ? 'active' : ''}`}
                        onClick={() => playSong(song, filteredSongs)}
                    >
                        <div className="col-play">
                            <span className="index">{index + 1}</span>
                            <Play size={12} className="play-icon" fill="white" />
                        </div>
                        <div className="col-title">
                            <div className="song-title">{song.title}</div>
                        </div>
                        <div className="col-date">
                            {song.dateAdded ? new Date(song.dateAdded).toLocaleDateString() : '-'}
                        </div>
                        <div className="col-action">
                            <button
                                className="delete-btn"
                                onClick={(e) => handleDelete(e, song.id)}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                {songs.length === 0 && (
                    <div className="empty-state">
                        <p>No songs found. Import audio files to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SongList;
