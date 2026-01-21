import React, { useEffect, useState } from 'react';
import { Play, Clock, Trash2, Search, X, Home, PlusSquare, Plus, Check, Folder, ArrowLeft, Music } from 'lucide-react';
import { addSong, getAllSongs, deleteSong, getPlaylists, addSongToPlaylist, getPlaylistSongs, removeSongFromPlaylist } from '../services/db';
import { usePlayer } from '../context/PlayerContext';
import '../styles/SongList.css';

const SongList = () => {
    const [songs, setSongs] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const { playSong, currentSong } = usePlayer();

    // Views: 'library', 'playlists', 'playlist_detail'
    const [view, setView] = useState('library');
    const [activePlaylist, setActivePlaylist] = useState(null);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [songToAdd, setSongToAdd] = useState(null);
    const [newPlaylistName, setNewPlaylistName] = useState("");

    const loadData = async () => {
        if (view === 'library') {
            const storedSongs = await getAllSongs();
            setSongs(storedSongs);
        } else if (view === 'playlists') {
            const storedPlaylists = await getPlaylists();
            setPlaylists(storedPlaylists);
        } else if (view === 'playlist_detail' && activePlaylist) {
            const playlistSongs = await getPlaylistSongs(activePlaylist.id);
            setSongs(playlistSongs);
        }
        // Always load playlists for the modal
        const allPlaylists = await getPlaylists();
        setPlaylists(allPlaylists);
    };

    useEffect(() => {
        loadData();
    }, [view, activePlaylist]);

    const handleFileUpload = async (event) => {
        const files = event.target.files;
        if (!files) return;

        try {
            for (const file of files) {
                const isAudio = file.type.startsWith('audio/') ||
                    /\.(mp3|wav|m4a|aac|ogg)$/i.test(file.name);

                if (isAudio) {
                    await addSong(file);
                }
            }
            await loadData();
        } catch (error) {
            console.error("Error importing songs:", error);
            alert("Gagal mengimport lagu. (Error: " + error.message + ")");
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (view === 'playlist_detail') {
            if (window.confirm(`Remove this song from playlist "${activePlaylist.name}"?`)) {
                await removeSongFromPlaylist(activePlaylist.id, id);
                await loadData();
            }
        } else {
            if (window.confirm("Delete this song permanently?")) {
                await deleteSong(id);
                await loadData();
            }
        }
    };

    const handleAddToPlaylistClick = (e, id) => {
        e.stopPropagation();
        setSongToAdd(id);
        setNewPlaylistName(""); // Reset input
        setShowModal(true);
    };

    const confirmAddToPlaylist = async (playlistName) => {
        if (playlistName && playlistName.trim() !== "") {
            await addSongToPlaylist(playlistName.trim(), songToAdd);
            // alert(`Song added to playlist "${playlistName}"`); // Optional feedback
            setShowModal(false);
            setSongToAdd(null);
            await loadData();
        }
    };

    const openPlaylist = (playlist) => {
        setActivePlaylist(playlist);
        setView('playlist_detail');
    };

    const filteredSongs = songs
        .filter(song =>
            song.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => a.title.localeCompare(b.title));

    return (
        <div className="song-list-container">
            <div className="header">
                {view === 'playlist_detail' ? (
                    <div className="library-nav" style={{ alignItems: 'center' }}>
                        <ArrowLeft
                            size={32}
                            style={{ cursor: 'pointer', marginRight: '16px', color: '#b3b3b3' }}
                            onClick={() => setView('playlists')}
                        />
                        <h1>{activePlaylist?.name}</h1>
                    </div>
                ) : (
                    <>
                        <div className="library-nav desktop-only">
                            <h1
                                className={`nav-item ${view === 'library' ? 'active' : ''}`}
                                onClick={() => setView('library')}
                            >
                                Your Library
                            </h1>
                            <h1
                                className={`nav-item ${view === 'playlists' ? 'active' : ''}`}
                                onClick={() => setView('playlists')}
                            >
                                Playlists
                            </h1>
                        </div>
                        <h1 className="mobile-title mobile-only">APMusic</h1>
                    </>
                )}

                {view === 'library' && (
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
                )}
            </div>

            {view !== 'playlist_detail' && view !== 'playlists' && (
                <div className="sticky-search-header">
                    <div className="search-container">
                        <Search className="search-icon" size={20} />
                        <input
                            type="text"
                            placeholder="Search for songs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        {searchTerm && (
                            <X
                                className="clear-icon"
                                size={20}
                                onClick={() => setSearchTerm("")}
                            />
                        )}
                    </div>
                </div>
            )}

            {view === 'playlists' ? (
                <div className="playlists-list">
                    {playlists.map(pl => (
                        <div key={pl.id} className="playlist-item-row" onClick={() => openPlaylist(pl)}>
                            <div className="pl-art-box">
                                <Music size={28} color="#b3b3b3" />
                            </div>
                            <div className="pl-info">
                                <span className="pl-name">{pl.name}</span>
                                <span className="pl-meta">Playlist • {pl.songs.length} songs</span>
                            </div>
                        </div>
                    ))}
                    {playlists.length === 0 && (
                        <div className="empty-state">
                            <p>No playlists yet.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="song-table">
                    {(view === 'library' || view === 'playlist_detail') && (
                        <div className="table-header">
                            <div className="col-play">#</div>
                            <div className="col-title">Title</div>
                            <div className="col-date">Date Added</div>
                            <div className="col-action"></div>
                        </div>
                    )}

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
                            <div className="col-action" style={{ display: 'flex', gap: '8px' }}>
                                {view === 'library' && (
                                    <button
                                        className="delete-btn"
                                        title="Add to Playlist"
                                        onClick={(e) => handleAddToPlaylistClick(e, song.id)}
                                    >
                                        <Plus size={18} />
                                    </button>
                                )}
                                <button
                                    className="delete-btn"
                                    onClick={(e) => handleDelete(e, song.id)}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {filteredSongs.length === 0 && (
                        <div className="empty-state">
                            <p>No songs found.</p>
                        </div>
                    )}
                </div>
            )}

            <div className="bottom-nav mobile-only">
                <div
                    className={`nav-item ${view === 'library' ? 'active' : ''}`}
                    onClick={() => { setView('library'); setActivePlaylist(null); }}
                >
                    <Home size={24} />
                    <span>Home</span>
                </div>
                <div
                    className={`nav-item ${view === 'playlists' || view === 'playlist_detail' ? 'active' : ''}`}
                    onClick={() => { setView('playlists'); setActivePlaylist(null); }}
                >
                    <PlusSquare size={24} />
                    <span>Playlist</span>
                </div>
            </div>

            {/* Playlist Selection Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Add to Playlist</h2>
                            <X size={24} style={{ cursor: 'pointer' }} onClick={() => setShowModal(false)} />
                        </div>

                        <div className="modal-body">
                            {playlists.length > 0 && (
                                <div className="existing-playlists">
                                    <h3>Existing Playlists</h3>
                                    <div className="playlist-list">
                                        {playlists.map(pl => (
                                            <div
                                                key={pl.id}
                                                className="playlist-item"
                                                onClick={() => confirmAddToPlaylist(pl.name)}
                                            >
                                                <Folder size={20} />
                                                <span>{pl.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="create-playlist">
                                <h3>Create New Playlist</h3>
                                <div className="create-input-group">
                                    <input
                                        type="text"
                                        placeholder="Playlist Name"
                                        value={newPlaylistName}
                                        onChange={(e) => setNewPlaylistName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && confirmAddToPlaylist(newPlaylistName)}
                                    />
                                    <button onClick={() => confirmAddToPlaylist(newPlaylistName)}>Create</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SongList;
