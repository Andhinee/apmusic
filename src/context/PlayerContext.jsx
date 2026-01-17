import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const PlayerContext = createContext();

export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider = ({ children }) => {
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [queue, setQueue] = useState([]);
    const [volume, setVolume] = useState(1);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    const audioRef = useRef(new Audio());

    useEffect(() => {
        const audio = audioRef.current;

        const updateProgress = () => setProgress(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);
        const onEnded = () => nextSong();

        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('ended', onEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('loadedmetadata', updateDuration);
        };
    }, []);

    const playSong = (song, songList = []) => {
        // If a new list is provided, update queue. Otherwise keep existing queue if just switching within it.
        if (songList.length > 0) {
            setQueue(songList);
        }

        // Safety check if queue is empty (e.g. initial load) but play is called alone
        // If the song being played is not in the current queue, add it and make it the only item.
        if (songList.length === 0 && !queue.some(s => s.id === song.id)) {
            setQueue([song]);
        }

        if (currentSong?.id === song.id) {
            if (audioRef.current.paused) {
                audioRef.current.play();
                setIsPlaying(true);
            } else {
                audioRef.current.pause();
                setIsPlaying(false);
            }
        } else {
            if (currentSong && currentSong.url) {
                URL.revokeObjectURL(currentSong.url);
            }

            const url = URL.createObjectURL(song.file);
            audioRef.current.src = url;
            audioRef.current.play();
            setCurrentSong({ ...song, url });
            setIsPlaying(true);
        }
    };

    const pauseSong = () => {
        audioRef.current.pause();
        setIsPlaying(false);
    };

    const resumeSong = () => {
        audioRef.current.play();
        setIsPlaying(true);
    };

    const nextSong = () => {
        if (!currentSong || queue.length === 0) return;

        const currentIndex = queue.findIndex(s => s.id === currentSong.id);
        const nextIndex = currentIndex + 1;

        if (nextIndex < queue.length) {
            playSong(queue[nextIndex]);
        } else {
            // Loop back to start
            playSong(queue[0]);
        }
    };

    const prevSong = () => {
        if (!currentSong || queue.length === 0) return;

        const currentIndex = queue.findIndex(s => s.id === currentSong.id);
        const prevIndex = currentIndex - 1;

        if (prevIndex >= 0) {
            playSong(queue[prevIndex]);
        } else {
            // Play last song
            playSong(queue[queue.length - 1]);
        }
    };

    const seek = (time) => {
        audioRef.current.currentTime = time;
        setProgress(time);
    };

    // This useEffect handles the 'ended' event, ensuring it always calls the latest `nextSong`
    useEffect(() => {
        const audio = audioRef.current;
        const handleEnded = () => {
            nextSong();
        };

        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('ended', handleEnded);
        };
    }, [nextSong]); // Depend on nextSong to ensure the latest version is called

    // Media Session API for Lock Screen / Notification Controls
    useEffect(() => {
        if (!currentSong) return;

        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: currentSong.title,
                artist: 'APMusic', // Fallback or assume APMusic if no artist data
                artwork: [
                    { src: '/logo.png', sizes: '512x512', type: 'image/png' }
                ]
            });

            navigator.mediaSession.setActionHandler('play', () => {
                resumeSong();
            });

            navigator.mediaSession.setActionHandler('pause', () => {
                pauseSong();
            });

            navigator.mediaSession.setActionHandler('previoustrack', () => {
                prevSong();
            });

            navigator.mediaSession.setActionHandler('nexttrack', () => {
                nextSong();
            });

            navigator.mediaSession.setActionHandler('seekto', (details) => {
                if (details.seekTime && audioRef.current) {
                    seek(details.seekTime);
                }
            });

            // Explicitly unset the seek handlers to remove the 10s skip buttons
            navigator.mediaSession.setActionHandler('seekbackward', null);
            navigator.mediaSession.setActionHandler('seekforward', null);
        }
    }, [currentSong, playSong, pauseSong, nextSong, prevSong, resumeSong, seek]);

    return (
        <PlayerContext.Provider value={{
            currentSong,
            isPlaying,
            playSong,
            pauseSong,
            resumeSong,
            nextSong,
            prevSong,
            progress,
            duration,
            seek,
            queue,
            setQueue
        }}>
            {children}
        </PlayerContext.Provider>
    );
};
