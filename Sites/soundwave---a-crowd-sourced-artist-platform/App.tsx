
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
import { auth, initializeSoundWaveUser, getUserById } from './services/firebaseService';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { User as SoundWaveUser } from './types';
import ArtistOnboarding from './components/ArtistOnboarding';

function App(): React.ReactNode {
  console.log('🎵 App component rendering...');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [soundWaveUser, setSoundWaveUser] = useState<SoundWaveUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    console.log('🔐 Setting up auth listener...');
    
    // Use real Firebase auth
    try {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        console.log('👤 Auth state changed:', user ? 'User logged in' : 'No user');
        setUser(user);
        
        if (user) {
          try {
            console.log('🔧 Checking for SoundWave profile...');
            
            // Check if user has SoundWave profile
            const swUser = await getUserById(user.uid);
            
            if (swUser) {
              console.log('✅ SoundWave profile found:', swUser);
              setSoundWaveUser(swUser);
              setNeedsOnboarding(false);
            } else {
              console.log('⚠️ No SoundWave profile - showing onboarding');
              setNeedsOnboarding(true);
            }
          } catch (error) {
            console.error('❌ Error checking profile:', error);
            // If error checking profile, assume new user needs onboarding
            setNeedsOnboarding(true);
          }
        }
        
        setLoading(false);
        console.log('✅ Loading complete');
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('❌ Error setting up auth:', error);
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-xl">Loading SoundWave...</div>
      </div>
    );
  }

  // Show onboarding if user needs to create profile
  if (user && needsOnboarding) {
    return (
      <ArtistOnboarding
        currentUserId={user.uid}
        currentUserEmail={user.email || ''}
        onComplete={(newUser) => {
          console.log('✅ Onboarding complete:', newUser);
          setSoundWaveUser(newUser);
          setNeedsOnboarding(false);
        }}
      />
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold mb-4">Authentication Required</h1>
          <p className="mb-6">Please sign in through the portal to access SoundWave.</p>
          <button 
            onClick={() => window.location.href = '/Sites/soundwave/index.html'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Go to SoundWave Gateway
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