# SoundWave Pre-Production Checklist

Before deploying SoundWave to production at https://www.portal-ui.com, complete these steps:

## ✅ Pre-Deployment Checklist

### 1. Firebase Project Setup

- [ ] **Create Firebase Project**
  - Go to https://console.firebase.google.com
  - Click "Add Project"
  - Name: "Portal UI Production" (or your preferred name)
  - Enable Google Analytics (optional)
  - Create project

- [ ] **Enable Authentication**
  - Navigate to: Build → Authentication → Get Started
  - Click "Email/Password" → Enable
  - Save changes

- [ ] **Create Firestore Database**
  - Navigate to: Build → Firestore Database → Create Database
  - Start in "Production mode"
  - Choose location (preferably close to your users)
  - Create database

- [ ] **Enable Storage**
  - Navigate to: Build → Storage → Get Started
  - Start in "Production mode"
  - Use default bucket name
  - Create storage

### 2. Firebase Configuration

- [ ] **Get Firebase Config**
  - Project Settings → General → Your Apps
  - Click "Add app" → Web (</>)
  - Register app name: "Portal UI"
  - Copy the firebaseConfig object

- [ ] **Update Portal Config**
  ```bash
  # If firebase-config.js doesn't exist yet
  cp js/firebase-config.example.js js/firebase-config.js
  
  # Edit js/firebase-config.js with your actual values
  ```
  
  Replace these values:
  ```javascript
  const firebaseConfig = {
    apiKey: "YOUR-ACTUAL-API-KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-actual-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "YOUR-SENDER-ID",
    appId: "YOUR-APP-ID"
  };
  ```

### 3. Security Rules

- [ ] **Apply Firestore Rules**
  1. Open: `Sites/soundwave---a-crowd-sourced-artist-platform/FIRESTORE_RULES.md`
  2. Copy the Firestore rules section
  3. Firebase Console → Firestore → Rules
  4. Paste the rules
  5. Click "Publish"

- [ ] **Apply Storage Rules**
  1. Open: `Sites/soundwave---a-crowd-sourced-artist-platform/FIRESTORE_RULES.md`
  2. Copy the Storage rules section
  3. Firebase Console → Storage → Rules
  4. Paste the rules
  5. Click "Publish"

### 4. Build and Test Locally

- [ ] **Install Dependencies**
  ```bash
  # Install portal dependencies
  npm install
  
  # Install SoundWave dependencies
  cd Sites/soundwave---a-crowd-sourced-artist-platform
  npm install
  cd ../..
  ```

- [ ] **Build SoundWave App**
  ```bash
  npm run build:soundwave
  ```
  
  Verify output:
  - [ ] `Sites/soundwave/app/index.html` exists
  - [ ] `Sites/soundwave/app/assets/` contains JS bundle
  - [ ] No build errors

- [ ] **Test Locally**
  ```bash
  npm start
  ```
  
  Test these flows:
  - [ ] Visit http://localhost:8080 → redirects to Registration.html
  - [ ] Register new account with email/password
  - [ ] Check Firebase Console → Authentication → Users (new user appears)
  - [ ] Check email for verification link
  - [ ] Click verification link
  - [ ] Login at http://localhost:8080/login.html
  - [ ] Visit http://localhost:8080/Sites/soundwave/
  - [ ] Gateway shows welcome screen
  - [ ] Click "Enter SoundWave Platform"
  - [ ] App loads and shows user info
  - [ ] Check Firebase Console → Firestore → soundwave_users (profile created)

### 5. Domain and DNS

- [ ] **Verify DNS Configuration**
  - CNAME record: `www` → `syntaxdil.github.io`
  - A records for `@`:
    - 185.199.108.153
    - 185.199.109.153
    - 185.199.110.153
    - 185.199.111.153

- [ ] **Verify CNAME File**
  - File: `CNAME` at root
  - Contains: `www.portal-ui.com`

- [ ] **GitHub Pages Settings**
  - Repo → Settings → Pages
  - Source: "Deploy from a branch"
  - Branch: `main`, folder: `/ (root)`
  - Custom domain: `www.portal-ui.com`
  - Enforce HTTPS: ✅ Checked

### 6. Commit and Deploy

- [ ] **Stage All Changes**
  ```bash
  git add .
  ```

- [ ] **Verify Changed Files**
  ```bash
  git status
  ```
  
  Should include:
  - `js/firebase-config.js` (with real config)
  - `Sites/soundwave/app/` (built app)
  - Any documentation updates

- [ ] **Commit Changes**
  ```bash
  git commit -m "Deploy SoundWave with Firebase integration"
  ```

- [ ] **Push to GitHub**
  ```bash
  git push origin main
  ```

### 7. Post-Deployment Verification

Wait 1-2 minutes for GitHub Pages to rebuild, then test:

- [ ] **Portal Access**
  - Visit https://www.portal-ui.com
  - Verify redirect to Registration.html
  - Check HTTPS is working (green lock icon)

- [ ] **Registration Flow**
  - Register a new test account
  - Select "SoundWave" service
  - Check Firebase Console for new user
  - Verify email sent

- [ ] **Login Flow**
  - Login with test account
  - Verify redirect to account page
  - Check user info displays correctly

- [ ] **SoundWave Access**
  - Visit https://www.portal-ui.com/Sites/soundwave/
  - Verify gateway page loads
  - Check auth state detected correctly
  - Click "Enter SoundWave Platform"
  - Verify React app loads
  - Check console for errors (F12)
  - Verify Firebase connection successful

- [ ] **SoundWave Features**
  - Browse home page
  - Navigate to different pages
  - Check audio player loads
  - Verify global chat appears
  - Test creating a post (if migrated from mock data)
  - Test commenting (if migrated from mock data)

### 8. Monitoring and Maintenance

- [ ] **Set Up Firebase Quotas**
  - Firebase Console → Usage and billing
  - Review free tier limits
  - Set up billing alerts (optional)

- [ ] **Monitor Authentication**
  - Check user sign-ups
  - Review authentication logs
  - Monitor for suspicious activity

- [ ] **Monitor Firestore**
  - Review document counts
  - Check read/write operations
  - Set up usage alerts

- [ ] **Monitor Storage**
  - Check file upload sizes
  - Review storage usage
  - Set up storage alerts

### 9. Documentation

- [ ] **Update README.md**
  - Add production URLs
  - Document Firebase setup process
  - Add troubleshooting section

- [ ] **Team Handoff** (if applicable)
  - Share Firebase Console access
  - Document deployment process
  - Provide admin credentials securely

- [ ] **Create Backup**
  - Export Firestore data (optional)
  - Document Firebase project settings
  - Save configuration files

## ⚠️ Important Security Notes

### DO:
- ✅ Use strong passwords for admin accounts
- ✅ Enable 2FA on Firebase Console
- ✅ Review and audit security rules regularly
- ✅ Monitor authentication logs
- ✅ Keep dependencies updated

### DON'T:
- ❌ Commit Firebase private keys to Git
- ❌ Share Firebase admin credentials publicly
- ❌ Disable email verification
- ❌ Allow anonymous access without proper rules
- ❌ Ignore Firebase security alerts

## 🚨 Troubleshooting

### Issue: Firebase Configuration Error
**Solution:** Verify `js/firebase-config.js` has correct values and is committed

### Issue: Authentication Not Working
**Solution:** 
1. Check Firebase Auth is enabled
2. Verify email/password provider is active
3. Check browser console for errors

### Issue: SoundWave App Not Loading
**Solution:**
1. Verify build completed: `npm run build:soundwave`
2. Check `Sites/soundwave/app/` exists
3. Verify paths in `vite.config.ts`
4. Check browser console for 404 errors

### Issue: Permission Denied Errors
**Solution:**
1. Verify Firestore rules are applied
2. Check user is authenticated
3. Review rule logic in Firebase Console

### Issue: Images/Audio Not Loading
**Solution:**
1. Verify Storage rules are applied
2. Check file paths are correct
3. Verify files uploaded successfully
4. Check CORS settings in Storage

## 📞 Support Resources

- **Firebase Console:** https://console.firebase.google.com
- **Firebase Docs:** https://firebase.google.com/docs
- **GitHub Pages:** https://docs.github.com/en/pages
- **Project README:** /README.md
- **Integration Guide:** /Sites/soundwave/INTEGRATION_GUIDE.md

## ✨ Success!

When all items are checked, your SoundWave platform is:
- ✅ Fully integrated with Portal UI
- ✅ Using real Firebase backend
- ✅ Deployed to production
- ✅ Secured with proper rules
- ✅ Monitored and maintained

**Status:** Ready for users! 🎉

---

**Last Updated:** November 7, 2025
**Version:** 1.0.0