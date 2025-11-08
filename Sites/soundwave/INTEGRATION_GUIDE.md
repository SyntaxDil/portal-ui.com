# SoundWave Integration - Complete Setup Guide

## Overview

SoundWave is now fully integrated into the Portal UI ecosystem with authentication and real Firebase backend services.

## Architecture

```
Portal UI (portal-ui.com)
├── Registration System (Firebase Auth)
├── Login System (Firebase Auth)
└── SoundWave Platform
    ├── Gateway (/Sites/soundwave/index.html)
    │   ├── Auth Check
    │   ├── User Verification
    │   └── Access Control
    └── React App (/Sites/soundwave/app/)
        ├── Firebase Integration
        ├── User Profile Management
        ├── Track Upload/Management
        ├── Community Features
        └── Real-time Data Sync
```

## User Flow

### 1. New User Registration
1. User visits `portal-ui.com` (redirects to `Registration.html`)
2. User fills registration form with:
   - Email & Password
   - Full Name
   - Service preference (SoundWave)
3. Firebase Auth creates account
4. Profile stored in Firestore `users/{uid}`
5. User redirected to `/account.html`

### 2. Accessing SoundWave
1. User clicks SoundWave link or visits `/Sites/soundwave/`
2. Gateway (`/Sites/soundwave/index.html`) checks authentication:
   - **Not logged in** → Redirect to registration/login
   - **Logged in but not verified** → Request email verification
   - **Logged in & verified** → Show "Enter SoundWave" button
3. User clicks "Enter SoundWave Platform"
4. React app loads at `/Sites/soundwave/app/`
5. App initializes Firebase and creates SoundWave profile (if first time)
6. User accesses full SoundWave platform

### 3. Using SoundWave
- Upload tracks with audio files and metadata
- Create posts and interact with community
- Comment on tracks, posts, and events
- Manage profile and artist information
- Browse labels, playlists, and tutorials
- All data synced with Firebase Firestore in real-time

## Firebase Configuration

### Collections Structure

```
soundwave_users/
  {uid}/
    name, bio, avatarUrl, interview[], gallery[]

soundwave_tracks/
  {trackId}/
    title, artistId, audioSrc, coverArtUrl, price, uploadType, etc.

soundwave_posts/
  {postId}/
    title, content, authorId, createdAt, likes, replyCount

soundwave_comments/
  {commentId}/
    content, authorId, authorName, parentType, parentId, createdAt

soundwave_labels/
  {labelId}/
    name, bio, logoUrl, artistIds[], featuredReleaseId, etc.

soundwave_playlists/
  {playlistId}/
    title, curatorId, trackIds[], comments[]

soundwave_masterclasses/
  {masterclassId}/
    title, instructorId, price, durationHours, etc.

soundwave_tutorials/
  {tutorialId}/
    title, instructorId, duration, difficulty, etc.

soundwave_sample_packs/
  {packId}/
    title, creatorId, price, tags[], contains[]

soundwave_global_events/
  {eventId}/
    type, title, description, authorName, locationName, etc.
```

### Security Rules

See `Sites/soundwave---a-crowd-sourced-artist-platform/FIRESTORE_RULES.md` for complete security rules.

**Key Rules:**
- All content publicly readable for discovery
- Write operations require authentication
- Users can only edit their own content
- Private data (messages, purchases) strictly protected

## Development Workflow

### Local Development

1. **Start Portal Server:**
   ```bash
   npm start
   ```
   Opens at `http://localhost:8080`

2. **Start SoundWave Dev Server:**
   ```bash
   cd Sites/soundwave---a-crowd-sourced-artist-platform
   npm run dev
   ```
   Opens at `http://localhost:3001`

### Building SoundWave

```bash
# From project root
npm run build:soundwave

# Or from SoundWave directory
cd Sites/soundwave---a-crowd-sourced-artist-platform
npm run build
```

Builds to: `/Sites/soundwave/app/`

### Deployment to GitHub Pages

1. **Build SoundWave** (if changes made):
   ```bash
   npm run build:soundwave
   ```

2. **Commit and Push:**
   ```bash
   git add .
   git commit -m "Update SoundWave app"
   git push origin main
   ```

3. **Live in 1-2 minutes** at:
   - Portal: https://www.portal-ui.com
   - SoundWave Gateway: https://www.portal-ui.com/Sites/soundwave/
   - SoundWave App: https://www.portal-ui.com/Sites/soundwave/app/

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project: "Portal UI Production"
3. Enable **Authentication** → Email/Password
4. Enable **Firestore Database** → Production mode
5. Enable **Storage** → Default bucket

### 2. Configure Portal

Copy config to `js/firebase-config.js`:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 3. Apply Firestore Rules

1. Go to Firebase Console → Firestore → Rules
2. Copy rules from `Sites/soundwave---a-crowd-sourced-artist-platform/FIRESTORE_RULES.md`
3. Publish rules

### 4. Set Up Storage Rules

1. Go to Firebase Console → Storage → Rules
2. Apply storage rules from `FIRESTORE_RULES.md`
3. Publish rules

## Testing the Integration

### End-to-End Test Scenario

1. **Registration:**
   ```
   Visit: https://www.portal-ui.com
   → Redirects to Registration.html
   → Fill form with service: SoundWave
   → Submit → Creates Firebase Auth account
   → Verify email → Check inbox
   ```

2. **Login:**
   ```
   Visit: https://www.portal-ui.com/login.html
   → Enter credentials
   → Login → Redirected to account.html
   ```

3. **Access SoundWave:**
   ```
   Visit: https://www.portal-ui.com/Sites/soundwave/
   → Gateway checks auth → Shows welcome screen
   → Click "Enter SoundWave Platform"
   → App loads with Firebase connection
   ```

4. **Use SoundWave:**
   ```
   → Browse existing tracks (mock data initially)
   → Upload a new track
   → Create a community post
   → Add comments
   → Check profile page
   ```

### Local Testing

For local testing without deploying:

1. Start portal: `npm start`
2. Start SoundWave: `cd Sites/soundwave---a-crowd-sourced-artist-platform && npm run dev`
3. Register account on localhost:8080
4. Visit localhost:3001 to test SoundWave app

## Migration Path: Mock Data → Real Data

Currently, the app uses `mockData.ts` for development. To migrate to real Firebase data:

### Phase 1: Hybrid Mode (Current)
- `firebaseService.ts` exports both Firebase functions and mock data
- Components use mock data via existing imports
- Firebase infrastructure ready but not used

### Phase 2: Gradual Migration
Update each page/component to use Firebase:

```typescript
// Before (Mock Data)
import { getTracks } from '../services/mockData';

// After (Real Data)
import { getTracks } from '../services/firebaseService';
```

### Phase 3: Full Migration
1. Update all components to use `firebaseService`
2. Seed Firebase with initial data (optional)
3. Remove mock data imports
4. Test thoroughly
5. Deploy

## Troubleshooting

### "Authentication Required" Error
- **Cause:** User not logged in or session expired
- **Fix:** Return to portal, login again

### "Firebase Configuration Error"
- **Cause:** Missing or incorrect firebase-config.js
- **Fix:** Check `js/firebase-config.js` exists and has correct values

### Build Fails
- **Cause:** Syntax errors or missing dependencies
- **Fix:** `cd Sites/soundwave---a-crowd-sourced-artist-platform && npm install`

### App Not Loading After Deploy
- **Cause:** Build not committed or incorrect paths
- **Fix:** Run `npm run build:soundwave`, commit, push again

### Firebase Permission Denied
- **Cause:** Firestore rules not set up correctly
- **Fix:** Apply security rules from FIRESTORE_RULES.md

## Performance Considerations

### Optimization Tips

1. **Code Splitting:**
   The app is large (1MB). Consider dynamic imports for pages:
   ```typescript
   const HomePage = lazy(() => import('./pages/HomePage'));
   ```

2. **Image Optimization:**
   - Compress avatar/cover images before upload
   - Use responsive image sizes
   - Implement lazy loading for galleries

3. **Firestore Queries:**
   - Add indexes for common queries
   - Use pagination for large lists
   - Implement infinite scroll

4. **Caching:**
   - Cache user profiles in local storage
   - Implement service worker for offline support
   - Use Firebase cache for frequently accessed data

## Future Enhancements

### Planned Features

1. **Real-time Features:**
   - Live chat with Firestore listeners
   - Real-time notifications
   - Collaborative playlists

2. **Media Features:**
   - Audio file upload to Firebase Storage
   - Waveform visualization
   - Audio streaming optimization

3. **Social Features:**
   - Follow/follower system
   - Direct messaging
   - Activity feed

4. **Monetization:**
   - Stripe integration for track sales
   - Subscription tiers
   - Premium content access

5. **Admin Tools:**
   - Content moderation dashboard
   - Analytics and insights
   - User management

## Support

- **Documentation:** See `README.md` files in each directory
- **Firebase Docs:** https://firebase.google.com/docs
- **React Docs:** https://react.dev
- **Issues:** File issues on GitHub repository

---

**Status:** ✅ SoundWave Gateway and React App successfully integrated with Firebase Auth

**Next Steps:** Migrate components from mock data to Firebase services