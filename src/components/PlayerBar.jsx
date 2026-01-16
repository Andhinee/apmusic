import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import '../styles/PlayerBar.css';

const displayTime = (time) => {
    if (!time) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const PlayerBar = () => {
    const { currentSong, isPlaying, playSong, pauseSong, resumeSong, progress, duration, seek, nextSong, prevSong } = usePlayer();

    const handlePlayPause = () => {
        if (isPlaying) {
            pauseSong();
        } else if (currentSong) {
            resumeSong();
        }
    };

    const handleSeek = (e) => {
        seek(Number(e.target.value));
    };

    return (
        <div className="player-bar">
            {/* ... track info ... */}
            <div className="track-info">
                {currentSong && (
                    <>
                        <div className="track-art-placeholder">
                            <span>🎵</span>
                        </div>
                        <div className="track-details">
                            <div className="track-name">{currentSong.title}</div>
                            <div className="track-artist">Unknown Artist</div>
                        </div>
                    </>
                )}
            </div>

            <div className="player-controls">
                <div className="control-buttons">
                    <button className="control-btn"><Shuffle size={16} /></button>
                    <button className="control-btn" onClick={prevSong}><SkipBack size={20} /></button>
                    <button className="control-btn play-btn" onClick={handlePlayPause}>
                        {isPlaying ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" />}
                    </button>
                    <button className="control-btn" onClick={nextSong}><SkipForward size={20} /></button>
                    <button className="control-btn"><Repeat size={16} /></button>
                </div>
                <div className="progress-container">
                    <span className="time">{displayTime(progress)}</span>
                    <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={progress}
                        onChange={handleSeek}
                        className="progress-bar"
                    />
                    <span className="time">{displayTime(duration)}</span>
                </div>
            </div>

            <div className="volume-controls">
                <Volume2 size={20} />
                <div className="volume-bar"></div>
            </div>
        </div>
    );
};

export default PlayerBar;
