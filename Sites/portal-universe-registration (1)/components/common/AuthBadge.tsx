import React, { useEffect, useState } from 'react';
import { auth } from '../../services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const AuthBadge: React.FC = () => {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setEmail(u?.email ?? null));
    return () => unsub();
  }, []);

  const handleSignOut = async () => {
    try { await signOut(auth); } catch (e) { console.error(e); }
  };

  return (
    <div style={{position:'fixed', top:12, right:12, zIndex:10000, display:'flex', alignItems:'center', gap:8}}>
      {email ? (
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <span style={{color:'#e2e8f0', background:'rgba(2,6,23,0.7)', border:'1px solid rgba(45,212,191,0.3)', padding:'6px 10px', borderRadius:6}}>
            {email}
          </span>
          <button onClick={handleSignOut} style={{padding:'6px 10px', border:'1px solid #64748b', borderRadius:6, background:'transparent', color:'#e2e8f0'}}>Sign out</button>
        </div>
      ) : (
        <a href="#" style={{color:'#22d3ee', background:'rgba(2,6,23,0.7)', border:'1px solid rgba(45,212,191,0.3)', padding:'6px 10px', borderRadius:6}}>Not signed in</a>
      )}
    </div>
  );
};

export default AuthBadge;
