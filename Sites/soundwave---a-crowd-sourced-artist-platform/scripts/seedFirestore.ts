/**
 * Firestore Seed Data Script
 * 
 * This script populates the Firestore database with initial content for SoundWave.
 * Run this once to set up the platform with sample data.
 * 
 * Usage: npm run seed
 */

import { initializeApp } from 'firebase/app';
import { 
  getAuth,
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp,
  writeBatch,
  doc
} from 'firebase/firestore';

// Firebase config - will be loaded from environment or window
const firebaseConfig = {
  apiKey: "AIzaSyAkIjtyaYwcTPsFcDfJsoyQgRzCakgd1ic",
  authDomain: "portal-ui-1eac6.firebaseapp.com",
  projectId: "portal-ui-1eac6",
  storageBucket: "portal-ui-1eac6.firebasestorage.app",
  messagingSenderId: "836776026893",
  appId: "1:836776026893:web:ece6e8c0af87b85b2c39fb"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

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

// Seed data
const seedUsers = [
  {
    name: 'DJ Shadow',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=shadow',
    bio: 'Pioneer of instrumental hip-hop and turntablism. Creating soundscapes since the 90s.',
    interview: [
      { question: 'What inspired you to start producing?', answer: 'I fell in love with the idea of creating entire worlds from samples.' },
      { question: 'Favorite equipment?', answer: 'My MPC and a good record collection.' }
    ],
    gallery: []
  },
  {
    name: 'Sub-Tropical',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=subtropical',
    bio: 'Jungle & drum and bass producer. Bringing the heat from the underground.',
    interview: [
      { question: 'How did you get into jungle?', answer: 'Heard Goldie on the radio in 95 and never looked back.' }
    ],
    gallery: []
  },
  {
    name: 'Luna Breaks',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=luna',
    bio: 'Breakbeat and electro fusion artist. Exploring the space between genres.',
    interview: [],
    gallery: []
  },
  {
    name: 'Bass Architect',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bass',
    bio: 'Deep dubstep and bass music producer. Building sonic structures.',
    interview: [],
    gallery: []
  },
  {
    name: 'Vinyl Junkie',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vinyl',
    bio: 'Crate digger and selector. Sharing rare grooves and forgotten gems.',
    interview: [],
    gallery: []
  }
];

const seedTracks = [
  {
    title: 'Midnight Run',
    artistName: 'DJ Shadow',
    audioSrc: 'https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav',
    coverArtUrl: 'https://picsum.photos/seed/track1/400/400',
    price: 0,
    currency: 'USD',
    uploadType: 'Free Download',
    description: 'Late night vibes with dusty samples and heavy breaks.',
    tags: ['hip-hop', 'instrumental', 'trip-hop'],
    category: 'Official Release',
    sourceSamples: [],
    comments: []
  },
  {
    title: 'Jungle Storm',
    artistName: 'Sub-Tropical',
    audioSrc: 'https://www2.cs.uic.edu/~i101/SoundFiles/PinkPanther30.wav',
    coverArtUrl: 'https://picsum.photos/seed/track2/400/400',
    price: 2.99,
    currency: 'USD',
    uploadType: 'For Sale',
    description: 'High energy jungle roller with chopped breaks and deep bass.',
    tags: ['jungle', 'drum-and-bass', 'breakbeat'],
    category: 'Official Release',
    sourceSamples: ['Amen Break', 'Think Break'],
    comments: []
  },
  {
    title: 'Electric Dreams (Remix)',
    artistName: 'Luna Breaks',
    audioSrc: 'https://www2.cs.uic.edu/~i101/SoundFiles/StarWars60.wav',
    coverArtUrl: 'https://picsum.photos/seed/track3/400/400',
    price: 0,
    currency: 'USD',
    uploadType: 'Preview Only',
    description: 'My take on the classic, adding breakbeat flavor.',
    tags: ['electro', 'breakbeat', 'remix'],
    category: 'Remix',
    sourceSamples: [],
    comments: []
  },
  {
    title: 'Sub Frequency',
    artistName: 'Bass Architect',
    audioSrc: 'https://www2.cs.uic.edu/~i101/SoundFiles/ImperialMarch60.wav',
    coverArtUrl: 'https://picsum.photos/seed/track4/400/400',
    price: 1.99,
    currency: 'USD',
    uploadType: 'For Sale',
    description: 'Deep dubstep exploration of low-end frequencies.',
    tags: ['dubstep', 'bass', 'experimental'],
    category: 'Official Release',
    sourceSamples: [],
    comments: []
  },
  {
    title: 'Lost Groove',
    artistName: 'Vinyl Junkie',
    audioSrc: 'https://www2.cs.uic.edu/~i101/SoundFiles/CantinaBand60.wav',
    coverArtUrl: 'https://picsum.photos/seed/track5/400/400',
    price: 0,
    currency: 'USD',
    uploadType: 'Free Download',
    description: 'Rediscovered this gem from a dusty crate. Pure groove.',
    tags: ['funk', 'soul', 'breaks'],
    category: 'Bootleg',
    sourceSamples: [],
    comments: []
  }
];

const seedPosts = [
  {
    title: 'Welcome to SoundWave!',
    content: 'Excited to be part of this community. Looking forward to sharing music and connecting with fellow producers and DJs.',
    authorName: 'DJ Shadow',
    authorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=shadow',
    likes: 12,
    replyCount: 3,
    audience: 'public',
    replies: []
  },
  {
    title: 'New jungle track dropping soon',
    content: 'Been working on something special. Heavy breaks and deep bass. Who wants to hear a preview? 👀',
    authorName: 'Sub-Tropical',
    authorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=subtropical',
    likes: 24,
    replyCount: 8,
    audience: 'public',
    replies: []
  },
  {
    title: 'Looking for vocalists',
    content: 'Working on a new EP and need some vocal samples. If you sing, spit bars, or do spoken word, hit me up!',
    authorName: 'Luna Breaks',
    authorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=luna',
    likes: 15,
    replyCount: 5,
    audience: 'public',
    replies: []
  },
  {
    title: 'Best DAW for bass music?',
    content: 'Curious what everyone is using for production. I am on Ableton but thinking about trying Reaper.',
    authorName: 'Bass Architect',
    authorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bass',
    likes: 8,
    replyCount: 12,
    audience: 'public',
    replies: []
  },
  {
    title: 'Found some rare breaks',
    content: 'Just picked up a crate of 70s funk records. Some of these breaks are fire! Will be sampling these all week.',
    authorName: 'Vinyl Junkie',
    authorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vinyl',
    likes: 31,
    replyCount: 6,
    audience: 'public',
    replies: []
  }
];

const seedLabels = [
  {
    name: 'Deep Jungle Records',
    logoUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=deepjungle',
    bannerUrl: 'https://picsum.photos/seed/label1/1200/300',
    bio: 'Underground jungle and drum & bass label pushing the boundaries since 1995. Home to the finest rollers and steppers.',
    artistIds: [],
    storeLinks: [
      { name: 'Bandcamp', url: 'https://bandcamp.com', icon: 'bandcamp' },
      { name: 'Beatport', url: 'https://beatport.com', icon: 'package' }
    ],
    opportunities: [
      {
        id: 'opp1',
        title: 'Demo Submissions Open',
        type: 'Artist',
        description: 'Looking for fresh jungle talent. Send your best rollers to demos@deepjungle.com',
        comments: []
      }
    ],
    eventPhotos: [],
    theme: {
      bannerUrl: 'https://picsum.photos/seed/label1/1200/300',
      accentColor: '#00ff88'
    },
    comments: []
  },
  {
    name: 'Bass Collective',
    logoUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=basscollective',
    bannerUrl: 'https://picsum.photos/seed/label2/1200/300',
    bio: 'A community-driven label celebrating all forms of bass music. Dubstep, grime, garage, and everything in between.',
    artistIds: [],
    storeLinks: [
      { name: 'Bandcamp', url: 'https://bandcamp.com', icon: 'bandcamp' }
    ],
    opportunities: [
      {
        id: 'opp2',
        title: 'Looking for Cover Artists',
        type: 'Designer',
        description: 'Need talented visual artists for upcoming releases. Paid opportunities available.',
        comments: []
      }
    ],
    eventPhotos: [],
    theme: {
      bannerUrl: 'https://picsum.photos/seed/label2/1200/300',
      accentColor: '#ff0088'
    },
    comments: []
  },
  {
    name: 'Breakbeat Alliance',
    logoUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=breakbeat',
    bannerUrl: 'https://picsum.photos/seed/label3/1200/300',
    bio: 'Dedicated to preserving and pushing forward the art of breakbeat music. From classic breaks to modern interpretations.',
    artistIds: [],
    storeLinks: [
      { name: 'Bandcamp', url: 'https://bandcamp.com', icon: 'bandcamp' },
      { name: 'SoundCloud', url: 'https://soundcloud.com', icon: 'package' }
    ],
    opportunities: [],
    eventPhotos: [],
    theme: {
      bannerUrl: 'https://picsum.photos/seed/label3/1200/300',
      accentColor: '#ffaa00'
    },
    comments: []
  }
];

const seedMasterclasses = [
  {
    title: 'Jungle Production Masterclass',
    coverArtUrl: 'https://picsum.photos/seed/master1/400/300',
    description: 'Learn the fundamentals of jungle production from break chopping to bassline design. Includes 20+ hours of content and project files.',
    price: 49.99,
    currency: 'USD',
    durationHours: 20,
    comments: []
  },
  {
    title: 'Mixing & Mastering for Bass Music',
    coverArtUrl: 'https://picsum.photos/seed/master2/400/300',
    description: 'Professional mixing and mastering techniques specifically for bass-heavy genres. Get your tracks radio-ready.',
    price: 39.99,
    currency: 'USD',
    durationHours: 15,
    comments: []
  },
  {
    title: 'Advanced Sampling Techniques',
    coverArtUrl: 'https://picsum.photos/seed/master3/400/300',
    description: 'Deep dive into creative sampling, from finding the perfect breaks to manipulating them beyond recognition.',
    price: 29.99,
    currency: 'USD',
    durationHours: 12,
    comments: []
  }
];

const seedTutorials = [
  {
    title: 'How to Chop Breaks Like a Pro',
    thumbnailUrl: 'https://picsum.photos/seed/tut1/400/225',
    duration: '15:30',
    difficulty: 'Intermediate',
    tags: ['sampling', 'breakbeat', 'ableton'],
    comments: []
  },
  {
    title: 'Designing Sub Bass in Serum',
    thumbnailUrl: 'https://picsum.photos/seed/tut2/400/225',
    duration: '22:15',
    difficulty: 'Beginner',
    tags: ['sound-design', 'bass', 'serum'],
    comments: []
  },
  {
    title: 'Creating Atmospheric Pads',
    thumbnailUrl: 'https://picsum.photos/seed/tut3/400/225',
    duration: '18:45',
    difficulty: 'Intermediate',
    tags: ['sound-design', 'ambient', 'synthesis'],
    comments: []
  },
  {
    title: 'Jungle Arrangement Tips',
    thumbnailUrl: 'https://picsum.photos/seed/tut4/400/225',
    duration: '25:00',
    difficulty: 'Advanced',
    tags: ['arrangement', 'jungle', 'production'],
    comments: []
  }
];

const seedSamplePacks = [
  {
    title: 'Classic Breaks Collection',
    coverArtUrl: 'https://picsum.photos/seed/sample1/400/400',
    price: 19.99,
    currency: 'USD',
    tags: ['breaks', 'drums', 'vintage'],
    contains: ['50 drum breaks', '25 fills', '10 percussion loops'],
    comments: []
  },
  {
    title: 'Deep Bass Essentials',
    coverArtUrl: 'https://picsum.photos/seed/sample2/400/400',
    price: 14.99,
    currency: 'USD',
    tags: ['bass', 'sub', 'dubstep'],
    contains: ['100 bass shots', '50 sub presets', '25 bass loops'],
    comments: []
  },
  {
    title: 'Jungle FX Pack',
    coverArtUrl: 'https://picsum.photos/seed/sample3/400/400',
    price: 9.99,
    currency: 'USD',
    tags: ['fx', 'jungle', 'effects'],
    contains: ['200+ sound effects', 'Reece bass presets', 'Vocal chops'],
    comments: []
  }
];

const seedGlobalEvents = [
  {
    type: 'NEW_TRACK',
    title: 'New Release: Midnight Run',
    description: 'DJ Shadow just dropped a fresh instrumental hip-hop track',
    authorName: 'DJ Shadow',
    transform: 'translate3d(100px, 50px, 0)',
    animationDelay: '0s',
    locationName: 'San Francisco, CA',
    country: 'USA',
    groups: ['@Genre:Hip-Hop', '@Artist:DJ-Shadow'],
    influence: 85,
    comments: []
  },
  {
    type: 'NEW_TRACK',
    title: 'Jungle Storm Released',
    description: 'Sub-Tropical unleashes a heavy jungle roller',
    authorName: 'Sub-Tropical',
    transform: 'translate3d(-80px, 120px, 0)',
    animationDelay: '0.5s',
    locationName: 'London, UK',
    country: 'UK',
    groups: ['@Genre:Jungle', '@Artist:Sub-Tropical'],
    influence: 78,
    comments: []
  },
  {
    type: 'IRL_EVENT',
    title: 'Bass Collective Label Night',
    description: 'Live showcase at The Underground - February 15th',
    authorName: 'Bass Collective',
    transform: 'translate3d(50px, -100px, 0)',
    animationDelay: '1s',
    locationName: 'Berlin, Germany',
    country: 'Germany',
    groups: ['@Label:Bass-Collective', '@Event:Live'],
    influence: 92,
    comments: []
  },
  {
    type: 'NEW_PHOTO',
    title: 'Studio Setup Tour',
    description: 'Check out my new production setup',
    authorName: 'Bass Architect',
    transform: 'translate3d(-120px, -70px, 0)',
    animationDelay: '1.5s',
    locationName: 'Bristol, UK',
    country: 'UK',
    groups: ['@Topic:Studio', '@Artist:Bass-Architect'],
    influence: 65,
    comments: []
  }
];

// Main seed function
async function seedFirestore() {
  console.log('🌱 Starting Firestore seed...\n');

  try {
    // 1. Seed Users
    console.log('📝 Seeding users...');
    const userIds: string[] = [];
    for (const user of seedUsers) {
      const docRef = await addDoc(collection(db, COLLECTIONS.USERS), {
        ...user,
        createdAt: serverTimestamp()
      });
      userIds.push(docRef.id);
      console.log(`  ✓ Added user: ${user.name}`);
    }

    // 2. Seed Tracks (with artist IDs)
    console.log('\n🎵 Seeding tracks...');
    const trackIds: string[] = [];
    for (let i = 0; i < seedTracks.length; i++) {
      const track = seedTracks[i];
      const docRef = await addDoc(collection(db, COLLECTIONS.TRACKS), {
        ...track,
        artistId: userIds[i % userIds.length],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      trackIds.push(docRef.id);
      console.log(`  ✓ Added track: ${track.title}`);
    }

    // 3. Seed Posts
    console.log('\n💬 Seeding posts...');
    for (let i = 0; i < seedPosts.length; i++) {
      const post = seedPosts[i];
      await addDoc(collection(db, COLLECTIONS.POSTS), {
        ...post,
        authorId: userIds[i % userIds.length],
        createdAt: serverTimestamp()
      });
      console.log(`  ✓ Added post: ${post.title}`);
    }

    // 4. Seed Labels
    console.log('\n🏷️  Seeding labels...');
    for (const label of seedLabels) {
      await addDoc(collection(db, COLLECTIONS.LABELS), {
        ...label,
        artistIds: userIds.slice(0, 2), // Assign first 2 artists to each label
        createdAt: serverTimestamp()
      });
      console.log(`  ✓ Added label: ${label.name}`);
    }

    // 5. Seed Masterclasses
    console.log('\n🎓 Seeding masterclasses...');
    for (let i = 0; i < seedMasterclasses.length; i++) {
      const masterclass = seedMasterclasses[i];
      await addDoc(collection(db, COLLECTIONS.MASTERCLASSES), {
        ...masterclass,
        instructor: {
          id: userIds[i % userIds.length],
          name: seedUsers[i % seedUsers.length].name,
          avatarUrl: seedUsers[i % seedUsers.length].avatarUrl
        },
        createdAt: serverTimestamp()
      });
      console.log(`  ✓ Added masterclass: ${masterclass.title}`);
    }

    // 6. Seed Tutorials
    console.log('\n📹 Seeding tutorials...');
    for (let i = 0; i < seedTutorials.length; i++) {
      const tutorial = seedTutorials[i];
      await addDoc(collection(db, COLLECTIONS.TUTORIALS), {
        ...tutorial,
        instructor: {
          id: userIds[i % userIds.length],
          name: seedUsers[i % seedUsers.length].name,
          avatarUrl: seedUsers[i % seedUsers.length].avatarUrl
        },
        createdAt: serverTimestamp()
      });
      console.log(`  ✓ Added tutorial: ${tutorial.title}`);
    }

    // 7. Seed Sample Packs
    console.log('\n📦 Seeding sample packs...');
    for (let i = 0; i < seedSamplePacks.length; i++) {
      const pack = seedSamplePacks[i];
      await addDoc(collection(db, COLLECTIONS.SAMPLE_PACKS), {
        ...pack,
        creator: {
          id: userIds[i % userIds.length],
          name: seedUsers[i % seedUsers.length].name,
          avatarUrl: seedUsers[i % seedUsers.length].avatarUrl
        },
        createdAt: serverTimestamp()
      });
      console.log(`  ✓ Added sample pack: ${pack.title}`);
    }

    // 8. Seed Global Events
    console.log('\n🌍 Seeding global events...');
    for (const event of seedGlobalEvents) {
      await addDoc(collection(db, COLLECTIONS.GLOBAL_EVENTS), {
        ...event,
        createdAt: serverTimestamp()
      });
      console.log(`  ✓ Added event: ${event.title}`);
    }

    console.log('\n✅ Firestore seed complete!\n');
    console.log(`Created:
  - ${userIds.length} users
  - ${trackIds.length} tracks
  - ${seedPosts.length} posts
  - ${seedLabels.length} labels
  - ${seedMasterclasses.length} masterclasses
  - ${seedTutorials.length} tutorials
  - ${seedSamplePacks.length} sample packs
  - ${seedGlobalEvents.length} global events
`);

  } catch (error) {
    console.error('❌ Error seeding Firestore:', error);
    throw error;
  }
}

// Run the seed
seedFirestore()
  .then(() => {
    console.log('🎉 Seed completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });
