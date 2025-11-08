# Portal UI Website - GitHub Pages Deployment

> **Live Site**: https://www.portal-ui.com

Professional website with Registration landing page, deployed via GitHub Pages with Firebase Authentication and Firestore integration.

## 🌐 Project Overview

- **Landing Page**: `Registration.html`
- **Technology Stack**: HTML5, CSS3, JavaScript, Firebase (Auth + Firestore)
- **Hosting**: GitHub Pages with custom domain (www.portal-ui.com)
- **Development Server**: live-server for local testing
- **Deployment**: Automatic via GitHub Pages on push to main branch

## 📁 Project Structure

```
Portal-ui.com/
├── .github/
│   └── copilot-instructions.md    # Copilot configuration
├── css/
│   └── styles.css                 # Main stylesheet
├── js/
│   ├── auth.js                    # Firebase Authentication
│   ├── auth-ui.js                 # Auth UI components
│   ├── firebase-config.js         # Firebase configuration
│   └── main.js                    # Main JavaScript functionality
├── Sites/                         # Sub-sites and applications
│   ├── JackedDnb/                 # JackedDnb site
│   ├── soundwave/                 # SoundWave Platform (NEW!)
│   │   ├── index.html             # Auth gateway
│   │   ├── app/                   # Built React app
│   │   └── INTEGRATION_GUIDE.md   # Complete setup guide
│   ├── soundwave---a-crowd-sourced-artist-platform/  # Source code
│   └── TempleDjSpot/              # Temple DJ Spot app
├── Spaces/
│   └── TempleDjs/                 # Temple DJs space
├── .nojekyll                      # GitHub Pages Jekyll bypass
├── CNAME                          # Custom domain configuration
├── index.html                     # Root redirect to Registration.html
├── Registration.html              # Main landing page
├── login.html                     # User login page
├── account.html                   # User account management
├── hub.html                       # Portal hub
└── README.md                      # This file
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase (Required for Registration/Login)

Copy the Firebase configuration template:

```bash
cp js/firebase-config.example.js js/firebase-config.js
```

Edit `js/firebase-config.js` with your Firebase project credentials.

### 3. Local Development

Start a local development server:

```bash
npm start
```

This opens your browser at `http://localhost:8080` with the Registration page.

### 4. Deploy to Production

The site automatically deploys to GitHub Pages when you push to the main branch:

```bash
git add .
git commit -m "Update site"
git push origin main
```

**Live URL**: https://www.portal-ui.com

## 🔐 Firebase Authentication Setup

Turn the static registration form into a working system that creates accounts and stores user profiles.

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com) → Add project
2. **Authentication**: Enable Email/Password provider
3. **Firestore Database**: Create database (start in production mode)
4. **Project Settings**: Copy the web app configuration

### 2. Configure the Site

Edit `js/firebase-config.js` and replace placeholders with your Firebase config values:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 3. Secure Firestore

In Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

### 4. Test Locally

```bash
npm start
```

Fill the registration form at `http://localhost:8080/Registration.html`. You should see:
- New user in Firebase Authentication → Users
- Profile document in Firestore → `users/{uid}`

## 🌐 Current Deployment: GitHub Pages

This site is **already live** and deployed via GitHub Pages.

### ✅ Configuration (Already Set Up)

1. **GitHub Pages**: Auto-deploys from `main` branch
2. **Custom Domain**: `CNAME` file → `www.portal-ui.com`
3. **Root Redirect**: `index.html` → `Registration.html`
4. **Jekyll Bypass**: `.nojekyll` file for static serving
5. **DNS**: Domain configured with proper A/CNAME records
6. **HTTPS**: Automatically enabled

### 🚀 Making Updates

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Changes appear at https://www.portal-ui.com within 1-2 minutes.

## 🔑 User Authentication Flow

### Registration (`Registration.html`)
- Email/password registration with Firebase Auth
- Profile data stored in Firestore (`users/{uid}`)
- DJ invite system with pre-filled forms
- Service selection (DropFm, JackedDnb, SoundWave, etc.)
- Automatic redirect to account page after registration

### Login (`login.html`)
- Email/password authentication
- Password reset functionality  
- Persistent auth state management
- Redirect to account page when logged in

### Account Management (`account.html`)
- Protected page (requires authentication)
- Profile editing (name, phone, service preferences)
- Email verification management
- Sign out functionality

## 🎯 Portal Services

The registration form supports multiple integrated services:

- **DropFm**: Music streaming and distribution
- **JackedDnb**: Drum & Bass community and events  
- **Kaitaiki Recordings**: Record label
- **SoundWave**: 🆕 **Fully Integrated!** Crowd-sourced artist platform with:
  - Track upload and management
  - Community posts and discussions
  - Artist profiles and labels
  - Masterclasses and tutorials
  - Real-time Firebase backend
  - [Complete Integration Guide](/Sites/soundwave/INTEGRATION_GUIDE.md)
- **TempleDjSpot**: DJ booking and management

### 🎵 SoundWave Platform

SoundWave is a fully-featured music platform integrated with Portal UI authentication:

**Features:**
- ✅ Authentication-gated access
- ✅ Firebase Auth integration  
- ✅ Real-time Firestore database
- ✅ File upload to Firebase Storage
- ✅ React/TypeScript frontend
- ✅ Community features (posts, comments, likes)
- ✅ Artist profiles and track management
- ✅ Label pages and curated content
- ✅ Educational content (masterclasses, tutorials)

**Access Flow:**
1. Register/Login at portal-ui.com
2. Visit `/Sites/soundwave/` 
3. Authenticate at gateway
4. Enter full React application

**Documentation:** See `/Sites/soundwave/INTEGRATION_GUIDE.md`

Each service has its own sub-site under `/Sites/` or `/Spaces/`.

## 🛠️ Development Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start local development server |
| `npm run serve` | Same as npm start |
| `npm run build:soundwave` | Build SoundWave React app for production |
| `npm run deploy` | Legacy FTP deploy (not used) |
| `npm run build` | No build needed (static site) |

### Building SoundWave

If you make changes to the SoundWave React app:

```bash
# Build from project root
npm run build:soundwave

# Or build from SoundWave directory
cd Sites/soundwave---a-crowd-sourced-artist-platform
npm run build
```

Output goes to: `/Sites/soundwave/app/`

Then commit and push to deploy via GitHub Pages.

## 🎨 Customization

### Update Branding

1. **Logo**: Replace "Portal UI" in header
2. **Colors**: Edit CSS variables in `css/styles.css`
3. **Favicon**: Add to `images/favicon.ico`

### Add New Pages

1. Create HTML file (e.g., `about.html`)
2. Copy structure from existing pages
3. Update navigation links
4. Push to GitHub (auto-deploys)

### Add New Services

1. Create service directory under `Sites/` or `Spaces/`
2. Add service option to registration form
3. Update service links in JavaScript

## 🔐 Security Best Practices

1. **Firebase Rules**: Secure Firestore with proper access rules
2. **HTTPS**: Automatically enabled by GitHub Pages
3. **Client-side Config**: Firebase keys are safe to expose (security enforced server-side)
4. **Email Verification**: Built into Firebase Auth
5. **reCAPTCHA**: Add to Firebase Auth for abuse prevention

## 🐛 Troubleshooting

### Firebase Not Working
- ✅ Check `js/firebase-config.js` exists and has correct values
- ✅ Verify Firebase project has Auth and Firestore enabled
- ✅ Check browser console for errors

### Site Not Updating
- ✅ Push changes to `main` branch on GitHub
- ✅ Check GitHub Actions tab for deployment status
- ✅ Clear browser cache
- ✅ Verify changes pushed successfully

### Authentication Issues
- ✅ Check Firebase Auth configuration
- ✅ Verify Firestore security rules
- ✅ Test locally with `npm start`
- ✅ Check browser console for errors

## 📞 Support

- **GitHub Issues**: [Create an issue](https://github.com/SyntaxDil/portal-ui.com/issues)
- **Firebase Documentation**: [Firebase Docs](https://firebase.google.com/docs)
- **GitHub Pages**: [GitHub Pages Docs](https://docs.github.com/en/pages)

## 📄 License

MIT License - Feel free to use and modify for your projects.

## 🎯 Next Steps

1. ✅ Customize branding and content
2. ✅ Configure Firebase for your project
3. ✅ Test registration and login locally
4. ✅ Add new services or features
5. ✅ Push changes to deploy automatically
6. ✅ Monitor usage and user feedback

---

**Live Site**: https://www.portal-ui.com 🚀