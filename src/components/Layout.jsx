import React from 'react';
import Sidebar from './Sidebar';
import PlayerBar from './PlayerBar';
import '../styles/Layout.css';

const Layout = ({ children }) => {
    return (
        <div className="app-container">
            <div className="main-body">
                <Sidebar />
                <main className="content-area">
                    {children}
                </main>
            </div>
            <PlayerBar />
        </div>
    );
};

export default Layout;
