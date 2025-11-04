// Copy this file to firebase-config.js and fill in your Firebase project values.
// These keys are safe to use on the client (they are not secrets),
// but only enable the services you need and secure Firestore with rules.

// How to get these values:
// 1) Go to https://console.firebase.google.com → Add project
// 2) Build → Authentication → Get started → Enable Email/Password
// 3) Build → Firestore Database → Create database (Start in production mode)
// 4) Project settings → Your apps → Web app → Register app → Copy the config

window.FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
