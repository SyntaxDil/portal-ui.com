import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
  setPersistence,
  inMemoryPersistence
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
}

interface Schedule {
  name: string;
  timeSlots: TimeSlot[];
}

// --- Main Application Component ---
export default function App() {
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
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragCounter, setDragCounter] = useState(0); // For styling drop zones

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
          setIsAuthReady(true);
          return;
        }
        try {
          // If an initial custom token is provided, use it (e.g., from an admin flow)
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await setPersistence(authInstance, inMemoryPersistence);
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            await signInWithCustomToken(authInstance, __initial_auth_token);
            return;
          }
        } catch (authError) {
          console.error('Error during custom-token sign-in:', authError);
        }
        // Require real login for backbone access
        const redirectUrl = '/login.html?redirect=/Spaces/TempleDjs/';
        window.location.href = redirectUrl;
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

  // Base path under the authenticated user to align with typical Firestore rules
  const baseUserPath = `users/${userId}/apps/${appId}`;

  // --- Listener for DJ Collection ---
  const djsCollectionPath = `${baseUserPath}/djs`;
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
  const scheduleDocPath = `${baseUserPath}/schedule/mainStage`;
    const scheduleRef = doc(db, scheduleDocPath);

    const unsubscribeSchedule = onSnapshot(scheduleRef, async (docSnap) => {
      if (docSnap.exists()) {
        setSchedule(docSnap.data() as Schedule);
      } else {
        // Schedule doesn't exist, create a default one
        const defaultSchedule: Schedule = {
          name: 'Main Stage',
          timeSlots: [
            { time: '18:00 - 19:00', djId: null, djName: null },
            { time: '19:00 - 20:00', djId: null, djName: null },
            { time: '20:00 - 21:00', djId: null, djName: null },
            { time: '21:00 - 22:00', djId: null, djName: null },
            { time: '22:00 - 23:00', djId: null, djName: null },
            { time: '23:00 - 00:00', djId: null, djName: null },
            { time: '00:00 - 01:00', djId: null, djName: null },
            { time: '01:00 - 02:00', djId: null, djName: null },
          ],
        };
        try {
          await setDoc(scheduleRef, defaultSchedule);
          setSchedule(defaultSchedule);
        } catch (err) {
          console.error('Error creating default schedule:', err);
          setError('Failed to initialize schedule.');
        }
      }
    }, (err) => {
      console.error('Error listening to schedule:', err);
      setError('Failed to load schedule.');
    });

    return () => {
      unsubscribeDjs();
      unsubscribeSchedule();
    };
  }, [isAuthReady, db, userId]);

  // --- Event Handlers ---

  const handleOpenModal = (dj: DJ) => {
    setSelectedDj(dj);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedDj(null);
  };

  const handleDragStart = (e: React.DragEvent, dragData: unknown) => {
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setDragCounter(prev => prev + 1);
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
      
  const scheduleRef = doc(db!, `users/${userId}/apps/${appId}/schedule/mainStage`);

      if (sourceData.from === 'pool') {
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
          // DJ is not scheduled, just add them
          newTimeSlots[targetSlotIndex] = { ...newTimeSlots[targetSlotIndex], djId, djName };
        }
        
      } else if (sourceData.from === 'slot') {
        // --- Dragging from SLOT to SLOT (Swap) ---
        const sourceSlotIndex = sourceData.slotIndex as number;
        if (sourceSlotIndex === targetSlotIndex) return; // Dropped on itself

        const sourceSlot = { ...newTimeSlots[sourceSlotIndex] };
        const targetSlot = { ...newTimeSlots[targetSlotIndex] };

        // Swap 'em
        newTimeSlots[targetSlotIndex] = { ...targetSlot, djId: sourceSlot.djId, djName: sourceSlot.djName };
        newTimeSlots[sourceSlotIndex] = { ...sourceSlot, djId: targetSlot.djId, djName: targetSlot.djName };
      }
      
      // Update Firestore
      await updateDoc(scheduleRef, { timeSlots: newTimeSlots });
      
    } catch (err) {
      console.error('Error handling drop on slot:', err);
      setError('Failed to update schedule.');
    } finally {
      setIsLoading(false);
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
         const scheduleRef = doc(db!, `users/${userId}/apps/${appId}/schedule/mainStage`);
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

  // --- Calculate Unassigned DJs ---
  const assignedDjIds = new Set((schedule?.timeSlots || []).map(slot => slot.djId).filter(Boolean) as string[]);
  const unassignedDjs = djs.filter(dj => !assignedDjIds.has(dj.id!));
  
  if (!isAuthReady || !schedule) {
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
          <p className="text-center text-sm text-gray-400 mt-2">
            Share this User ID with your crew: <code className="bg-gray-700 p-1 rounded-md">{userId}</code>
          </p>
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
            onDragLeave={handleDragLeave}
            onDrop={handleDropOnSlot}
            isDropZoneActive={dragCounter > 0}
            disabled={isLoading}
          />
        </section>
        
      </main>

      {/* --- DJ Info Modal --- */}
      {modalOpen && selectedDj && (
        <DJModal dj={selectedDj} onClose={handleCloseModal} />
      )}
    </div>
  );
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
  const djsCollectionPath = `users/${userId}/apps/${appId}/djs`;
      await addDoc(collection(db, djsCollectionPath), {
        ...formData,
        createdAt: new Date().toISOString()
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
 * Unassigned DJ Pool
 */
function DJPool({ djs, onDjClick, onDragStart, onDragOver, onDragEnter, onDragLeave, onDrop, isDropZoneActive, disabled }: {
  djs: DJ[];
  onDjClick: (dj: DJ) => void;
  onDragStart: (e: React.DragEvent, data: unknown) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  isDropZoneActive: boolean;
  disabled: boolean;
}) {
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
          djs.map(dj => (
            <div key={dj.id}>
              <DJItem
                dj={dj}
                onClick={() => onDjClick(dj)}
                isDraggable={!disabled}
                onDragStart={(e) => onDragStart(e, { from: 'pool', dj })}
              />
            </div>
          ))
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
function ScheduleBoard({ schedule, djs, onDjClick, onDragStart, onDragOver, onDragEnter, onDragLeave, onDrop, isDropZoneActive, disabled }: {
  schedule: Schedule;
  djs: DJ[];
  onDjClick: (dj: DJ) => void;
  onDragStart: (e: React.DragEvent, data: unknown) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, slotIndex: number) => void;
  isDropZoneActive: boolean;
  disabled: boolean;
}) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 flex items-center">
        <Calendar className="w-6 h-6 mr-3 text-blue-400" />
        {schedule.name} Set Times
      </h2>
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
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              disabled={disabled}
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
function TimeSlot({ slot, slotIndex, allDjs, onDjClick, onDragStart, onDragOver, onDragEnter, onDragLeave, onDrop, disabled }: {
  slot: TimeSlot;
  slotIndex: number;
  allDjs: DJ[];
  onDjClick: (dj: DJ) => void;
  onDragStart: (e: React.DragEvent, data: unknown) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, slotIndex: number) => void;
  disabled: boolean;
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const dj = slot.djId ? allDjs.find(d => d.id === slot.djId) || null : null;
  
  const handleSlotDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
    onDragEnter(e); // Notify parent
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
        isDragOver ? 'ring-2 ring-blue-500 bg-gray-600' : ''
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
      <div className="flex-grow">
        {dj ? (
          <DJItem
            dj={dj}
            onClick={() => onDjClick(dj)}
            isDraggable={!disabled}
            onDragStart={(e) => onDragStart(e, { from: 'slot', slotIndex, djId: dj.id, djName: dj.djName })}
          />
        ) : (
          <div className="text-center text-gray-500 p-3 border border-dashed border-gray-600 rounded-md">
            Empty Slot
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Draggable/Clickable DJ Item
 */
function DJItem({ dj, onClick, isDraggable, onDragStart }: {
  dj: DJ;
  onClick: () => void;
  isDraggable: boolean;
  onDragStart: (e: React.DragEvent) => void;
}) {
  const placeholder = `https://placehold.co/40x40/374151/9CA3AF?text=${encodeURIComponent(dj.djName?.charAt(0) || 'D')}`;
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
