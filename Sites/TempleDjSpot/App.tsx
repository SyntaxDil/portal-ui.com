import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithCustomToken,
  onAuthStateChanged,
  setPersistence,
  inMemoryPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  addDoc,
  query,
  arrayUnion,
  orderBy,
  limit as qLimit,
  serverTimestamp,
} from 'firebase/firestore';
import {
  Users,
  Music,
  Calendar,
  X,
  UploadCloud,
  GripVertical,
  Video,
  Info,
  User,
  Trash2,
  Clock
} from 'lucide-react';

// --- Firebase Configuration ---
// These global variables are expected to be injected by the environment.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const firebaseConfig = typeof __firebase_config !== 'undefined'
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ? JSON.parse(__firebase_config)
  : {};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-doof-crew';

// --- Types ---
interface DJ {
  id?: string;
  djName: string;
  realName: string;
  info?: string;
  photoUrl?: string;
  visualUrl?: string;
}

interface TimeSlot {
  time: string;
  djId: string | null;
  djName: string | null;
  // Optional list of additional DJs sharing this slot
  guests?: Array<{ djId: string; djName: string }>
}

interface Schedule {
  name: string;
  timeSlots: TimeSlot[];
}

// --- Main Application Component ---
export default function App() {
  // Shared mode: use a global namespace so any signed-in user edits the same schedule
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const sharedMode: boolean = typeof __shared_mode !== 'undefined' ? !!__shared_mode : true;

  // Firebase & Auth State
  const [db, setDb] = useState<ReturnType<typeof getFirestore> | null>(null);
  const [auth, setAuthState] = useState<ReturnType<typeof getAuth> | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // App Data State
  const [djs, setDjs] = useState<DJ[]>([]); // All registered DJs
  const [schedule, setSchedule] = useState<Schedule | null>(null); // The main stage schedule
  const [selectedDj, setSelectedDj] = useState<DJ | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [dragCounter, setDragCounter] = useState(0); // For styling drop zones
  // Range-drag state to allow dragging across multiple 15-min slots
  const [rangeStart, setRangeStart] = useState<number | null>(null);
  const [rangeEnd, setRangeEnd] = useState<number | null>(null);
  const [dragSource, setDragSource] = useState<any | null>(null);

  // --- Firebase Initialization and Auth ---
  useEffect(() => {
    try {
      const app = initializeApp(firebaseConfig);
      const authInstance = getAuth(app);
      const dbInstance = getFirestore(app);

      setDb(dbInstance);
      setAuthState(authInstance);

      const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
        if (user) {
          setUserId(user.uid);
          setUserEmail(user.email || null);
          setIsAuthReady(true);
          return;
        }
        // No user; mark auth ready so UI can show login/register gate (no auto-redirect)
        setUserId(null);
        setIsAuthReady(true);
      });

      return () => unsubscribe();
    } catch (e) {
      console.error('Error initializing Firebase:', e);
      setError('Failed to initialize application. Invalid configuration.');
    }
  }, []);

  // --- Firestore Data Listeners ---
  useEffect(() => {
    if (!isAuthReady || !db || !userId) return;

  // Data namespace: shared or per-user
  const basePath = sharedMode ? `apps/${appId}` : `users/${userId}/apps/${appId}`;

  // --- Listener for DJ Collection ---
  const djsCollectionPath = `${basePath}/djs`;
    const djsQuery = query(collection(db, djsCollectionPath));
    const unsubscribeDjs = onSnapshot(djsQuery, (querySnapshot) => {
      const djsList: DJ[] = [];
      querySnapshot.forEach((doc) => {
        djsList.push({ id: doc.id, ...(doc.data() as DJ) });
      });
      setDjs(djsList);
    }, (err) => {
      console.error('Error listening to DJs:', err);
      setError('Failed to load DJ list.');
    });

  // --- Listener for Schedule Document ---
  const scheduleDocPath = `${basePath}/schedule/mainStage`;
    const scheduleRef = doc(db, scheduleDocPath);

  const unsubscribeSchedule = onSnapshot(scheduleRef, async (docSnap) => {
      if (docSnap.exists()) {
        setSchedule(docSnap.data() as Schedule);
        setLoadFailed(false);
      } else {
        // No schedule yet — try to create the Temple base schedule (31 Jan 2025)
        try {
          const base = buildTempleBaseSchedule();
          await setDoc(scheduleRef, base);
          setSchedule(base);
          setLoadFailed(false);
        } catch (err) {
          console.error('Error creating base schedule:', err);
          try { (window as any).firebaseOpsAgent?.log({ level: 'error', type: 'schedule.create.error', code: (err as any)?.code || '', message: (err as any)?.message || '', path: scheduleDocPath }); } catch (_) {}
          setError('Failed to initialize schedule.');
          setLoadFailed(true);
        }
      }
    }, (err: any) => {
      console.error('Error listening to schedule:', err);
      try { (window as any).firebaseOpsAgent?.log({ level: 'error', type: 'schedule.listen.error', code: (err as any)?.code || '', message: (err as any)?.message || '', path: scheduleDocPath }); } catch (_) {}
      const code = err?.code || '';
      if (code.includes('permission') || code.includes('denied')) {
        setError(`Failed to load schedule (permission denied). Path: ${scheduleDocPath}`);
      } else {
        setError('Failed to load schedule.');
      }
      setLoadFailed(true);
    });

    // Ensure a crew meta doc exists for this app/user
  const metaRef = doc(db, `${basePath}/meta/app`);
    setDoc(metaRef, { ownerUid: userId, appId, createdAt: new Date().toISOString(), allowedAdminEmails: [], allowedAdminUids: [] }, { merge: true }).catch((e) => {
      console.warn('Could not ensure crew meta doc', e);
    });

    // Listen for meta updates to compute admin
    const unsubMeta = onSnapshot(metaRef, (snap) => {
      const data = snap.data() as any;
      const ownerUid = data?.ownerUid;
      const emails: string[] = data?.allowedAdminEmails || [];
      const uids: string[] = data?.allowedAdminUids || [];
      const meIsAdmin = ownerUid === userId || (!!userEmail && emails.includes(userEmail)) || uids.includes(userId);
      setIsAdmin(meIsAdmin);
    });

    return () => {
      unsubscribeDjs();
      unsubscribeSchedule();
      unsubMeta && unsubMeta();
    };
  }, [isAuthReady, db, userId, userEmail]);

  // --- Event Handlers ---

  const handleOpenModal = (dj: DJ) => {
    setSelectedDj(dj);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedDj(null);
  };

  const handleDragStart = (e: React.DragEvent, dragData: any) => {
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'move';
    // Keep a local copy so we can compute ranges while dragging
    setDragSource(dragData);
    setRangeStart(null);
    setRangeEnd(null);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setDragCounter(prev => prev + 1);
  };
  
  // Slot-aware drag enter: build a range from initial to current slot
  const handleDragEnterSlot = (e: React.DragEvent, slotIndex: number) => {
    e.preventDefault();
    setDragCounter(prev => prev + 1);
    setRangeStart(prev => {
      if (prev === null) {
        // If dragging from a slot, start from that source slot; otherwise start from first hovered slot
        if (dragSource && (dragSource.from === 'slot' || dragSource.from === 'resize') && typeof dragSource.slotIndex === 'number') {
          return dragSource.slotIndex;
        }
        return slotIndex;
      }
      return prev;
    });
    setRangeEnd(slotIndex);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragCounter(prev => prev - 1);
  };

  const handleDropOnSlot = async (e: React.DragEvent, targetSlotIndex: number) => {
    e.preventDefault();
    setDragCounter(0);
    setIsLoading(true);
    
    try {
      const sourceData = JSON.parse(e.dataTransfer.getData('application/json')) as any;
      const newTimeSlots = [...(schedule as Schedule).timeSlots];
      
  const scheduleRef = doc(db!, `${sharedMode ? `apps/${appId}` : `users/${userId}/apps/${appId}`}/schedule/mainStage`);

      // If a range was dragged across, apply to entire range, but only when SHIFT is held
      // or when explicitly resizing using a handle
      const isResizing = sourceData.from === 'resize';
      const hasRange = (rangeStart !== null && rangeEnd !== null) && (e.shiftKey || isResizing);
      const applyRangeAssign = (assignAsGuest: boolean) => {
        // Compute the intended range
        let start = Math.min(rangeStart!, targetSlotIndex, rangeEnd!);
        let end = Math.max(rangeStart!, targetSlotIndex, rangeEnd!);
        const fromPool = sourceData.from === 'pool';
        const djId = fromPool ? sourceData.dj.id : sourceData.djId;
        const djName = fromPool ? sourceData.dj.djName : sourceData.djName;

        // If resizing via right/left handle, only allow extension in the chosen direction
        if (isResizing && typeof sourceData.slotIndex === 'number') {
          const origin = sourceData.slotIndex as number;
          if (sourceData.direction === 'right') {
            if (targetSlotIndex < origin) { start = origin; end = origin; }
            else { start = origin; end = Math.max(origin, targetSlotIndex); }
          } else if (sourceData.direction === 'left') {
            if (targetSlotIndex > origin) { start = origin; end = origin; }
            else { start = Math.min(origin, targetSlotIndex); end = origin; }
          }
        }

        for (let i = start; i <= end; i++) {
          const target = { ...newTimeSlots[i] };
          if (assignAsGuest) {
            if (target.djId && target.djId !== djId) {
              const guests = Array.isArray(target.guests) ? [...target.guests] : [];
              if (!guests.find(g => g.djId === djId)) guests.push({ djId, djName });
              newTimeSlots[i] = { ...target, guests };
            } else {
              newTimeSlots[i] = { ...target, djId, djName };
            }
          } else {
            newTimeSlots[i] = { ...target, djId, djName };
          }
        }
      };

      if (hasRange) {
        // For resize we always place as main (not as guest). For shift-fill, respect Alt modifier.
        applyRangeAssign(isResizing ? false : e.altKey);
      } else if (sourceData.from === 'pool') {
        // --- Dragging from POOL to SLOT ---
        const djId = sourceData.dj.id as string;
        const djName = sourceData.dj.djName as string;
        
        // Check if DJ is already in another slot
        const existingSlotIndex = newTimeSlots.findIndex(slot => slot.djId === djId);
        if (existingSlotIndex > -1) {
           // DJ is already scheduled, swap them
           const targetDj = { ...newTimeSlots[targetSlotIndex] };
           newTimeSlots[targetSlotIndex] = { ...newTimeSlots[targetSlotIndex], djId, djName };
           newTimeSlots[existingSlotIndex] = { ...newTimeSlots[existingSlotIndex], djId: targetDj.djId, djName: targetDj.djName };
        } else {
          // DJ is not scheduled yet
          const target = { ...newTimeSlots[targetSlotIndex] };
          if (target.djId && target.djId !== djId) {
            // Slot already has a main DJ — add as guest to allow overlap
            const guests = Array.isArray(target.guests) ? [...target.guests] : [];
            if (!guests.find(g => g.djId === djId)) guests.push({ djId, djName });
            newTimeSlots[targetSlotIndex] = { ...target, guests };
          } else {
            // Empty slot (or same DJ)
            newTimeSlots[targetSlotIndex] = { ...target, djId, djName };
          }
        }
        
      } else if (sourceData.from === 'slot') {
        // --- Dragging from SLOT to SLOT (Swap) ---
        const sourceSlotIndex = sourceData.slotIndex as number;
        if (sourceSlotIndex === targetSlotIndex) return; // Dropped on itself

        if (e.shiftKey) {
          // Range fill: assign the source DJ across all slots in range
          const start = Math.min(sourceSlotIndex, targetSlotIndex);
          const end = Math.max(sourceSlotIndex, targetSlotIndex);
          const sourceSlot = { ...newTimeSlots[sourceSlotIndex] };
          for (let i = start; i <= end; i++) {
            newTimeSlots[i] = { ...newTimeSlots[i], djId: sourceSlot.djId, djName: sourceSlot.djName };
          }
        } else if (e.altKey) {
          // Overlap into target (copy), keep source as-is
          const sourceSlot = { ...newTimeSlots[sourceSlotIndex] };
          const targetSlot = { ...newTimeSlots[targetSlotIndex] };
          if (targetSlot.djId && targetSlot.djId !== sourceSlot.djId) {
            const guests = Array.isArray(targetSlot.guests) ? [...targetSlot.guests] : [];
            if (sourceSlot.djId && !guests.find(g => g.djId === sourceSlot.djId)) {
              guests.push({ djId: sourceSlot.djId, djName: sourceSlot.djName || '' });
              newTimeSlots[targetSlotIndex] = { ...targetSlot, guests };
            }
          } else {
            // If empty or same, just assign
            newTimeSlots[targetSlotIndex] = { ...targetSlot, djId: sourceSlot.djId, djName: sourceSlot.djName };
          }
        } else {
          const sourceSlot = { ...newTimeSlots[sourceSlotIndex] };
          const targetSlot = { ...newTimeSlots[targetSlotIndex] };
          // Swap 'em
          newTimeSlots[targetSlotIndex] = { ...targetSlot, djId: sourceSlot.djId, djName: sourceSlot.djName };
          newTimeSlots[sourceSlotIndex] = { ...sourceSlot, djId: targetSlot.djId, djName: targetSlot.djName };
        }
      }
      
      // Update Firestore
      await updateDoc(scheduleRef, { timeSlots: newTimeSlots });
      
    } catch (err) {
      console.error('Error handling drop on slot:', err);
      setError('Failed to update schedule.');
    } finally {
      setIsLoading(false);
      // Reset range-drag state after drop
      setRangeStart(null);
      setRangeEnd(null);
      setDragSource(null);
    }
  };
  
  const handleDropOnUnassign = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragCounter(0);
    setIsLoading(true);
    
    try {
      const sourceData = JSON.parse(e.dataTransfer.getData('application/json')) as any;
      
      if (sourceData.from === 'slot') {
         // --- Dragging from SLOT to UNASSIGN ---
         const sourceSlotIndex = sourceData.slotIndex as number;
         const newTimeSlots = [...(schedule as Schedule).timeSlots];
         
         // Clear the slot
         newTimeSlots[sourceSlotIndex] = { ...newTimeSlots[sourceSlotIndex], djId: null, djName: null };
         
         // Update Firestore
         const scheduleRef = doc(db!, `${sharedMode ? `apps/${appId}` : `users/${userId}/apps/${appId}`}/schedule/mainStage`);
         await updateDoc(scheduleRef, { timeSlots: newTimeSlots });
      }
      // If dragging from pool, do nothing
      
    } catch (err) {
      console.error('Error unassigning DJ:', err);
      setError('Failed to update schedule.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSchedule = async () => {
    if (!window.confirm('Clear all slot assignments and return all DJs to the unassigned pool?')) return;
    setIsLoading(true);
    try {
      const scheduleRef = doc(db!, `${sharedMode ? `apps/${appId}` : `users/${userId}/apps/${appId}`}/schedule/mainStage`);
      const newTimeSlots = (schedule as Schedule).timeSlots.map(slot => ({
        time: slot.time,
        djId: null,
        djName: null
      }));
      await updateDoc(scheduleRef, { timeSlots: newTimeSlots });
    } catch (err) {
      console.error('Error resetting schedule:', err);
      const code = (err as any)?.code || '';
      if (code.includes('permission') || code.includes('denied')) {
        setError('Failed to reset schedule (permission denied). Please verify you have write access.');
      } else {
        setError('Failed to reset schedule: ' + ((err as any)?.message || 'Unknown error'));
      }
      try { (window as any).firebaseOpsAgent?.log({ level: 'error', type: 'schedule.reset.error', code, message: (err as any)?.message || '' }); } catch (_) {}
    } finally {
      setIsLoading(false);
    }
  };

  // --- Calculate Unassigned DJs ---
  const assignedDjIds = new Set(
    (schedule?.timeSlots || []).flatMap(slot => [
      ...(slot.djId ? [slot.djId] : []),
      ...((slot.guests || []).map(g => g.djId))
    ])
  );
  const unassignedDjs = djs.filter(dj => !assignedDjIds.has(dj.id!));
  
  if (!isAuthReady) {
     return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white font-sans">
          <UploadCloud className="animate-pulse w-16 h-16" />
          <span className="ml-4 text-2xl">Checking session…</span>
        </div>
     );
  }

  // Gate: not logged in — show login/register options
  if (isAuthReady && !userId) {
    return <AuthGate auth={auth} db={db} appId={appId} />;
  }

  if (!schedule) {
     return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white font-sans p-4">
          <div className="flex items-center">
            <UploadCloud className="animate-pulse w-16 h-16" />
            <span className="ml-4 text-2xl">Loading Crew Data...</span>
          </div>
          {error && (
            <div className="mt-6 max-w-xl w-full bg-red-800 border border-red-600 text-white p-4 rounded-lg">
              <div className="flex items-center">
                <Info className="w-5 h-5 mr-3" />
                <p className="font-semibold">{error}</p>
              </div>
              <p className="text-sm text-red-200 mt-2">If this persists, you may not have permission to read or write your schedule. Please sign out and back in, or contact support.</p>
              {loadFailed && (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    onClick={async () => {
                      if (!db || !userId) return;
                      setIsLoading(true);
                      setError(null);
                      try {
                        const scheduleRef = doc(db, `${sharedMode ? `apps/${appId}` : `users/${userId}/apps/${appId}`}/schedule/mainStage`);
                        const base = buildTempleBaseSchedule();
                        await setDoc(scheduleRef, base);
                        setSchedule(base);
                      } catch (e: any) {
                        console.error(e);
                        try { (window as any).firebaseOpsAgent?.log({ level: 'error', type: 'schedule.create.error', code: (e as any)?.code || '', message: (e as any)?.message || '', path: `${sharedMode ? `apps/${appId}` : `users/${userId}/apps/${appId}`}/schedule/mainStage` }); } catch (_) {}
                        const code = e?.code || '';
                        if (code.includes('permission') || code.includes('denied')) {
                          setError('Could not create base schedule (permission denied). Please update Firestore rules to allow authenticated users to write to this app namespace.');
                        } else {
                          setError('Could not create base schedule.');
                        }
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    className="py-2 px-3 bg-blue-600 hover:bg-blue-700 rounded-md text-white"
                  >
                    Create Base Schedule (Temple · 31 Jan 2025)
                  </button>
                  <a href="/hub.html" className="py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded-md text-white">Enter the Portal</a>
                </div>
              )}
            </div>
          )}
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 md:p-8">
      {/* --- Header --- */}
      <header className="mb-6">
        <h1 className="text-4xl font-bold text-center text-blue-400">
          Doof Crew Admin
        </h1>
        {userId && (
          <div className="text-center text-sm text-gray-400 mt-2 flex flex-col items-center gap-1">
            <p>
              Share this User ID with your crew: <code className="bg-gray-700 p-1 rounded-md">{userId}</code>
            </p>
            {isAdmin && (
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-green-800 text-green-200 text-xs uppercase tracking-wide">Admin</span>
            )}
            <div className="mt-2">
              <a href="/hub.html" className="inline-block py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white">Enter the Portal</a>
            </div>
          </div>
        )}
      </header>
      
      {error && (
        <div className="bg-red-800 border border-red-600 text-white p-4 rounded-lg mb-6 flex items-center">
           <Info className="w-5 h-5 mr-3" />
           <p>{error}</p>
           <button onClick={() => setError(null)} className="ml-auto text-red-200 hover:text-white">
             <X className="w-5 h-5" />
           </button>
        </div>
      )}

      {/* --- Main Content --- */}
      <main className="flex flex-col lg:flex-row gap-8">
        
        {/* --- Left Column: Registration & DJ Pool --- */}
        <aside className="w-full lg:w-1/3 flex flex-col gap-6">
          <DJRegistrationForm 
            db={db!} 
            userId={userId!} 
            appId={appId} 
            setIsLoading={setIsLoading} 
            setError={setError}
            disabled={isLoading}
          />
          <DJPool 
            djs={unassignedDjs}
            onDjClick={handleOpenModal}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDropOnUnassign}
            isDropZoneActive={dragCounter > 0}
            disabled={isLoading}
            schedule={schedule}
          />
        </aside>

        {/* --- Right Column: Schedule Board --- */}
        <section className="w-full lg:w-2/3">
          <ScheduleBoard 
            schedule={schedule}
            djs={djs} // Pass all DJs for lookup
            onDjClick={handleOpenModal}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragEnterSlot={handleDragEnterSlot}
            onDragLeave={handleDragLeave}
            onDrop={handleDropOnSlot}
            isDropZoneActive={dragCounter > 0}
            disabled={isLoading}
            activeRange={rangeStart !== null ? { start: Math.min(rangeStart, rangeEnd ?? rangeStart), end: Math.max(rangeStart, rangeEnd ?? rangeStart) } : null}
            onReset={handleResetSchedule}
          />
        </section>
        
      </main>

      {/* --- Shared Chat --- */}
      <div className="mt-8">
        <SharedChat db={db!} userId={userId!} appId={appId} sharedMode={sharedMode} userEmail={userEmail} />
      </div>

      {/* --- Admin Settings (if admin) --- */}
      {isAdmin && !sharedMode && (
        <div className="mb-6 mx-auto max-w-2xl bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Admin Settings</h3>
          <AdminSettings db={db!} userId={userId!} appId={appId} />
        </div>
      )}

      {/* --- DJ Info Modal --- */}
      {modalOpen && selectedDj && (
        <DJModal dj={selectedDj} onClose={handleCloseModal} />
      )}
    </div>
  );
}

/**
 * Shared Chat (simple global room per appId)
 */
function SharedChat({ db, userId, appId, sharedMode, userEmail }: { db: ReturnType<typeof getFirestore>; userId: string; appId: string; sharedMode: boolean; userEmail: string | null }) {
  const [messages, setMessages] = useState<Array<{ id: string; uid: string; email?: string | null; text: string; createdAt?: any }>>([]);
  const [text, setText] = useState('');
  const basePath = sharedMode ? `apps/${appId}` : `users/${userId}/apps/${appId}`;

  useEffect(() => {
  // Use a concrete room doc ("main") so the collection path has an odd number of segments
  const q = query(collection(db, `${basePath}/chat/main/messages`), orderBy('createdAt', 'asc'), qLimit(100));
    const unsub = onSnapshot(q, (snap) => {
      const arr: any[] = [];
      snap.forEach(doc => arr.push({ id: doc.id, ...(doc.data() as any) }));
      setMessages(arr);
    });
    return () => unsub();
  }, [db, basePath]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    try {
      await addDoc(collection(db, `${basePath}/chat/main/messages`), {
        uid: userId,
        email: userEmail || null,
        text: t,
        createdAt: serverTimestamp(),
      });
      setText('');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-gray-800 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-3">Crew Chat</h3>
      <div className="h-64 overflow-y-auto bg-gray-900 rounded-md p-3 space-y-2 border border-gray-700">
        {messages.length === 0 && <div className="text-gray-500">No messages yet. Say hi!</div>}
        {messages.map(m => (
          <div key={m.id} className="text-sm">
            <span className="text-blue-300">{m.email || m.uid.slice(0,6)}</span>
            <span className="text-gray-400">: </span>
            <span className="text-gray-100 whitespace-pre-wrap">{m.text}</span>
          </div>
        ))}
      </div>
      <form onSubmit={send} className="mt-3 flex gap-2">
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Type a message…" className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
        <button className="py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-md">Send</button>
      </form>
    </div>
  );
}

// --- Helpers ---

function buildTempleBaseSchedule(): Schedule {
  const name = 'Temple - 31 Jan 2025';
  // 12:00 to 24:00 in 15-minute blocks
  const startMinutes = 12 * 60; // 12:00
  const endMinutes = 24 * 60;   // 24:00
  const slots: TimeSlot[] = [];
  for (let m = startMinutes; m < endMinutes; m += 15) {
    const from = formatHm(m);
    const to = formatHm(m + 15);
    slots.push({ time: `${from} - ${to}`, djId: null, djName: null });
  }
  return { name, timeSlots: slots };
}

function formatHm(totalMinutes: number): string {
  const mins = ((totalMinutes % (24 * 60)) + (24 * 60)) % (24 * 60); // wrap
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const hh = h.toString().padStart(2, '0');
  const mm = m.toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

// --- Sub-Components ---

/**
 * DJ Registration Form
 */
function DJRegistrationForm({ db, userId, appId, setIsLoading, setError, disabled }: {
  db: ReturnType<typeof getFirestore>;
  userId: string;
  appId: string;
  setIsLoading: (v: boolean) => void;
  setError: (v: string | null) => void;
  disabled: boolean;
}) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const sharedMode: boolean = typeof __shared_mode !== 'undefined' ? !!__shared_mode : true;
  const [formData, setFormData] = useState({
    djName: '',
    realName: '',
    info: '',
    photoUrl: '',
    visualUrl: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.djName || !formData.realName) {
      setError('DJ Name and Real Name are required.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
  const djsCollectionPath = `${sharedMode ? `apps/${appId}` : `users/${userId}/apps/${appId}`}/djs`;
      await addDoc(collection(db, djsCollectionPath), {
        ...formData,
        createdAt: new Date().toISOString(),
        // Store creator's UID/email so they can claim this profile later
        createdBy: userId,
        // Leave uid/email empty until DJ claims the profile by signing up
        uid: null,
        email: null
      });
      // Clear form
      setFormData({
        djName: '',
        realName: '',
        info: '',
        photoUrl: '',
        visualUrl: '',
      });
    } catch (err) {
      console.error('Error registering DJ:', err);
      setError('Failed to register DJ. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 flex items-center">
        <Users className="w-6 h-6 mr-3 text-blue-400" />
        Register DJ
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="djName" className="block text-sm font-medium text-gray-300">DJ Name</label>
          <input
            type="text"
            id="djName"
            name="djName"
            value={formData.djName}
            onChange={handleChange}
            required
            className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="realName" className="block text-sm font-medium text-gray-300">Real Name</label>
          <input
            type="text"
            id="realName"
            name="realName"
            value={formData.realName}
            onChange={handleChange}
            required
            className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="info" className="block text-sm font-medium text-gray-300">Promo Info / Bio</label>
          <textarea
            id="info"
            name="info"
            rows={3}
            value={formData.info}
            onChange={handleChange}
            className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="photoUrl" className="block text-sm font-medium text-gray-300">Promo Photo (URL)</label>
          <input
            type="url"
            id="photoUrl"
            name="photoUrl"
            value={formData.photoUrl}
            onChange={handleChange}
            placeholder="https://example.com/photo.jpg"
            className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="visualUrl" className="block text-sm font-medium text-gray-300">Visuals / Content (URL)</label>
          <input
            type="url"
            id="visualUrl"
            name="visualUrl"
            value={formData.visualUrl}
            onChange={handleChange}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={disabled}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {disabled ? 'Registering...' : 'Register DJ'}
        </button>
      </form>
    </div>
  );
}

/**
 * Logged-out Gate: Login/Register options and inline registration (optional)
 */
function AuthGate({ auth, db, appId }: { auth: ReturnType<typeof getAuth> | null; db: any; appId: string }) {
  // Local state for switching between Login / Register
  const [mode, setMode] = useState<'login' | 'register'>('login');

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-6 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-gray-800 rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-blue-400 mb-2 text-center">Temple DJ Spot</h1>
        <p className="text-center text-gray-300 mb-6">Sign in to manage your crew and set times.</p>

        <div className="flex items-center justify-center gap-3 mb-6">
          <button onClick={() => setMode('login')} className={`py-2 px-4 rounded-md ${mode === 'login' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>Login</button>
          <button onClick={() => setMode('register')} className={`py-2 px-4 rounded-md ${mode === 'register' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>Register</button>
        </div>

        {mode === 'login' ? (
          <InlineLogin auth={auth} />
        ) : (
          <InlineRegister auth={auth} db={db} appId={appId} />
        )}

        <div className="mt-6">
          <InlineRegisterNotice />
          <TermsAndConditions />
        </div>
      </div>
    </div>
  );
}

/**
 * Inline registration helper explaining shared account, with optional quick-register link.
 */
function InlineRegisterNotice() {
  return (
    <div className="text-sm text-gray-300 space-y-2">
      <p>
        Your Portal UI account is shared across sites. Register once on the main site, then return here to manage your crew. 
        When you first sign in, we’ll set up your crew space automatically.
      </p>
    </div>
  );
}

/**
 * Simple Terms & Conditions section
 */
function TermsAndConditions() {
  return (
    <div className="mt-6 text-xs text-gray-400 border-t border-gray-700 pt-4 leading-relaxed">
      <p className="font-semibold text-gray-300 mb-1">Terms & Conditions (Summary)</p>
      <ul className="list-disc ml-5 space-y-1">
        <li>Use this service responsibly and in compliance with applicable laws.</li>
        <li>You own the content you upload; you grant us a license to host and display it to provide the service.</li>
        <li>Don’t upload content that is illegal, infringing, or harmful.</li>
        <li>We may update features and policies; continued use constitutes acceptance of changes.</li>
        <li>This service is provided “as is” without warranties; we’re not liable for indirect or consequential damages.</li>
        <li>If you’re under your regional age of digital consent, use only with a guardian’s permission.</li>
        <li>We may suspend accounts that violate these terms or abuse resources.</li>
        <li>For data requests or takedowns, contact support via the main Portal UI site.</li>
      </ul>
    </div>
  );
}

/** Inline Login form */
function InlineLogin({ auth }: { auth: ReturnType<typeof getAuth> | null }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setLoading(true);
    setMsg(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMsg('Logged in successfully.');
    } catch (err: any) {
      console.error(err);
      const code = err?.code || '';
      let m = 'Login failed. Check your credentials.';
      if (code.includes('auth/user-not-found')) m = 'No account with that email.';
      if (code.includes('auth/wrong-password')) m = 'Incorrect password.';
      setMsg(m);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm text-gray-300">Email</label>
        <input value={email} onChange={e => setEmail(e.target.value)} type="email" required className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
      </div>
      <div>
        <label className="block text-sm text-gray-300">Password</label>
        <input value={password} onChange={e => setPassword(e.target.value)} type="password" required minLength={6} className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
      </div>
      {msg && <div className="text-sm text-yellow-300">{msg}</div>}
      <div className="flex items-center gap-3">
        <button disabled={loading} type="submit" className="py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-md">{loading ? 'Signing in…' : 'Sign in'}</button>
        <a href="/login.html" className="text-sm text-gray-400">I prefer the full login page</a>
      </div>
    </form>
  );
}

/** Inline Register form */
function InlineRegister({ auth, db, appId }: { auth: ReturnType<typeof getAuth> | null; db: any; appId: string }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;
    if (password !== confirm) { setMsg('Passwords do not match'); return; }
    setLoading(true); setMsg(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      // store profile
      await setDoc(doc(db, 'users', cred.user.uid), { uid: cred.user.uid, fullName, email, createdAt: new Date().toISOString() });
      // create app meta
      await setDoc(doc(db, `users/${cred.user.uid}/apps/${appId}`, 'meta'), { ownerUid: cred.user.uid, appId, createdAt: new Date().toISOString() });
      // send verification
      try { await sendEmailVerification(cred.user); } catch (_) {}
      setMsg('Registered and signed in. Verification email sent (if supported).');
    } catch (err: any) {
      console.error(err);
      let m = 'Registration failed.';
      const code = err?.code || '';
      if (code.includes('auth/email-already-in-use')) m = 'This email is already registered.';
      if (code.includes('auth/weak-password')) m = 'Password is too weak.';
      setMsg(m);
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm text-gray-300">Full name</label>
        <input value={fullName} onChange={e => setFullName(e.target.value)} type="text" required className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
      </div>
      <div>
        <label className="block text-sm text-gray-300">Email</label>
        <input value={email} onChange={e => setEmail(e.target.value)} type="email" required className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-300">Password</label>
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" required minLength={6} className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
        </div>
        <div>
          <label className="block text-sm text-gray-300">Confirm</label>
          <input value={confirm} onChange={e => setConfirm(e.target.value)} type="password" required minLength={6} className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
        </div>
      </div>
      {msg && <div className="text-sm text-yellow-300">{msg}</div>}
      <div>
        <button disabled={loading} type="submit" className="py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-md">{loading ? 'Registering…' : 'Create account'}</button>
      </div>
    </form>
  );
}

/** Admin Settings: add admin email or UID to allow list */
function AdminSettings({ db, userId, appId }: { db: ReturnType<typeof getFirestore>; userId: string; appId: string }) {
  const [email, setEmail] = useState('');
  const [uid, setUid] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const baseUserPath = `users/${userId}/apps/${appId}`;
  const metaRef = doc(db, `${baseUserPath}/meta/app`);

  const addEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSaving(true); setStatus(null);
    try {
      await updateDoc(metaRef, { allowedAdminEmails: arrayUnion(email.trim().toLowerCase()) });
      setStatus('Admin email added.');
      setEmail('');
    } catch (err) {
      console.error(err); setStatus('Failed to add email.');
    } finally { setSaving(false); }
  };

  const addUid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid) return;
    setSaving(true); setStatus(null);
    try {
      await updateDoc(metaRef, { allowedAdminUids: arrayUnion(uid.trim()) });
      setStatus('Admin UID added.');
      setUid('');
    } catch (err) {
      console.error(err); setStatus('Failed to add UID.');
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={addEmail} className="flex items-end gap-2">
        <div className="flex-1">
          <label className="block text-sm text-gray-300">Add admin by email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="crew@example.com" className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
        </div>
        <button disabled={saving || !email} className="py-2 px-3 bg-blue-600 hover:bg-blue-700 rounded-md">Add</button>
      </form>

      <form onSubmit={addUid} className="flex items-end gap-2">
        <div className="flex-1">
          <label className="block text-sm text-gray-300">Add admin by UID</label>
          <input value={uid} onChange={e => setUid(e.target.value)} type="text" placeholder="Paste Firebase UID" className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
        </div>
        <button disabled={saving || !uid} className="py-2 px-3 bg-blue-600 hover:bg-blue-700 rounded-md">Add</button>
      </form>

      {status && <div className="text-sm text-gray-300">{status}</div>}
      <div className="text-xs text-gray-400">Tip: Ask the user to copy their UID from the header or provide their account email.</div>
    </div>
  );
}

/**
 * Unassigned DJ Pool
 */
function DJPool({ djs, onDjClick, onDragStart, onDragOver, onDragEnter, onDragLeave, onDrop, isDropZoneActive, disabled, schedule }: {
  djs: DJ[];
  onDjClick: (dj: DJ) => void;
  onDragStart: (e: React.DragEvent, data: unknown) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  isDropZoneActive: boolean;
  disabled: boolean;
  schedule: Schedule | null;
}) {
  // Helper: get assigned slots for a DJ
  const getDjSlots = (djId: string) => {
    if (!schedule) return [];
    return schedule.timeSlots.filter(slot => 
      slot.djId === djId || (slot.guests && slot.guests.some(g => g.djId === djId))
    );
  };
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex-grow">
      <h2 className="text-2xl font-semibold mb-4 flex items-center">
        <Music className="w-6 h-6 mr-3 text-blue-400" />
        Unassigned DJs
      </h2>
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {djs.length === 0 ? (
          <p className="text-gray-400">No unassigned DJs. Register one!</p>
        ) : (
          djs.map(dj => {
            const djSlots = getDjSlots(dj.id!);
            return (
              <div key={dj.id}>
                <DJItem
                  dj={dj}
                  onClick={() => onDjClick(dj)}
                  isDraggable={!disabled}
                  onDragStart={(e) => onDragStart(e, { from: 'pool', dj })}
                  showInvite={djSlots.length > 0}
                  assignedSlots={djSlots}
                />
              </div>
            );
          })
        )}
      </div>
      
      {/* --- Unassign Drop Zone --- */}
      <div 
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`mt-6 p-4 border-2 border-dashed rounded-lg text-center transition-all duration-200 ${
          isDropZoneActive ? 'border-red-500 bg-red-900/50' : 'border-gray-600'
        }`}
      >
        <div className="flex flex-col items-center justify-center pointer-events-none">
          <Trash2 className={`w-8 h-8 ${isDropZoneActive ? 'text-red-400' : 'text-gray-500'}`} />
          <p className={`mt-2 text-sm ${isDropZoneActive ? 'text-red-300' : 'text-gray-400'}`}>
            Drag a DJ here to unassign
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Schedule Board
 */
function ScheduleBoard({ schedule, djs, onDjClick, onDragStart, onDragOver, onDragEnter, onDragEnterSlot, onDragLeave, onDrop, isDropZoneActive, disabled, activeRange, onReset }: {
  schedule: Schedule;
  djs: DJ[];
  onDjClick: (dj: DJ) => void;
  onDragStart: (e: React.DragEvent, data: unknown) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragEnterSlot: (e: React.DragEvent, slotIndex: number) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, slotIndex: number) => void;
  isDropZoneActive: boolean;
  disabled: boolean;
  activeRange: { start: number; end: number } | null;
  onReset: () => void;
}) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold flex items-center">
          <Calendar className="w-6 h-6 mr-3 text-blue-400" />
          {schedule.name} Set Times
        </h2>
        <button
          onClick={onReset}
          disabled={disabled}
          className="py-2 px-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md text-white text-sm flex items-center gap-2"
          title="Clear all assignments and return DJs to unassigned pool"
        >
          <Trash2 className="w-4 h-4" />
          Reset Schedule
        </button>
      </div>
      <p className="text-xs text-gray-400 mb-4">
        Tips: Drag to swap. Use the small edge handles on an assigned slot to extend earlier/later. Hold Shift while dropping to fill a range. Hold Alt to overlap into a slot without replacing.
      </p>
      <div className="space-y-4">
        {schedule.timeSlots.map((slot, index) => (
          <div key={index}>
            <TimeSlot
              slot={slot}
              slotIndex={index}
              allDjs={djs}
              onDjClick={onDjClick}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDragEnter={onDragEnter}
              onDragEnterSlot={onDragEnterSlot}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              disabled={disabled}
              activeRange={activeRange}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Individual Time Slot
 */
function TimeSlot({ slot, slotIndex, allDjs, onDjClick, onDragStart, onDragOver, onDragEnter, onDragEnterSlot, onDragLeave, onDrop, disabled, activeRange }: {
  slot: TimeSlot;
  slotIndex: number;
  allDjs: DJ[];
  onDjClick: (dj: DJ) => void;
  onDragStart: (e: React.DragEvent, data: unknown) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragEnterSlot: (e: React.DragEvent, slotIndex: number) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, slotIndex: number) => void;
  disabled: boolean;
  activeRange: { start: number; end: number } | null;
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const dj = slot.djId ? allDjs.find(d => d.id === slot.djId) || null : null;
  const inActiveRange = activeRange ? (slotIndex >= activeRange.start && slotIndex <= activeRange.end) : false;
  
  const handleSlotDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
    onDragEnter(e); // generic enter (kept for counter)
    onDragEnterSlot(e, slotIndex); // range-aware enter
  };
  
  const handleSlotDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    onDragLeave(e); // Notify parent
  };

  const handleSlotDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    onDrop(e, slotIndex); // Notify parent with index
  };

  return (
    <div 
      className={`flex items-center bg-gray-700 rounded-lg p-3 transition-all duration-200 ${
        (isDragOver || inActiveRange) ? 'ring-2 ring-blue-500 bg-gray-600' : ''
      }`}
      onDragOver={onDragOver}
      onDragEnter={handleSlotDragEnter}
      onDragLeave={handleSlotDragLeave}
      onDrop={handleSlotDrop}
    >
      <div className="w-32 flex-shrink-0 text-blue-300 font-mono flex items-center">
        <Clock className="w-4 h-4 mr-2" />
        {slot.time}
      </div>
      <div className="flex-grow relative">
        {dj ? (
          <div className="relative">
            {/* Left resize handle */}
            <div
              draggable={!disabled}
              onDragStart={(e) => onDragStart(e, { from: 'resize', direction: 'left', slotIndex, djId: dj.id, djName: dj.djName })}
              title="Extend earlier"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-8 bg-blue-500/60 hover:bg-blue-500 rounded-sm cursor-ew-resize"
            />
            {/* Right resize handle */}
            <div
              draggable={!disabled}
              onDragStart={(e) => onDragStart(e, { from: 'resize', direction: 'right', slotIndex, djId: dj.id, djName: dj.djName })}
              title="Extend later"
              className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-8 bg-blue-500/60 hover:bg-blue-500 rounded-sm cursor-ew-resize"
            />
            <DJItem
              dj={dj}
              onClick={() => onDjClick(dj)}
              isDraggable={!disabled}
              onDragStart={(e) => onDragStart(e, { from: 'slot', slotIndex, djId: dj.id, djName: dj.djName })}
            />
          </div>
        ) : (
          <div className="text-center text-gray-500 p-3 border border-dashed border-gray-600 rounded-md">
            Empty Slot
          </div>
        )}
        {/* Guests */}
        {slot.guests && slot.guests.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {slot.guests.map(g => (
              <span key={g.djId} className="text-xs bg-gray-900 border border-gray-600 rounded px-2 py-1 text-gray-200">
                + {g.djName}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Draggable/Clickable DJ Item
 */
function DJItem({ dj, onClick, isDraggable, onDragStart, showInvite, assignedSlots }: {
  dj: DJ;
  onClick: () => void;
  isDraggable: boolean;
  onDragStart: (e: React.DragEvent) => void;
  showInvite?: boolean;
  assignedSlots?: TimeSlot[];
}) {
  const [copied, setCopied] = useState(false);
  const placeholder = `https://placehold.co/40x40/374151/9CA3AF?text=${encodeURIComponent(dj.djName?.charAt(0) || 'D')}`;
  
  const handleInvite = (e: React.MouseEvent) => {
    e.stopPropagation();
    let inviteUrl = `${window.location.origin}/Registration.html?djName=${encodeURIComponent(dj.djName)}&realName=${encodeURIComponent(dj.realName)}`;
    
    // Add assigned time slots to the URL
    if (assignedSlots && assignedSlots.length > 0) {
      const slotTimes = assignedSlots.map(slot => slot.time).join(',');
      inviteUrl += `&slots=${encodeURIComponent(slotTimes)}`;
    }
    
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy invite link:', err);
    });
  };

  return (
    <div
      draggable={isDraggable}
      onDragStart={onDragStart}
      className={`flex items-center bg-gray-900 p-2 rounded-md shadow-sm ${
        isDraggable ? 'cursor-move' : 'cursor-pointer'
      } border border-gray-700 hover:bg-gray-800 transition-colors`}
    >
      <GripVertical className="w-5 h-5 mr-2 text-gray-500 flex-shrink-0" />
      <img
        src={dj.photoUrl || placeholder}
        alt={dj.djName}
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = placeholder; }}
        className="w-10 h-10 rounded-full object-cover mr-3 flex-shrink-0"
      />
      <div className="flex-grow min-w-0" onClick={onClick}>
        <p className="text-md font-semibold text-white truncate">{dj.djName}</p>
        <p className="text-sm text-gray-400 truncate">{dj.realName}</p>
      </div>
      {showInvite && (
        <button
          onClick={handleInvite}
          className={`ml-2 px-2 py-1 rounded text-xs font-medium transition-colors flex-shrink-0 ${
            copied 
              ? 'bg-green-600 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
          title="Copy invite link to clipboard"
        >
          {copied ? 'Copied!' : 'Invite'}
        </button>
      )}
    </div>
  );
}

/**
 * DJ Info Modal
 */
function DJModal({ dj, onClose }: { dj: DJ; onClose: () => void }) {
  const bigPlaceholder = 'https://placehold.co/600x400/374151/9CA3AF?text=No+Photo';
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()} // Prevent closing on modal click
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-blue-400 flex items-center">
            <Music className="w-6 h-6 mr-3" />
            {dj.djName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white rounded-full p-1 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <img
            src={dj.photoUrl || bigPlaceholder}
            alt={dj.djName}
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = bigPlaceholder; }}
            className="w-full h-64 object-cover rounded-lg bg-gray-700"
          />
          
          <div className="bg-gray-700 p-4 rounded-lg">
             <h3 className="text-sm font-semibold text-gray-400 flex items-center">
               <User className="w-4 h-4 mr-2" />
               Real Name
             </h3>
             <p className="text-lg text-white">{dj.realName}</p>
          </div>
          
          {dj.info && (
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-400 flex items-center">
                <Info className="w-4 h-4 mr-2" />
                Bio / Info
              </h3>
              <p className="text-white whitespace-pre-wrap">{dj.info}</p>
            </div>
          )}
          
          {dj.visualUrl && (
             <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-400 flex items-center">
                  <Video className="w-4 h-4 mr-2" />
                  Visuals / Content
                </h3>
                <a
                  href={dj.visualUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 hover:underline truncate block"
                >
                  {dj.visualUrl}
                </a>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
