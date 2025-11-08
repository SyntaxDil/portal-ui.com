
import React, { useEffect, useState } from 'react';
import { HashRouter, Route, Routes, NavLink } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import AudioPlayer from './components/AudioPlayer';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import UploadPage from './pages/UploadPage';
import CommunityPage from './pages/CommunityPage';
import GlobalChat from './components/GlobalChat';
import LibraryPage from './pages/LibraryPage';
import PlaylistsPage from './pages/PlaylistsPage';
import ArtistHubPage from './pages/ArtistHubPage';
import LiveStreamsPage from './pages/LiveStreamsPage';
import TutorialsPage from './pages/TutorialsPage';
import MasterclassPage from './pages/MasterclassPage';
import SamplesPage from './pages/SamplesPage';
import ImportCollectionPage from './pages/ImportPlaylistPage';
import LabelsPage from './pages/LabelsPage';
import LabelPage from './pages/LabelPage';
import InboxPage from './pages/InboxPage';
import { auth, initializeSoundWaveUser } from './services/firebaseService';
import { onAuthStateChanged, User } from 'firebase/auth';

function App(): React.ReactNode {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          await initializeSoundWaveUser();
        } catch (error) {
          console.error('Error initializing SoundWave user:', error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-xl">Loading SoundWave...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold mb-4">Authentication Required</h1>
          <p className="mb-6">Please return to the portal to sign in.</p>
          <button 
            onClick={() => window.location.href = '../index.html'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Go to Portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen bg-gray-900">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-24">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/playlists" element={<PlaylistsPage />} />
            <Route path="/labels" element={<LabelsPage />} />
            <Route path="/labels/:labelId" element={<LabelPage />} />
            <Route path="/artist-hub" element={<ArtistHubPage />} />
            <Route path="/live-streams" element={<LiveStreamsPage />} />
            <Route path="/tutorials" element={<TutorialsPage />} />
            <Route path="/masterclass" element={<MasterclassPage />} />
            <Route path="/samples" element={<SamplesPage />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/import-collection" element={<ImportCollectionPage />} />
            <Route path="/inbox" element={<InboxPage />} />
          </Routes>
        </main>
        <Footer />
        <AudioPlayer />
        <GlobalChat />
      </div>
    </HashRouter>
  );
}

export default App;