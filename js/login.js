import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const cfg = window.FIREBASE_CONFIG;
if (!cfg) console.warn('FIREBASE_CONFIG not found. Create js/firebase-config.js.');
const app = cfg ? initializeApp(cfg) : null;
const auth = app ? getAuth(app) : null;

function toast(msg, kind = 'success') {
  const div = document.createElement('div');
  div.style.cssText = `position:fixed;top:20px;right:20px;z-index:9999;padding:12px 16px;border-radius:6px;color:#fff;` +
    (kind === 'success' ? 'background:#28a745' : 'background:#dc3545');
  div.textContent = msg;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 4000);
}

document.addEventListener('DOMContentLoaded', () => {
  if (!auth) return;

  const loginForm = document.getElementById('loginForm');
  const forgotLink = document.getElementById('forgotLink');
  const accountSection = document.getElementById('accountSection');
  const accountDetails = document.getElementById('accountDetails');
  const signOutBtn = document.getElementById('signOutBtn');

  const setSubmitting = (submitting) => {
    const btn = loginForm?.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = submitting;
      btn.textContent = submitting ? 'Logging in…' : 'Login';
    }
  };

  onAuthStateChanged(auth, (user) => {
    if (user) {
      // Show account section
      if (accountSection) accountSection.style.display = '';
      if (loginForm) loginForm.style.display = 'none';
      if (accountDetails) {
        accountDetails.innerHTML = `
          <div><strong>Email:</strong> ${user.email || ''}</div>
          <div><strong>Email verified:</strong> ${user.emailVerified ? 'Yes' : 'No'}</div>
          <div><strong>User ID:</strong> ${user.uid}</div>
        `;
      }
    } else {
      // Show login form
      if (accountSection) accountSection.style.display = 'none';
      if (loginForm) loginForm.style.display = '';
    }
  });

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      try {
        setSubmitting(true);
        await signInWithEmailAndPassword(auth, email, password);
        toast('Logged in successfully!');
        // Optional redirect support: ?redirect=/account.html
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect');
        if (redirect) {
          window.location.href = redirect;
        }
      } catch (err) {
        console.error(err);
        let msg = 'Login failed. Check your email and password.';
        const code = err?.code || '';
        if (code.includes('auth/invalid-email')) msg = 'Please enter a valid email address.';
        if (code.includes('auth/user-not-found')) msg = 'No account with that email.';
        if (code.includes('auth/wrong-password')) msg = 'Incorrect password.';
        if (code.includes('auth/too-many-requests')) msg = 'Too many attempts. Try again later.';
        toast(msg, 'error');
      } finally {
        setSubmitting(false);
      }
    });
  }

  if (forgotLink) {
    forgotLink.addEventListener('click', async (e) => {
      e.preventDefault();
      const email = (document.getElementById('loginEmail').value || '').trim();
      if (!email) {
        toast('Enter your email first, then click “Forgot your password?”.', 'error');
        return;
      }
      try {
        await sendPasswordResetEmail(auth, email);
        toast('Password reset email sent. Check your inbox.');
      } catch (err) {
        console.error(err);
        toast('Could not send reset email. Verify the address and try again.', 'error');
      }
    });
  }

  if (signOutBtn) {
    signOutBtn.addEventListener('click', async () => {
      try {
        await signOut(auth);
        toast('Signed out.');
      } catch (err) {
        console.error(err);
        toast('Sign out failed. Try again.', 'error');
      }
    });
  }
});
