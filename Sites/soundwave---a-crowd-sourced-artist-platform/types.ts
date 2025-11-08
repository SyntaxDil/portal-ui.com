export enum UploadType {
  FREE = 'Free Download',
  SALE = 'For Sale',
  PREVIEW = 'Preview Only',
}

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  bio: string;
  genre?: string;
  location?: string;
  spotifyUrl?: string;
  soundcloudUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  followers?: number;
  following?: number;
  isVerified?: boolean;
  // For Artist Focus View
  interview?: {
    question: string;
    answer: string;
  }[];
  gallery?: string[];
}

export type TrackCategory = 'Official Release' | 'Bootleg' | 'Remix';

export interface Comment {
  id: string;
  authorId?: string; // Optional for guests
  authorName: string;
  authorAvatarUrl?: string; // Optional for guests, or a generic one can be used
  content: string;
  createdAt: string; // ISO String
  taggedUserIds?: string[];
}

export interface Track {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  audioSrc: string;
  coverArtUrl: string;
  price: number;
  currency: string;
  uploadType: UploadType;
  description: string;
  tags: string[];
  category: TrackCategory;
  sourceSamples?: string[];
  labelId?: string;
  labelName?: string;
  comments?: Comment[];
}

export type PostAudience = 'public' | 'followers' | 'subscribers';

export interface Post {
  id:string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl: string;
  createdAt: string; // Using string for simplicity, could be Date
  likes: number;
  replyCount: number;
  audience?: PostAudience;
  replies?: Comment[];
}

export interface ChatMessage {
  id: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  text: string;
  timestamp: string;
}

export enum GlobalEventType {
  NEW_TRACK = 'NEW_TRACK',
  NEW_PHOTO = 'NEW_PHOTO',
  IRL_EVENT = 'IRL_EVENT',
}

export enum GlobalizerMode {
  GEO = 'GEO',
  UNIVERSE = 'UNIVERSE',
  COUNTRY = 'COUNTRY',
}

export interface GlobalEvent {
  id: string;
  type: GlobalEventType;
  title: string;
  description: string;
  authorName: string;
  // For positioning on the globe
  transform: string;
  animationDelay: string;
  // New properties for modes
  locationName: string; // For GeoMode
  country: string; // For Country Mode
  groups: string[]; // For Universe Mode, e.g., ["@Genre:Jungle", "@Artist:Sub-Tropical"]
  influence: number; // For artist ping size
  comments?: Comment[];
}

export interface UniverseGroup {
  name: string;
  transform: string;
  position: { x: number; y: number; z: number };
  influence: number; // Determines size of the node
}

// Artist Profile Page Additions
export type ExternalPlatform = 'Spotify' | 'SoundCloud' | 'YouTube' | 'Bandcamp';

export interface ExternalRelease {
  id: string;
  platform: ExternalPlatform;
  title: string;
  url: string;
  isPaid: boolean;
  type: 'Bootleg' | 'Remix' | 'Official';
  sourceArtist?: string;
  sourceSamples?: string[];
}

export interface PremiumPackItem {
  name: string;
  icon: string;
}

export interface PremiumPack {
  id: string;
  title: string;
  price: number;
  currency: string;
  items: PremiumPackItem[];
  description: string;
}

export interface RadioStation {
  id: string;
  name: string;
  description: string;
  tags: string[]; // Used to filter tracks
  artistId?: string; // Can be artist-specific
  imageUrl: string;
}

export interface QueuedTrack extends Track {
  votes: number;
  addedBy: string; // User name
  isPremiere?: boolean;
}

export interface LiveRoom {
  id: string;
  name: string;
  host: User;
  viewers: number;
  isLive: boolean;
}

export interface CommunityPlaylist {
  id: string;
  title: string;
  curator: User;
  tracks: Track[];
  comments?: Comment[];
}

export interface Tutorial {
  id: string;
  title: string;
  instructor: User;
  thumbnailUrl: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  comments?: Comment[];
}

export interface Masterclass {
  id: string;
  title: string;
  instructor: User;
  coverArtUrl: string;
  description: string;
  price: number;
  currency: string;
  durationHours: number;
  comments?: Comment[];
}

export interface SamplePack {
  id: string;
  title: string;
  creator: User;
  coverArtUrl: string;
  price: number;
  currency: string;
  tags: string[];
  contains: string[];
  comments?: Comment[];
}

export interface RekordboxTrack {
  trackId: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  totalTime: string;
  dateAdded: string;
  comments: string;
  playCount: string;
  key: string;
}

// Additions for Label feature
export interface StoreLink {
  name: string;
  url: string;
  icon: string; // e.g., 'bandcamp', 'package'
}

export interface LabelEvent {
  id: string;
  title: string;
  date: string; // "YYYY-MM-DD"
  location: string;
  description: string;
  url?: string;
  ticketUrl?: string;
}

export interface Opportunity {
    id: string;
    title: string;
    type: 'Artist' | 'Vocalist' | 'Designer' | 'Collaborator';
    description: string;
    comments?: Comment[];
}

export interface LabelTheme {
    bannerUrl: string;
    accentColor: string;
}

export interface Label {
  id: string;
  name: string;
  logoUrl: string;
  bannerUrl: string;
  bio: string;
  artistIds: string[];
  storeLinks: StoreLink[];
  featuredReleaseId?: string;
  galleryImageUrls?: string[];
  // New customizable features
  opportunities?: Opportunity[];
  eventPhotos?: string[];
  theme?: LabelTheme;
  comments?: Comment[];
}

// Additions for Direct Messaging
export interface DirectMessage {
    id: string;
    senderId: string;
    text: string;
    timestamp: string; // ISO String
}

export interface Conversation {
    id: string;
    participants: [User, User]; // Array of two users
    messages: DirectMessage[];
    unreadCount: number;
}