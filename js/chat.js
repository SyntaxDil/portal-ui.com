import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const cfg = window.FIREBASE_CONFIG;
let app = null;
let auth = null;
let db = null;

function ensureFirebase() {
  if (!cfg) return null;
  const apps = getApps();
  app = apps.length ? getApp() : initializeApp(cfg);
  auth = getAuth(app);
  db = getFirestore(app);
  return { app, auth, db };
}

function show(el, visible) { if (el) el.style.display = visible ? '' : 'none'; }

function renderMessages(listEl, msgs) {
  if (!listEl) return;
  listEl.innerHTML = '';
  if (!msgs.length) {
    const empty = document.createElement('div');
    empty.style.color = '#9ca3af';
    empty.style.fontSize = '14px';
    empty.textContent = 'No messages yet. Say hi!';
    listEl.appendChild(empty);
    return;
  }
  msgs.forEach(m => {
    const line = document.createElement('div');
    line.style.fontSize = '14px';
    const who = document.createElement('span');
    who.style.color = '#93c5fd';
    who.textContent = (m.email || (m.uid || '').slice(0, 6)) + ': ';
    const text = document.createElement('span');
    text.style.color = '#e5e7eb';
    text.textContent = m.text;
    line.appendChild(who);
    line.appendChild(text);
    listEl.appendChild(line);
  });
  listEl.scrollTop = listEl.scrollHeight;
}

function startPresence(user) {
  if (!db || !user) return () => {};
  const presRef = doc(db, `apps/_global/presence/${user.uid}`);
  const payload = {
    uid: user.uid,
    email: user.email || null,
    displayName: user.displayName || null,
    lastSeen: serverTimestamp(),
  };
  setDoc(presRef, payload, { merge: true }).catch(() => {});
  const interval = setInterval(() => {
    setDoc(presRef, { lastSeen: serverTimestamp() }, { merge: true }).catch(() => {});
  }, 25000);
  const onVis = () => setDoc(presRef, { lastSeen: serverTimestamp() }, { merge: true }).catch(() => {});
  document.addEventListener('visibilitychange', onVis);
  window.addEventListener('beforeunload', onVis);
  return () => {
    clearInterval(interval);
    document.removeEventListener('visibilitychange', onVis);
    window.removeEventListener('beforeunload', onVis);
  };
}

function startOnlineCount(user, onlineEl) {
  if (!db) return () => {};
  const q = query(collection(db, 'apps/_global/presence'));
  const unsub = onSnapshot(q, (snap) => {
    const now = Date.now();
    let count = 0;
    snap.forEach(d => {
      const data = d.data();
      const ts = data.lastSeen && data.lastSeen.toMillis ? data.lastSeen.toMillis() : 0;
      if (ts && (now - ts) < 60000) count += 1; // seen within 60s
    });
    if (onlineEl) onlineEl.textContent = `Online: ${count}`;
  });
  return () => unsub();
}

function startChat(user) {
  const section = document.getElementById('hubChatSection');
  const listEl = document.getElementById('hubChatList');
  const form = document.getElementById('hubChatForm');
  const input = document.getElementById('hubChatInput');
  const onlineEl = document.getElementById('hubChatOnline');
  if (!section || !form || !input) return () => {};

  show(section, true);

  // Messages listener
  const msgsQ = query(
    collection(db, 'apps/_global/chat/messages'),
    orderBy('createdAt', 'asc'),
    limit(200)
  );
  const unsubMsgs = onSnapshot(msgsQ, (snap) => {
    const arr = [];
    snap.forEach(doc => arr.push({ id: doc.id, ...doc.data() }));
    renderMessages(listEl, arr);
  });

  // Presence
  const stopPresence = startPresence(user);
  const stopOnline = startOnlineCount(user, onlineEl);

  // Send handler
  const onSubmit = async (e) => {
    e.preventDefault();
    const t = input.value.trim();
    if (!t) return;
    try {
      await addDoc(collection(db, 'apps/_global/chat/messages'), {
        uid: user.uid,
        email: user.email || null,
        text: t,
        createdAt: serverTimestamp(),
      });
      input.value = '';
    } catch (e) {
      console.warn('chat send failed', e);
    }
  };
  form.addEventListener('submit', onSubmit);

  return () => {
    unsubMsgs && unsubMsgs();
    stopPresence && stopPresence();
    stopOnline && stopOnline();
    form.removeEventListener('submit', onSubmit);
  };
}

// Boot
ensureFirebase();
if (auth) {
  let stopAll = null;
  onAuthStateChanged(auth, (user) => {
    if (stopAll) { stopAll(); stopAll = null; }
    const chatSection = document.getElementById('hubChatSection');
    if (!user) {
      show(chatSection, false);
      return;
    }
    stopAll = startChat(user);
  });
}
