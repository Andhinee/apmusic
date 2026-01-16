import React from 'react';
import Sidebar from './Sidebar';
import PlayerBar from './PlayerBar';
import { usePlayer } from '../context/PlayerContext';
import '../styles/Layout.css';

const Layout = ({ children }) => {
    const { currentSong } = usePlayer();

    return (
        <div className="app-container">
            <div className="main-body">
                <Sidebar />
                <main className="content-area">
                    {children}
                </main>
            </div>
            {currentSong && <PlayerBar />}
        </div>
    );
};

export default Layout;
