import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const cfg = window.FIREBASE_CONFIG;
if (!cfg) console.warn('FIREBASE_CONFIG not found for hub');

const app = (() => {
  if (!cfg) return null;
  const apps = getApps();
  return apps.length ? getApp() : initializeApp(cfg);
})();

const auth = app ? getAuth(app) : null;

function show(el, visible) {
  if (!el) return;
  el.style.display = visible ? '' : 'none';
}

document.addEventListener('DOMContentLoaded', () => {
  const gate = document.getElementById('hubAuthGate');
  const content = document.getElementById('hubContent');
  if (!auth) {
    show(gate, true);
    return;
  }
  onAuthStateChanged(auth, (user) => {
    const signedIn = !!user;
    show(gate, !signedIn);
    show(content, signedIn);
  });
});
