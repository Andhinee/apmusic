import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, ChevronDown } from 'lucide-react';
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
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handlePlayPause = (e) => {
        e.stopPropagation();
        if (isPlaying) {
            pauseSong();
        } else if (currentSong) {
            resumeSong();
        }
    };

    const handleSeek = (e) => {
        e.stopPropagation();
        seek(Number(e.target.value));
    };

    const toggleExpand = (e) => {
        // Only expand if mobile and not clicking a control button
        if (isMobile && !e.target.closest('.control-btn') && !e.target.closest('.progress-bar')) {
            setIsExpanded(true);
        }
    };

    const collapsePlayer = (e) => {
        e.stopPropagation();
        setIsExpanded(false);
    }

    if (!currentSong) return null;

    return (
        <>
            {/* Mini Player Bar */}
            <div className={`player-bar ${isMobile && isExpanded ? 'hidden' : ''}`} onClick={toggleExpand}>
                {/* The content of the mini player should only render if not expanded on mobile,
                    or always render on desktop. The `hidden` class handles hiding the whole bar on mobile when expanded. */}
                {/* Mobile Progress Line */}
                <div className="mobile-progress-line mobile-only">
                    <div className="progress-fill" style={{ width: `${(progress / duration) * 100}%` }}></div>
                </div>

                <div className="track-info">
                    <div className="track-art-placeholder">
                        {currentSong.file && currentSong.type.startsWith('image/') ?
                            <img src={URL.createObjectURL(currentSong.file)} alt="art" /> :
                            <span>🎵</span>
                        }
                    </div>
                    <div className="track-details">
                        <div className="track-name">{currentSong.title}</div>
                        <div className="track-artist">Unknown Artist</div>
                    </div>
                </div>

                {/* Mobile Controls (Mini) */}
                <div className="mobile-controls mobile-only">
                    {/* The specific requirement was to have an arrow here? Or just expand on click? 
                        User said "change rectangle to down arrow" in the "playbar" context. 
                        If the mini-player IS the playbar, maybe they want an UP arrow to show it expands?
                        But they aid "click down arrow -> becomes image 2" (mini). This implies Down Arrow is on Expanded view.
                        So Mini player just needs to be clickable. */}
                    <button className="control-btn play-btn-mobile" onClick={handlePlayPause}>
                        {isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" />}
                    </button>
                </div>

                {/* Desktop Controls */}
                <div className="player-controls desktop-only">
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

                <div className="volume-controls desktop-only">
                    <Volume2 size={20} />
                    <div className="volume-bar"></div>
                </div>
            </div>

            {/* Medium Expanded Player Mobile Overlay */}
            {isMobile && isExpanded && (
                <div className="medium-player-overlay" onClick={collapsePlayer}>
                    <div className="medium-player-content" onClick={(e) => e.stopPropagation()}>
                        {/* Top: Art & Info */}
                        <div className="medium-player-top">
                            <div className="medium-art">
                                {currentSong.file && currentSong.type.startsWith('image/') ?
                                    <img src={URL.createObjectURL(currentSong.file)} alt="art" /> :
                                    <span>🎵</span>
                                }
                            </div>
                            <div className="medium-info">
                                <div className="mp-title">{currentSong.title}</div>
                                <div className="mp-artist">Unknown Artist</div>
                            </div>
                        </div>

                        {/* Middle: Controls */}
                        <div className="medium-controls">
                            <button className="mp-control-btn" onClick={prevSong}><SkipBack size={28} fill="white" /></button>
                            <button className="mp-play-btn" onClick={handlePlayPause}>
                                {isPlaying ? <Pause size={32} fill="black" /> : <Play size={32} fill="black" />}
                            </button>
                            <button className="mp-control-btn" onClick={nextSong}><SkipForward size={28} fill="white" /></button>
                        </div>

                        {/* Bottom: Progress */}
                        <div className="medium-progress">
                            <div className="time-display">{displayTime(progress)}</div>
                            <input
                                type="range"
                                min="0"
                                max={duration || 0}
                                value={progress}
                                onChange={handleSeek}
                                className="progress-bar medium"
                            />
                            <div className="time-display">{displayTime(duration)}</div>
                        </div>

                        {/* Optional Collapse Visual Hint - User didn't ask but good for UX? 
                             User image doesn't show it. I'll stick to image. 
                             Clicking background (if visible) closes.
                             If overlay covers screen but card is bottom, clicking ABOVE card closes.
                             I'll implement that structure in CSS.
                         */}
                    </div>
                </div>
            )}
        </>
    );
};

export default PlayerBar;
