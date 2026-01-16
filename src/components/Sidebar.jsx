import React from 'react';
import { Home, Library, PlusSquare, Heart } from 'lucide-react';
import '../styles/Sidebar.css';

const Sidebar = () => {
    return (
        <aside className="sidebar">
            <div className="logo">
                <h2>APMusic</h2>
            </div>
            <nav>
                <ul>
                    <li><a href="#" className="active"><Home size={24} /> <span>Home</span></a></li>
                    <li><a href="#"><Library size={24} /> <span>Your Library</span></a></li>
                </ul>
            </nav>
            <div className="sidebar-divider"></div>
            <nav>
                <ul>
                    <li><a href="#"><PlusSquare size={24} /> <span>Create Playlist</span></a></li>
                    <li><a href="#"><Heart size={24} /> <span>Liked Songs</span></a></li>
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
