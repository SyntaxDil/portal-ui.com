import React, { useEffect, useState } from 'react';
import { UserIcon, MailIcon, LockIcon } from '../common/Icons';
import { auth, db } from '../../services/firebase';
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const LoginPage: React.FC<{ onLoginSuccess: (user: {fullName: string, email: string}) => void }> = ({ onLoginSuccess }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // If already signed-in, auto continue for returning users
  useEffect(() => {
    const u = auth.currentUser;
    if (u) {
      setFullName(u.displayName || 'Explorer');
      setEmail(u.email || '');
      setIsSubmitted(true);
      const t = setTimeout(() => onLoginSuccess({ fullName: u.displayName || 'Explorer', email: u.email || '' }), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const handleAdminFill = () => {
    setFullName('admin');
    setEmail('admin@portal.ui');
    setPassword('admin');
    setConfirmPassword('admin');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmPassword && password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    setIsSubmitting(true);
    try {
      // Set auth persistence based on Remember Me
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      // Update last login timestamp in Firestore
      await setDoc(
        doc(db, 'users', cred.user.uid),
        { lastLoginAt: serverTimestamp(), email: cred.user.email || email.trim(), fullName: fullName || cred.user.displayName || 'Explorer' },
        { merge: true }
      );
  setIsSubmitted(true);
  // Auto-advance after a brief success state
  setTimeout(() => handleProceed(), 700);
    } catch (err: any) {
      console.error(err);
      if (err?.code === 'auth/user-not-found') {
        alert('Account not found. Please register on the main site first at https://www.portal-ui.com/Registration.html');
      } else {
        const msg = err?.code?.toString?.() || 'Login failed';
        alert(`Login failed: ${msg}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      alert('Enter your email above first, then press Forgot Password.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      alert('Password reset email sent. Check your inbox.');
    } catch (err: any) {
      console.error(err);
      const msg = err?.code?.toString?.() || 'Failed to send reset email';
      alert(`Reset failed: ${msg}`);
    }
  };

  const handleProceed = () => {
    onLoginSuccess({ fullName: fullName || 'Explorer', email });
  }

  return (
    <main className="relative flex items-center justify-center min-h-screen w-full bg-gray-900 text-gray-200 overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: "url('https://picsum.photos/1920/1080?grayscale&blur=2&random=1')" }}></div>
      <div className="absolute inset-0 bg-black/70 z-10"></div>
      <div className="absolute top-0 left-0 w-72 h-72 bg-cyan-500/20 rounded-full filter blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full filter blur-3xl animate-pulse animation-delay-4000"></div>
      <div className="relative z-20 flex flex-col items-center justify-center w-full max-w-md p-8 m-4 bg-gray-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl shadow-2xl shadow-cyan-500/10">
        <div className="text-center mb-8">
          <h1 className="font-orbitron text-4xl font-bold text-cyan-300 tracking-widest uppercase">
            Portal.UI
          </h1>
          <p className="text-gray-400 mt-2">Create your gateway to the new universe.</p>
        </div>
        {isSubmitted ? (
          <div className="text-center p-8 animate-[fadeIn_0.5s_ease-in-out]">
             <h2 className="font-orbitron text-2xl font-bold text-green-400">Access Granted!</h2>
             <p className="text-gray-300 mt-4">Welcome, {fullName}. Your portal is ready for calibration.</p>
             <button
                onClick={handleProceed}
                className="font-orbitron mt-8 w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-cyan-500/30 transition-all duration-300 transform hover:scale-105"
             >
                Proceed to Survey
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full space-y-6">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2"><UserIcon /></span>
              <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"/>
            </div>
            <div className="relative">
               <span className="absolute left-3 top-1/2 -translate-y-1/2"><MailIcon /></span>
              <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"/>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2"><LockIcon /></span>
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"/>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2"><LockIcon /></span>
              <input type="password" placeholder="Confirm Password (optional)" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"/>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm text-gray-400 cursor-pointer">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="form-checkbox h-4 w-4 bg-gray-800 border-gray-600 text-cyan-600 focus:ring-cyan-500 rounded"/>
                <span className="ml-2">Remember Me</span>
              </label>
            </div>
            <button type="submit" disabled={isSubmitting} className="font-orbitron w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-cyan-500/30 transition-all duration-300 transform hover:scale-105 flex items-center justify-center">
              {isSubmitting ? <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : 'Enter the Portal'}
            </button>
          </form>
        )}
          <div className="mt-8 text-center w-full">
            <p className="text-sm text-gray-400 mb-2">Need an account? <a href="https://www.portal-ui.com/Registration.html" className="font-medium text-cyan-400 hover:text-cyan-300">Register on the main site</a></p>
          <button type="button" onClick={handleForgotPassword} className="font-medium text-cyan-400 hover:text-cyan-300 bg-transparent border-none p-0 cursor-pointer text-sm">Forgot your password?</button>
          <div className="relative my-4"><div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-gray-700/50"></div></div></div>
          <button type="button" onClick={handleAdminFill} className="font-medium text-amber-400 hover:text-amber-300 bg-transparent border-none p-0 cursor-pointer text-sm">Admin Quick Access</button>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
