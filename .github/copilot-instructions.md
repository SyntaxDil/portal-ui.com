# Portal UI Website - Copilot Instructions

## Project Overview
This is a professional website project deployed via GitHub Pages with custom domain.
- Main landing page: Registration.html
- Technology: HTML/CSS/JavaScript + Firebase (Auth + Firestore)
- Deployment: GitHub Pages (automatic on push to main)
- Live URL: https://www.portal-ui.com
- Firebase Project: portal-ui-1eac6 (Portal-UI)

## Project Structure
- `/` - Root directory
- `/css/` - Stylesheets
- `/js/` - JavaScript files (including firebase-config.js)
- `/images/` - Image assets
- `Registration.html` - Main landing page
- `firestore.rules` - Firestore security rules
- `.firebaserc` - Firebase project configuration
- `firebase.json` - Firebase CLI configuration
- `/Sites/` - Sub-applications and projects
  - `/Sites/soundwave/` - SoundWave music platform
    - `index.html` - Authentication gateway
    - `/app/` - Built React app (production)
  - `/Sites/soundwave---a-crowd-sourced-artist-platform/` - SoundWave source code
    - Vite + React + TypeScript app
    - Build output: `/Sites/soundwave/app/`

## Firebase Architecture
### Authentication
- Email/Password authentication enabled
- Auth state managed via Firebase SDK
- User sessions persist across portal apps

### Firestore Collections
**Portal Collections:**
- `users/{userId}/apps/{appId}` - Private user app data
- `apps/{appId}` - Shared app data

**SoundWave Collections:**
- `soundwave_users` - User profiles (public read, auth write)
- `tracks` - Music tracks (public read, auth write, owner edit)
- `posts` - Community posts (public read, auth write, owner edit)
- `comments` - Track/post comments (public read, auth write, owner delete)
- `labels` - Record labels (public read, auth write, owner edit)
- `playlists` - User playlists (public read, auth write, owner edit)
- `masterclasses` - Educational content (public read, auth write)
- `tutorials` - Tutorial videos (public read, auth write)
- `sample_packs` - Sample libraries (public read, auth write)
- `global_events` - Live events (public read, auth write)

### Security Rules
All Firestore security rules are version-controlled in `firestore.rules` and deployed via Firebase CLI.

## Development Workflow for New Sites/Features

### 1. Planning Phase
- Define feature requirements and user flows
- Design Firestore data model (collections, documents, fields)
- Document security rules requirements
- Plan authentication requirements

### 2. Development Phase
**For React/Vite Applications:**
```bash
# Navigate to source directory
cd Sites/<app-name>/

# Install dependencies
npm install

# Configure Vite build output
# Edit vite.config.ts:
# - base: '/Sites/<app-name>/app/'
# - build.outDir: '../<app-name>/app'

# Develop with hot reload
npm run dev

# Build for production
npm run build
```

**For Firebase Integration:**
1. Create/update service layer (e.g., `services/firebaseService.ts`)
2. Import Firebase config from `/js/firebase-config.js`
3. Initialize Firebase services (auth, firestore, storage)
4. Implement CRUD operations for all collections
5. Add user initialization logic in app entry point

**For Authentication Gateway:**
1. Create `index.html` in site root (e.g., `/Sites/<app-name>/index.html`)
2. Implement Firebase auth state listener
3. Show authenticated/non-authenticated states
4. Redirect to registration if not logged in
5. Redirect to `/app/index.html` for authenticated users

### 3. Security Configuration
**Update Firestore Rules:**
```bash
# Edit firestore.rules file
# Add new collections with appropriate security:
# - Public read: allow read: if true;
# - Authenticated write: allow write: if request.auth != null;
# - Owner-only: allow update, delete: if request.auth.uid == resource.data.userId;

# Test rules locally (optional)
firebase emulators:start --only firestore

# Deploy rules to Firebase
firebase deploy --only firestore:rules
```

### 4. Build & Deploy
```bash
# Build React app (if applicable)
cd Sites/<app-source-directory>/
npm run build

# Verify build output
ls -la ../destination/app/

# Stage all changes
git add .

# Commit with descriptive message
git commit -m "Add <feature-name> with Firebase integration"

# Push to GitHub Pages
git push origin main

# Verify deployment (wait 1-2 minutes)
# Visit: https://www.portal-ui.com/Sites/<app-name>/
```

### 5. Testing & Verification
- Test authentication flow (logged out → redirect to registration)
- Test authenticated access (logged in → access app)
- Verify Firestore read/write operations
- Check browser console for errors
- Test on multiple devices/browsers
- Verify Firebase usage metrics in console

## Firebase CLI Commands
```bash
# Initial setup (one-time)
npm install -g firebase-tools
firebase login --no-localhost  # For codespaces/remote environments

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy all Firebase services
firebase deploy

# Check deployment status
firebase projects:list

# View project info
firebase use
```

## Development Guidelines
- Keep code clean and well-commented
- Use responsive design principles
- Optimize images before deployment
- Test locally before deploying to production
- Follow modern web standards
- **Always update firestore.rules when adding new collections**
- **Always build React apps before committing**
- **Always test authentication flows before deployment**
- **Version control all Firebase configuration files**

## Deployment Checklist
- [ ] React app built with production optimization (`npm run build`)
- [ ] Firestore rules updated for new collections
- [ ] Firestore rules deployed (`firebase deploy --only firestore:rules`)
- [ ] Authentication gateway tested (redirect logic)
- [ ] All files staged and committed to git
- [ ] Changes pushed to GitHub (`git push origin main`)
- [ ] Production URL tested after 1-2 minutes
- [ ] Browser console checked for errors
- [ ] Firebase console checked for activity

## Common Patterns
### Authentication Check
```javascript
import { auth } from './firebase-config.js';
import { onAuthStateChanged } from 'firebase/auth';

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    showAuthenticatedContent();
  } else {
    // Redirect to registration
    window.location.href = '/Registration.html';
  }
});
```

### Firestore CRUD Operations
```typescript
// In services/firebaseService.ts
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';

// Create
await addDoc(collection(db, 'collectionName'), data);

// Read
const snapshot = await getDocs(collection(db, 'collectionName'));
const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

// Update
await updateDoc(doc(db, 'collectionName', id), updates);

// Delete
await deleteDoc(doc(db, 'collectionName', id));
```

## Troubleshooting
- **Build errors**: Check Vite config paths, ensure all dependencies installed
- **Firebase auth errors**: Verify firebase-config.js has correct credentials
- **Firestore permission denied**: Update and deploy firestore.rules
- **Assets not loading**: Check Vite base path matches GitHub Pages URL structure
- **Login issues in codespace**: Use `firebase login --no-localhost`
