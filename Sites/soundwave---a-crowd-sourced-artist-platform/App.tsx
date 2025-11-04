
import React from 'react';
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

function App(): React.ReactNode {
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