// Handles real user registration using Firebase Auth + Firestore
// Requires js/firebase-config.js to set window.FIREBASE_CONFIG

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, doc, setDoc, serverTimestamp, collection, query, where, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const cfg = window.FIREBASE_CONFIG;
if (!cfg) {
  console.warn("FIREBASE_CONFIG not found. Copy js/firebase-config.example.js to js/firebase-config.js and fill values.");
}

const app = cfg ? initializeApp(cfg) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

function setSubmitting(form, submitting) {
  const btn = form.querySelector('button[type="submit"]');
  if (btn) {
    btn.disabled = submitting;
    btn.textContent = submitting ? 'Registering…' : 'Register Now';
  }
}

function toast(msg, kind = 'success') {
  const div = document.createElement('div');
  div.style.cssText = `position:fixed;top:20px;right:20px;z-index:9999;padding:12px 16px;border-radius:6px;color:#fff;` +
    (kind === 'success' ? 'background:#28a745' : 'background:#dc3545');
  div.textContent = msg;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 4000);
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registrationForm');
  if (!form || !auth || !db) return;

  form.addEventListener('submit', async (e) => {
    // Let existing validators run first; bail if they prevented default earlier
    // We always prevent default here to handle via JS
    e.preventDefault();

    // Simple double-check for password match (keeps inline validator behavior consistent)
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    if (password !== confirmPassword) {
      toast('Passwords do not match', 'error');
      return;
    }

    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const serviceType = document.getElementById('serviceType').value;
    const djName = document.getElementById('djName')?.value?.trim() || null;

    try {
      setSubmitting(form, true);

      // Create auth user
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // Store profile document
      await setDoc(doc(db, 'users', cred.user.uid), {
        uid: cred.user.uid,
        fullName,
        email,
        phone,
        serviceType: serviceType || null,
        djName: djName,
        createdAt: serverTimestamp()
      });

      // If this is a DJ invite (djName provided), link the DJ profile
      if (djName) {
        try {
          const djsRef = collection(db, 'apps/temple-djs/djs');
          const q = query(djsRef, where('djName', '==', djName));
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            const djDoc = snapshot.docs[0];
            await updateDoc(doc(db, `apps/temple-djs/djs/${djDoc.id}`), {
              uid: cred.user.uid,
              email: email,
              inviteStatus: 'confirmed',
              confirmedAt: new Date().toISOString()
            });
            console.log('DJ profile linked and confirmed:', djDoc.id);
          }
        } catch (linkErr) {
          console.warn('Failed to link DJ profile:', linkErr);
        }
      }

      // Best-effort: send verification email
      try { await sendEmailVerification(cred.user); } catch (_) {}

      toast('Registration successful! Check your email for verification.');
      form.reset();
      // Redirect to DJ Dashboard if DJ, otherwise Hub
      setTimeout(() => {
        window.location.href = djName ? '/dj-dashboard.html' : '/hub.html';
      }, 1200);
    } catch (err) {
      console.error(err);
      const code = err?.code || '';
      let msg = 'Registration failed. Please try again.';
      if (code.includes('auth/email-already-in-use')) msg = 'This email is already registered.';
      if (code.includes('auth/invalid-email')) msg = 'Please enter a valid email address.';
      if (code.includes('auth/weak-password')) msg = 'Password should be at least 6 characters.';
      toast(msg, 'error');
    } finally {
      setSubmitting(form, false);
    }
  });
});
