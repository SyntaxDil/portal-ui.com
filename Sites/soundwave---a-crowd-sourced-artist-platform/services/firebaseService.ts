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
  setDoc,
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

// Note: Emulator connections disabled to ensure production Firebase works correctly
// If you need emulators for local development, uncomment and configure:
// const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
// if (isDev) {
//   connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
//   connectFirestoreEmulator(db, 'localhost', 8080);
//   connectStorageEmulator(storage, 'localhost', 9199);
// }

console.log('✅ Firebase initialized with project:', firebaseConfig.projectId);

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

export const getCurrentUserId = (): string | undefined => {
  return auth.currentUser?.uid;
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
    // Try Firebase first
    const docSnap = await getDoc(doc(db, COLLECTIONS.USERS, id));
    if (docSnap.exists()) {
      console.log('✅ User retrieved from Firestore:', id);
      return { id: docSnap.id, ...docSnap.data() } as User;
    }
    return undefined;
  } catch (error) {
    console.error('❌ [getUserById] Error:', error);
    return undefined;
  }
};

export const createOrUpdateUser = async (userData: Partial<User>): Promise<User> => {
  console.log('💾 [createOrUpdateUser] Starting with data:', userData);
  
  const userId = userData.id || getCurrentUserId();
  console.log('🔑 [createOrUpdateUser] User ID:', userId);
  
  if (!userId) {
    const error = 'No user ID available - user must be authenticated';
    console.error('❌ [createOrUpdateUser]', error);
    throw new Error(error);
  }

  // Validate required fields with clear messages
  if (!userData.name || userData.name.trim().length < 2) {
    const error = `Artist name is required (got: "${userData.name}")`;
    console.error('❌ [createOrUpdateUser]', error);
    throw new Error(error);
  }
  if (!userData.bio || userData.bio.trim().length < 10) {
    const error = `Bio must be at least 10 characters (got: ${userData.bio?.length || 0} chars)`;
    console.error('❌ [createOrUpdateUser]', error);
    throw new Error(error);
  }
  if (!userData.genre || userData.genre.trim().length === 0) {
    const error = 'Genre is required';
    console.error('❌ [createOrUpdateUser]', error);
    throw new Error(error);
  }

  try {
    const userDoc: any = {
      id: userId,
      name: userData.name.trim(),
      bio: userData.bio.trim(),
      genre: userData.genre.trim(),
      location: userData.location?.trim() || '',
      avatarUrl: userData.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + userId,
      spotifyUrl: userData.spotifyUrl?.trim() || '',
      soundcloudUrl: userData.soundcloudUrl?.trim() || '',
      instagramUrl: userData.instagramUrl?.trim() || '',
      twitterUrl: userData.twitterUrl?.trim() || '',
      followers: userData.followers || 0,
      following: userData.following || 0,
      isVerified: userData.isVerified || false,
      updatedAt: new Date().toISOString()
    };
    
    // Check if user exists
    console.log('🔍 [createOrUpdateUser] Checking if user exists...');
    const existingUser = await getUserById(userId);
    
    if (!existingUser) {
      console.log('➕ [createOrUpdateUser] Creating new user');
      userDoc.createdAt = new Date().toISOString();
    } else {
      console.log('🔄 [createOrUpdateUser] Updating existing user');
    }
    
    console.log('📤 [createOrUpdateUser] Writing to Firestore...');
    await setDoc(doc(db, COLLECTIONS.USERS, userId), userDoc, { merge: true });
    console.log('✅ [createOrUpdateUser] Write successful');
    
    // Wait a moment for Firestore to process
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Verify save by reading back
    console.log('🔍 [createOrUpdateUser] Verifying save...');
    const savedUser = await getUserById(userId);
    
    if (!savedUser) {
      throw new Error('Profile was saved but could not be retrieved. Please refresh the page.');
    }
    
    console.log('✨ [createOrUpdateUser] Success! Profile ready:', savedUser.name);
    return savedUser;
    
  } catch (error: any) {
    console.error('❌ [createOrUpdateUser] Failed:', error);
    
    // Check for specific Firestore errors
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied. Please make sure Firebase rules are deployed.');
    }
    if (error.code === 'unavailable') {
      throw new Error('Cannot connect to database. Please check your internet connection.');
    }
    
    throw new Error(`Failed to save profile: ${error.message}`);
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
    // Return with ISO string timestamp for client-side use
    return { 
      id: docRef.id, 
      ...post,
      authorId: currentUser.uid,
      createdAt: new Date().toISOString(),
      likes: 0,
      replyCount: 0,
      replies: []
    } as Post;
  } catch (error) {
    handleFirestoreError(error, 'Create post');
    throw error;
  }
};

// Alias for createPost (some components use addPost)
export const addPost = createPost;

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
    // Try Firebase Storage first
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('✅ File uploaded to Firebase Storage');
    return downloadURL;
  } catch (error) {
    console.error('Upload file error:', error);
    // Fallback to base64 data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        console.log('✅ Fallback: File converted to data URL');
        resolve(dataUrl);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
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

export const getTracksByLabelId = async (labelId: string): Promise<Track[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.TRACKS),
      where('labelId', '==', labelId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Track[];
  } catch (error) {
    handleFirestoreError(error, 'Get tracks by label');
    return [];
  }
};

export const getArtistsByLabelId = async (labelId: string): Promise<User[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.USERS),
      where('labelId', '==', labelId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as User[];
  } catch (error) {
    handleFirestoreError(error, 'Get artists by label');
    return [];
  }
};

export const getPostsByLabelId = async (labelId: string): Promise<Post[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.POSTS),
      where('labelId', '==', labelId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Post[];
  } catch (error) {
    handleFirestoreError(error, 'Get posts by label');
    return [];
  }
};

export const getEventsByLabelId = async (labelId: string): Promise<any[]> => {
  try {
    // Events are typically stored in label document or separate collection
    // For now, return empty array - can be implemented based on data structure
    return [];
  } catch (error) {
    handleFirestoreError(error, 'Get events by label');
    return [];
  }
};

export const addCommentToTrack = async (trackId: string, commentData: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> => {
  return addComment('track', trackId, commentData.content);
};

export const addCommentToLabel = async (labelId: string, commentData: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> => {
  return addComment('label', labelId, commentData.content);
};

export const addReplyToPost = async (postId: string, commentData: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> => {
  return addComment('post', postId, commentData.content);
};

export const addCommentToMasterclass = async (masterclassId: string, commentData: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> => {
  return addComment('masterclass', masterclassId, commentData.content);
};

export const addCommentToSamplePack = async (packId: string, commentData: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> => {
  return addComment('post', packId, commentData.content); // Using 'post' as fallback
};

export const addCommentToOpportunity = async (opportunityId: string, commentData: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> => {
  return addComment('post', opportunityId, commentData.content); // Using 'post' as fallback
};

export const addCommentToTutorial = async (tutorialId: string, commentData: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> => {
  return addComment('post', tutorialId, commentData.content); // Using 'post' as fallback
};

export const addCommentToGlobalEvent = async (eventId: string, commentData: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> => {
  return addComment('post', eventId, commentData.content); // Using 'post' as fallback
};

// Stub functions for features not yet implemented
export const getLiveRooms = async (): Promise<any[]> => {
  console.log('getLiveRooms: Not yet implemented');
  return [];
};

export const getConversations = async (userId: string): Promise<any[]> => {
  console.log('getConversations: Not yet implemented for user', userId);
  return [];
};

export const getSampleChatMessages = async (): Promise<any[]> => {
  console.log('getSampleChatMessages: Not yet implemented');
  return [];
};

export const getExternalReleasesByArtist = async (artistId: string): Promise<any[]> => {
  console.log('getExternalReleasesByArtist: Not yet implemented');
  return [];
};

export const getPremiumPacksByArtist = async (artistId: string): Promise<any[]> => {
  console.log('getPremiumPacksByArtist: Not yet implemented');
  return [];
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