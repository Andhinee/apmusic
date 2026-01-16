import React from 'react';
import { PlayerProvider } from './context/PlayerContext';
import Layout from './components/Layout';
import SongList from './components/SongList';

function App() {
  return (
    <PlayerProvider>
      <Layout>
        <SongList />
      </Layout>
    </PlayerProvider>
  );
}

export default App;
