// Lightweight Firebase Ops Agent
// - Captures window errors and unhandled rejections
// - Provides healthCheck and log() helpers
// - Stores events to Firestore under apps/{appId}/ops/events
// - Falls back to localStorage queue if Firestore write fails, retries on init/auth

import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';
import { getFirestore, doc, setDoc, addDoc, collection, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js';

class FirebaseOpsAgent {
  constructor(options = {}) {
    this.appId = options.appId || (typeof window !== 'undefined' && window.__app_id) || 'default-app';
    const cfg = options.config || (typeof window !== 'undefined' && window.__firebase_config && JSON.parse(window.__firebase_config)) || (typeof window !== 'undefined' && window.FIREBASE_CONFIG) || null;
    if (!cfg) {
      console.warn('[Agent] No Firebase config found. Agent disabled.');
      return;
    }
    const app = getApps().length ? getApp() : initializeApp(cfg);
    this.auth = getAuth(app);
    this.db = getFirestore(app);
    this.queueKey = `ops_agent_queue_${this.appId}`;
    this.enabled = true;

    // Retry queued events when auth state changes or on init
    onAuthStateChanged(this.auth, () => this.flushQueue());
    this.flushQueue();

    // Global error hooks
    window.addEventListener('error', (e) => {
      this.log({ type: 'window.error', message: e.message, source: e.filename, lineno: e.lineno, colno: e.colno, stack: e.error?.stack || null });
    });
    window.addEventListener('unhandledrejection', (e) => {
      const reason = e.reason || {};
      this.log({ type: 'unhandledrejection', message: reason.message || String(reason), stack: reason.stack || null });
    });
  }

  _ns() {
    // Shared namespace to coordinate ops
    return `apps/${this.appId}`;
  }

  async healthCheck() {
    if (!this.enabled) return { ok: false, reason: 'disabled' };
    try {
      const ref = doc(this.db, `${this._ns()}/ops/_agent`);
      await setDoc(ref, { heartbeat: serverTimestamp() }, { merge: true });
      await this.log({ type: 'agent.heartbeat' });
      return { ok: true };
    } catch (e) {
      this._enqueue({ when: Date.now(), ns: this._ns(), level: 'error', type: 'agent.health.error', error: { code: e.code, message: e.message } });
      return { ok: false, code: e.code, message: e.message };
    }
  }

  async log(event) {
    if (!this.enabled) return;
    const payload = {
      when: Date.now(),
      ns: this._ns(),
      uid: this.auth?.currentUser?.uid || null,
      level: event.level || 'info',
      ...event,
    };
    try {
      const ref = collection(this.db, `${this._ns()}/ops/events`);
      await addDoc(ref, payload);
    } catch (e) {
      // Queue locally for retry
      payload.error = { code: e.code, message: e.message };
      this._enqueue(payload);
    }
  }

  _enqueue(evt) {
    try {
      const arr = JSON.parse(localStorage.getItem(this.queueKey) || '[]');
      arr.push(evt);
      localStorage.setItem(this.queueKey, JSON.stringify(arr).slice(0, 200000)); // guard size
    } catch (_) {}
  }

  async flushQueue() {
    if (!this.enabled) return;
    try {
      const raw = localStorage.getItem(this.queueKey);
      if (!raw) return;
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr) || arr.length === 0) return;
      const ref = collection(this.db, `${this._ns()}/ops/events`);
      for (const evt of arr.slice(0, 50)) {
        try { await addDoc(ref, evt); } catch (_) { break; }
      }
      localStorage.removeItem(this.queueKey);
    } catch (_) {}
  }
}

// Expose singleton
if (typeof window !== 'undefined') {
  window.firebaseOpsAgent = new FirebaseOpsAgent();
}

export default FirebaseOpsAgent;
