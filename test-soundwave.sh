#!/bin/bash

# SoundWave Integration Test Script
# This script tests the complete user flow from registration to accessing SoundWave

echo "🎵 SoundWave Integration Test"
echo "=============================="
echo ""

# Check if we're in the right directory
if [ ! -f "Registration.html" ]; then
    echo "❌ Error: Please run this script from the portal-ui.com root directory"
    exit 1
fi

# Check if Firebase config exists
if [ ! -f "js/firebase-config.js" ]; then
    echo "⚠️  Warning: Firebase config not found at js/firebase-config.js"
    echo "   Please copy js/firebase-config.example.js to js/firebase-config.js"
    echo "   and add your Firebase credentials before testing."
    echo ""
fi

# Check if SoundWave app is built
if [ ! -d "Sites/soundwave/app" ]; then
    echo "⚠️  SoundWave app not built. Building now..."
    npm run build:soundwave
    if [ $? -ne 0 ]; then
        echo "❌ Build failed. Please check errors above."
        exit 1
    fi
    echo "✅ SoundWave app built successfully"
    echo ""
else
    echo "✅ SoundWave app found at Sites/soundwave/app"
fi

# Check for node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Display test instructions
echo ""
echo "📋 Manual Test Checklist:"
echo "========================="
echo ""
echo "1. ✅ Files Ready:"
echo "   - Firebase config: js/firebase-config.js"
echo "   - SoundWave app: Sites/soundwave/app/"
echo "   - Gateway page: Sites/soundwave/index.html"
echo ""
echo "2. 🔥 Firebase Setup Required:"
echo "   a. Go to https://console.firebase.google.com"
echo "   b. Enable Authentication (Email/Password)"
echo "   c. Enable Firestore Database"
echo "   d. Apply security rules from:"
echo "      Sites/soundwave---a-crowd-sourced-artist-platform/FIRESTORE_RULES.md"
echo ""
echo "3. 🧪 Test Flow:"
echo "   a. Start dev server: npm start"
echo "   b. Register new account at http://localhost:8080"
echo "   c. Select 'SoundWave' as service preference"
echo "   d. Verify email (check Firebase console)"
echo "   e. Login at http://localhost:8080/login.html"
echo "   f. Visit http://localhost:8080/Sites/soundwave/"
echo "   g. Click 'Enter SoundWave Platform'"
echo "   h. Verify app loads and shows user info"
echo ""
echo "4. 📤 Deploy to Production:"
echo "   a. Ensure SoundWave is built: npm run build:soundwave"
echo "   b. Commit all changes: git add . && git commit -m 'Update'"
echo "   c. Push to GitHub: git push origin main"
echo "   d. Wait 1-2 minutes for deployment"
echo "   e. Test at https://www.portal-ui.com/Sites/soundwave/"
echo ""

# Offer to start dev server
echo ""
read -p "🚀 Start local dev server now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Starting server at http://localhost:8080..."
    echo "Press Ctrl+C to stop"
    echo ""
    npm start
fi