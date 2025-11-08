
import React, { useEffect, useState, Component, ErrorInfo, ReactNode } from 'react';
import { HashRouter, Route, Routes, NavLink } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import AudioPlayer from './components/AudioPlayer';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import UploadPage from './pages/UploadPage';
const ProfileSettingsPage = UploadPage; // Using UploadPage as ProfileSettingsPage temporarily
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

// ErrorBoundary Component
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('❌ [ErrorBoundary] Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-gray-800 rounded-lg p-8 border border-red-500">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-red-400 mb-2">Something went wrong</h1>
              <p className="text-gray-300">The app encountered an unexpected error</p>
            </div>
            {this.state.error && (
              <div className="bg-gray-900 p-4 rounded-lg mb-4">
                <p className="text-red-300 font-mono text-sm">
                  {this.state.error.toString()}
                </p>
              </div>
            )}
            <div className="flex gap-4">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
              >
                Reload Page
              </button>
              <button
                onClick={() => window.location.href = '/Sites/soundwave/index.html'}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
              >
                Go to Gateway
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

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
            
            // Check if user has SoundWave profile with retry logic
            let swUser = await getUserById(user.uid);
            let retries = 0;
            
            // Retry up to 3 times if profile fetch fails
            while (!swUser && retries < 3) {
              console.log(`⚠️ Retry ${retries + 1}/3 for profile fetch...`);
              await new Promise(resolve => setTimeout(resolve, 1000 * (retries + 1))); // Exponential backoff
              swUser = await getUserById(user.uid);
              retries++;
            }
            
            if (swUser) {
              console.log('✅ SoundWave profile found:', swUser);
              setSoundWaveUser(swUser);
              setNeedsOnboarding(false);
            } else {
              console.log('⚠️ No SoundWave profile - showing onboarding');
              setSoundWaveUser(null);
              setNeedsOnboarding(true);
            }
          } catch (error) {
            console.error('❌ Error checking profile:', error);
            // If error checking profile, assume new user needs onboarding
            setSoundWaveUser(null);
            setNeedsOnboarding(true);
          }
        } else {
          // User logged out
          setSoundWaveUser(null);
          setNeedsOnboarding(false);
        }
        
        setLoading(false);
        console.log('✅ Loading complete');
      });

      return () => {
        console.log('🧹 Cleaning up auth listener');
        unsubscribe();
      };
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
        onComplete={async (newUser) => {
          console.log('✅ Onboarding complete:', newUser);
          
          // Re-fetch profile to ensure it exists in Firestore
          try {
            const verifiedUser = await getUserById(user.uid);
            if (verifiedUser) {
              console.log('✅ Profile verified in Firestore');
              setSoundWaveUser(verifiedUser);
              setNeedsOnboarding(false);
            } else {
              console.error('❌ Profile not found after creation - retry onboarding');
              alert('Profile creation failed. Please try again.');
            }
          } catch (error) {
            console.error('❌ Error verifying profile:', error);
            // Still proceed with the user object we have
            setSoundWaveUser(newUser);
            setNeedsOnboarding(false);
          }
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
        <Header currentUser={soundWaveUser} />
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
            <Route path="/settings/profile" element={<ProfileSettingsPage />} />
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

// Wrap App with ErrorBoundary
const AppWithErrorBoundary = () => (
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

export default AppWithErrorBoundary;