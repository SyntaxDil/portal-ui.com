import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, onAuthStateChanged, sendEmailVerification, signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const cfg = window.FIREBASE_CONFIG;
if (!cfg) console.warn('FIREBASE_CONFIG not found. Create js/firebase-config.js.');
const app = cfg ? initializeApp(cfg) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

// Where the React onboarding app is hosted. Override by setting window.PORTAL_ONBOARDING_URL before this script.
const ONBOARDING_URL = window.PORTAL_ONBOARDING_URL || 'http://localhost:3000/';

const $ = (id) => document.getElementById(id);

function toast(msg, kind = 'success') {
  const div = document.createElement('div');
  div.style.cssText = `position:fixed;top:20px;right:20px;z-index:9999;padding:12px 16px;border-radius:6px;color:#fff;` +
    (kind === 'success' ? 'background:#28a745' : 'background:#dc3545');
  div.textContent = msg;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 4000);
}

function setProfileForm(values = {}) {
  const { fullName = '', phone = '', serviceType = '' } = values || {};
  $('accFullName').value = fullName;
  $('accPhone').value = phone;
  $('accService').value = serviceType || '';
}

async function loadProfile(uid) {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data();
  // Ensure doc exists minimally
  await setDoc(ref, { uid, createdAt: serverTimestamp() }, { merge: true });
  return { uid };
}

async function saveProfile(uid) {
  const ref = doc(db, 'users', uid);
  const data = {
    fullName: $('accFullName').value.trim(),
    phone: $('accPhone').value.trim(),
    serviceType: $('accService').value || null,
    updatedAt: serverTimestamp()
  };
  await setDoc(ref, data, { merge: true });
}

document.addEventListener('DOMContentLoaded', () => {
  if (!auth || !db) return;

  const authGate = $('authGate');
  const accountSection = $('accountSection');

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      if (accountSection) accountSection.style.display = 'none';
      if (authGate) authGate.style.display = '';
      return;
    }

    if (authGate) authGate.style.display = 'none';
    if (accountSection) accountSection.style.display = '';

    $('accEmail').textContent = user.email || '';
    const badge = $('accVerified');
    if (badge) {
      badge.textContent = user.emailVerified ? 'Verified' : 'Not verified';
      badge.style.background = user.emailVerified ? '#28a745' : '#ffc107';
      badge.style.color = user.emailVerified ? '#fff' : '#222';
      badge.style.padding = '2px 6px';
      badge.style.borderRadius = '4px';
      badge.style.fontSize = '0.8rem';
    }

    // Load profile
    try {
      const profile = await loadProfile(user.uid);
      setProfileForm(profile);

      // Show onboarding banner if key onboarding fields are missing
      const needsOnboarding = !(profile.displayName && profile.handle);
      const banner = $('onboardingBanner');
      const link = $('onboardingLink');
      if (banner && link) {
        if (needsOnboarding) {
          banner.style.display = '';
          link.href = ONBOARDING_URL;
        } else {
          banner.style.display = 'none';
        }
      }
    } catch (err) {
      console.error(err);
      toast('Could not load profile', 'error');
    }

    // Wire up form
    const form = $('profileForm');
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await saveProfile(user.uid);
        toast('Profile saved');
      } catch (err) {
        console.error(err);
        toast('Save failed', 'error');
      }
    });

    // Resend verification
    $('resendVerifyBtn')?.addEventListener('click', async () => {
      try {
        await sendEmailVerification(user);
        toast('Verification email sent');
      } catch (err) {
        console.error(err);
        toast('Could not send verification email', 'error');
      }
    });

    // Sign out
    $('signOutBtn')?.addEventListener('click', async () => {
      try {
        await signOut(auth);
        toast('Signed out');
        window.location.href = '/login.html';
      } catch (err) {
        console.error(err);
        toast('Sign out failed', 'error');
      }
    });
  });
});
