import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  User as FirebaseUser,
  connectAuthEmulator 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  connectFirestoreEmulator,
  FirestoreError
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL,
  connectStorageEmulator 
} from 'firebase/storage';

// Import the Firebase config from the main portal
// This will be loaded from the parent window or environment
declare global {
  interface Window {
    FIREBASE_CONFIG: any;
    firebaseConfig: any;
  }
}

// Get Firebase config from parent portal or use environment variables
let firebaseConfig: any;

try {
  // Try to get config from window.FIREBASE_CONFIG (main portal config)
  if (window.FIREBASE_CONFIG) {
    firebaseConfig = window.FIREBASE_CONFIG;
    console.log('Using window.FIREBASE_CONFIG');
  }
  // Try to get config from parent window (when embedded)
  else if (window.parent && window.parent !== window) {
    firebaseConfig = (window.parent as any).FIREBASE_CONFIG || window.parent.firebaseConfig;
    console.log('Using parent window config');
  }
  // Fallback to local config
  else if (window.firebaseConfig) {
    firebaseConfig = window.firebaseConfig;
    console.log('Using window.firebaseConfig');
  }
  
  // Development fallback
  if (!firebaseConfig) {
    console.warn('No Firebase config found, using demo config');
    firebaseConfig = {
      apiKey: "demo-api-key",
      authDomain: "demo-project.firebaseapp.com",
      projectId: "demo-project",
      storageBucket: "demo-project.appspot.com",
      messagingSenderId: "123456789",
      appId: "demo-app-id"
    };
  }
} catch (error) {
  console.error('Error loading Firebase config:', error);
  // Use demo config as ultimate fallback
  firebaseConfig = {
    apiKey: "demo-api-key",
    authDomain: "demo-project.firebaseapp.com",
    projectId: "demo-project",
    storageBucket: "demo-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "demo-app-id"
  };
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Connect to emulators in development
if (import.meta.env.DEV || window.location.hostname === 'localhost') {
  try {
    // Connect to emulators if running locally
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
  } catch (error) {
    // Emulators not running, continue with production Firebase
    console.log('Firebase emulators not available, using production');
  }
}

// Types
import { User, Track, Post, Comment, Label, GlobalEvent } from '../types';

// Auth utilities
export const getCurrentUser = (): Promise<FirebaseUser | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

export const requireAuth = async (): Promise<FirebaseUser> => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
};

// Collection names
const COLLECTIONS = {
  USERS: 'soundwave_users',
  TRACKS: 'soundwave_tracks', 
  POSTS: 'soundwave_posts',
  COMMENTS: 'soundwave_comments',
  LABELS: 'soundwave_labels',
  PLAYLISTS: 'soundwave_playlists',
  MASTERCLASSES: 'soundwave_masterclasses',
  TUTORIALS: 'soundwave_tutorials',
  SAMPLE_PACKS: 'soundwave_sample_packs',
  GLOBAL_EVENTS: 'soundwave_global_events'
};

// Error handling utility
const handleFirestoreError = (error: any, operation: string) => {
  console.error(`Firestore ${operation} error:`, error);
  if (error instanceof FirestoreError) {
    switch (error.code) {
      case 'permission-denied':
        throw new Error('You do not have permission to perform this action');
      case 'not-found':
        throw new Error('The requested item was not found');
      case 'unavailable':
        throw new Error('Service temporarily unavailable. Please try again.');
      default:
        throw new Error(`${operation} failed: ${error.message}`);
    }
  }
  throw new Error(`${operation} failed`);
};

// User data functions
export const getUsers = async (): Promise<User[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.USERS));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as User[];
  } catch (error) {
    handleFirestoreError(error, 'Get users');
    return [];
  }
};

export const getUserById = async (id: string): Promise<User | undefined> => {
  try {
    const docSnap = await getDoc(doc(db, COLLECTIONS.USERS, id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as User;
    }
    return undefined;
  } catch (error) {
    handleFirestoreError(error, 'Get user');
    return undefined;
  }
};

export const createOrUpdateUser = async (user: Partial<User>): Promise<User> => {
  try {
    const currentUser = await requireAuth();
    const userId = currentUser.uid;
    
    const userData = {
      ...user,
      id: userId,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(doc(db, COLLECTIONS.USERS, userId), userData);
    return userData as User;
  } catch (error) {
    handleFirestoreError(error, 'Create/update user');
    throw error;
  }
};

// Track data functions
export const getTracks = async (): Promise<Track[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.TRACKS),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Track[];
  } catch (error) {
    handleFirestoreError(error, 'Get tracks');
    return [];
  }
};

export const getTrackById = async (id: string): Promise<Track | undefined> => {
  try {
    const docSnap = await getDoc(doc(db, COLLECTIONS.TRACKS, id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Track;
    }
    return undefined;
  } catch (error) {
    handleFirestoreError(error, 'Get track');
    return undefined;
  }
};

export const getTracksByArtist = async (artistId: string): Promise<Track[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.TRACKS),
      where('artistId', '==', artistId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Track[];
  } catch (error) {
    handleFirestoreError(error, 'Get tracks by artist');
    return [];
  }
};

export const createTrack = async (track: Omit<Track, 'id'>): Promise<Track> => {
  try {
    await requireAuth();
    
    const trackData = {
      ...track,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, COLLECTIONS.TRACKS), trackData);
    return { id: docRef.id, ...trackData } as Track;
  } catch (error) {
    handleFirestoreError(error, 'Create track');
    throw error;
  }
};

// Post data functions
export const getPosts = async (): Promise<Post[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.POSTS),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Post[];
  } catch (error) {
    handleFirestoreError(error, 'Get posts');
    return [];
  }
};

export const createPost = async (post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'replyCount'>): Promise<Post> => {
  try {
    const currentUser = await requireAuth();
    
    const postData = {
      ...post,
      authorId: currentUser.uid,
      createdAt: serverTimestamp(),
      likes: 0,
      replyCount: 0,
      replies: []
    };
    
    const docRef = await addDoc(collection(db, COLLECTIONS.POSTS), postData);
    return { id: docRef.id, ...postData } as Post;
  } catch (error) {
    handleFirestoreError(error, 'Create post');
    throw error;
  }
};

// Comment functions
export const addComment = async (
  parentType: 'track' | 'post' | 'label' | 'masterclass',
  parentId: string,
  content: string
): Promise<Comment> => {
  try {
    const currentUser = await requireAuth();
    const userData = await getUserById(currentUser.uid);
    
    if (!userData) {
      throw new Error('User profile not found');
    }
    
    const comment: Omit<Comment, 'id'> = {
      authorId: currentUser.uid,
      authorName: userData.name,
      authorAvatarUrl: userData.avatarUrl || '',
      content,
      createdAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(collection(db, COLLECTIONS.COMMENTS), {
      ...comment,
      parentType,
      parentId,
      createdAt: serverTimestamp()
    });
    
    return { id: docRef.id, ...comment };
  } catch (error) {
    handleFirestoreError(error, 'Add comment');
    throw error;
  }
};

// File upload utilities
export const uploadFile = async (file: File, path: string): Promise<string> => {
  try {
    await requireAuth();
    
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    handleFirestoreError(error, 'Upload file');
    throw error;
  }
};

export const uploadTrackAudio = async (file: File, trackId: string): Promise<string> => {
  return uploadFile(file, `tracks/${trackId}/audio/${file.name}`);
};

export const uploadTrackCover = async (file: File, trackId: string): Promise<string> => {
  return uploadFile(file, `tracks/${trackId}/cover/${file.name}`);
};

export const uploadUserAvatar = async (file: File, userId: string): Promise<string> => {
  return uploadFile(file, `users/${userId}/avatar/${file.name}`);
};

// Labels
export const getLabels = async (): Promise<Label[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.LABELS));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Label[];
  } catch (error) {
    handleFirestoreError(error, 'Get labels');
    return [];
  }
};

export const getLabelById = async (id: string): Promise<Label | undefined> => {
  try {
    const docSnap = await getDoc(doc(db, COLLECTIONS.LABELS, id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Label;
    }
    return undefined;
  } catch (error) {
    handleFirestoreError(error, 'Get label');
    return undefined;
  }
};

// Global Events
export const getGlobalEvents = async (): Promise<GlobalEvent[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.GLOBAL_EVENTS),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as GlobalEvent[];
  } catch (error) {
    handleFirestoreError(error, 'Get global events');
    return [];
  }
};

// Masterclasses
export const getMasterclasses = async (): Promise<any[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.MASTERCLASSES),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    handleFirestoreError(error, 'Get masterclasses');
    return [];
  }
};

export const getMasterclassById = async (id: string): Promise<any | undefined> => {
  try {
    const docSnap = await getDoc(doc(db, COLLECTIONS.MASTERCLASSES, id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return undefined;
  } catch (error) {
    handleFirestoreError(error, 'Get masterclass');
    return undefined;
  }
};

// Tutorials
export const getTutorials = async (): Promise<any[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.TUTORIALS),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    handleFirestoreError(error, 'Get tutorials');
    return [];
  }
};

export const getTutorialById = async (id: string): Promise<any | undefined> => {
  try {
    const docSnap = await getDoc(doc(db, COLLECTIONS.TUTORIALS, id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return undefined;
  } catch (error) {
    handleFirestoreError(error, 'Get tutorial');
    return undefined;
  }
};

// Sample Packs
export const getSamplePacks = async (): Promise<any[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.SAMPLE_PACKS),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    handleFirestoreError(error, 'Get sample packs');
    return [];
  }
};

export const getSamplePackById = async (id: string): Promise<any | undefined> => {
  try {
    const docSnap = await getDoc(doc(db, COLLECTIONS.SAMPLE_PACKS, id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return undefined;
  } catch (error) {
    handleFirestoreError(error, 'Get sample pack');
    return undefined;
  }
};

// Playlists
export const getPlaylists = async (): Promise<any[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.PLAYLISTS),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    handleFirestoreError(error, 'Get playlists');
    return [];
  }
};

export const getPlaylistById = async (id: string): Promise<any | undefined> => {
  try {
    const docSnap = await getDoc(doc(db, COLLECTIONS.PLAYLISTS, id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return undefined;
  } catch (error) {
    handleFirestoreError(error, 'Get playlist');
    return undefined;
  }
};

// Initialize user profile when first accessing SoundWave
export const initializeSoundWaveUser = async (): Promise<void> => {
  try {
    const currentUser = await requireAuth();
    const existingUser = await getUserById(currentUser.uid);
    
    if (!existingUser) {
      // Create initial SoundWave user profile
      const userData: Partial<User> = {
        name: currentUser.displayName || currentUser.email?.split('@')[0] || 'SoundWave User',
        bio: 'New to SoundWave',
        avatarUrl: currentUser.photoURL || '',
        interview: [],
        gallery: []
      };
      
      await createOrUpdateUser(userData);
    }
  } catch (error) {
    console.error('Error initializing SoundWave user:', error);
    // Don't throw - allow user to continue even if profile creation fails
  }
};