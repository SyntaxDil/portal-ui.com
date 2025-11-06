import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const cfg = window.FIREBASE_CONFIG;
if (!cfg) {
  console.warn('FIREBASE_CONFIG not found for auth-ui');
}
const app = cfg ? initializeApp(cfg) : null;
const auth = app ? getAuth(app) : null;

function ensureContainer() {
  let el = document.getElementById('authStatus');
  if (!el) {
    const headerContainer = document.querySelector('header .container');
    el = document.createElement('div');
    el.id = 'authStatus';
    if (headerContainer) headerContainer.appendChild(el);
  }
  // Minimal inline style to keep it tidy
  if (el) {
    el.style.marginLeft = 'auto';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.gap = '8px';
    el.style.fontSize = '0.9rem';
  }
  return el;
}

function renderLoggedOut(el) {
  el.innerHTML = '';
  const login = document.createElement('a');
  login.href = '/login.html';
  login.textContent = 'Login';
  const sep = document.createElement('span');
  sep.textContent = '·';
  sep.style.opacity = '0.6';
  const reg = document.createElement('a');
  reg.href = '/Registration.html';
  reg.textContent = 'Register';
  el.append(login, sep, reg);
}

function renderLoggedIn(el, user) {
  el.innerHTML = '';
  const email = document.createElement('span');
  email.textContent = user.email || 'Signed in';
  email.style.opacity = '0.85';

  const hub = document.createElement('a');
  hub.href = '/hub.html';
  hub.textContent = 'Hub';
  hub.className = 'btn-link';

  const account = document.createElement('a');
  account.href = '/account.html';
  account.textContent = 'Account';
  account.className = 'btn-link';

  const btn = document.createElement('button');
  btn.textContent = 'Sign out';
  btn.style.padding = '6px 10px';
  btn.style.border = '1px solid #ccc';
  btn.style.background = 'transparent';
  btn.style.cursor = 'pointer';
  btn.style.borderRadius = '4px';
  btn.addEventListener('click', async () => {
    try {
      await signOut(auth);
      // If on account page, send to login
      if (location.pathname.includes('/account')) {
        location.href = '/login.html';
      }
    } catch (e) {
      console.error(e);
    }
  });

  const dot1 = document.createElement('span');
  dot1.textContent = '·';
  dot1.style.opacity = '0.6';

  const dot2 = document.createElement('span');
  dot2.textContent = '·';
  dot2.style.opacity = '0.6';

  el.append(email, dot1, hub, dot2, account, btn);
}

document.addEventListener('DOMContentLoaded', () => {
  if (!auth) return;
  const el = ensureContainer();
  onAuthStateChanged(auth, (user) => {
    if (!el) return;
    if (user) renderLoggedIn(el, user); else renderLoggedOut(el);
  });
});
