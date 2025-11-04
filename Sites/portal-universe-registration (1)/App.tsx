import React, { useState, useEffect } from 'react';
import LandingPage from './components/pages/LandingPage';
import LoginPage from './components/pages/LoginPage';
import SurveyPage from './components/pages/SurveyPage';
import ProfileConfigPage from './components/pages/ProfileConfigPage';
import GroupSelectionPage from './components/pages/GroupSelectionPage';
import PortalView from './components/pages/PortalView';
import { PortalService } from './types';
import { auth, db } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import AuthBadge from './components/common/AuthBadge';

// --- DEVELOPER TOGGLE ---
// Set to true to bypass the entire connection/login/profile flow
const SKIP_CONNECTION_PROCESS = false;

type AppState = 'LANDING' | 'LOGIN' | 'SURVEY' | 'PROFILE_CONFIG' | 'WELCOME' | 'GROUP_SELECTION' | 'PORTAL_VIEW';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(SKIP_CONNECTION_PROCESS ? 'GROUP_SELECTION' : 'LANDING');
  const [userData, setUserData] = useState({ fullName: '', email: '' });
  const [surveyAnswers, setSurveyAnswers] = useState<string[]>([]);
  const [profileData, setProfileData] = useState<any>(null);
  const [selectedPortal, setSelectedPortal] = useState<PortalService | null>(null);

  useEffect(() => {
    if (SKIP_CONNECTION_PROCESS) {
      setUserData({ fullName: 'System Override', email: 'dev@portal.ui' });
      setProfileData({ displayName: 'System Override', handle: 'sys-override', bio: 'Bypassed connection for development.', avatarSrc: null });
      return;
    }
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAppState('LANDING');
        return;
      }
      // Load profile if exists
      try {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        setUserData({ fullName: user.displayName || 'Explorer', email: user.email || '' });
        if (snap.exists()) {
          const data = snap.data();
          if (data.displayName || data.handle) {
            setProfileData({ displayName: data.displayName || '', handle: data.handle || '', bio: data.bio || '', avatarSrc: data.avatarSrc || null });
            setAppState('GROUP_SELECTION');
            return;
          }
        }
        setAppState('SURVEY');
      } catch (e) {
        console.error(e);
        setAppState('SURVEY');
      }
    });
    return () => unsub();
  }, []);


  useEffect(() => {
    if (appState === 'WELCOME' && !SKIP_CONNECTION_PROCESS) {
      const timer = setTimeout(() => {
        setAppState('GROUP_SELECTION');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [appState]);

  const handleLoginSuccess = (user: {fullName: string, email: string}) => { setUserData(user); setAppState('SURVEY'); };
  const handleSurveyComplete = async (answers: string[]) => {
    setSurveyAnswers(answers);
    try {
      const u = auth.currentUser;
      if (u) {
        await setDoc(doc(db, 'users', u.uid), { surveyAnswers: answers }, { merge: true });
      }
    } catch (e) { console.error('Save survey failed', e); }
    setAppState('PROFILE_CONFIG');
  };
  const handleProfileComplete = async (profile: any) => {
    setProfileData(profile);
    try {
      const u = auth.currentUser;
      if (u) {
        await setDoc(doc(db, 'users', u.uid), { displayName: profile.displayName, handle: profile.handle, bio: profile.bio, avatarSrc: profile.avatarSrc || null }, { merge: true });
      }
    } catch (e) { console.error('Save profile failed', e); }
    setAppState('WELCOME');
  };
  const handleSelectPortal = (portal: PortalService) => { setSelectedPortal(portal); setAppState('PORTAL_VIEW'); };
  const handleReturnToHub = () => { setSelectedPortal(null); setAppState('GROUP_SELECTION'); };

  const renderContent = () => {
    switch (appState) {
      case 'LANDING': return <LandingPage onAnimationComplete={() => setAppState('LOGIN')} />;
      case 'LOGIN': return <LoginPage onLoginSuccess={handleLoginSuccess} />;
      case 'SURVEY': return <SurveyPage onSurveyComplete={handleSurveyComplete} />;
      case 'PROFILE_CONFIG': return <ProfileConfigPage user={userData} onProfileComplete={handleProfileComplete} />;
      case 'WELCOME': return (
        <div className="flex items-center justify-center min-h-screen w-full bg-gray-900 text-white animate-[fadeIn_1.5s_ease-out]">
            <h1 className="font-orbitron text-4xl md:text-5xl tracking-widest">Welcome to the Portal Universe!</h1>
        </div>
      );
      case 'GROUP_SELECTION': return <GroupSelectionPage onSelectPortal={handleSelectPortal} />;
      case 'PORTAL_VIEW': 
        if (selectedPortal) {
          return <PortalView portal={selectedPortal} onReturn={handleReturnToHub} />;
        }
        // Fallback if no portal is selected
        return <GroupSelectionPage onSelectPortal={handleSelectPortal} />;
      default: return <LandingPage onAnimationComplete={() => setAppState('LOGIN')} />;
    }
  };

  return <>
    <AuthBadge />
    {renderContent()}
  </>;
};

export default App;