
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AudioProvider } from './context/AudioContext';

console.log('🚀 SoundWave index.tsx loading...');

const rootElement = document.getElementById('root');
console.log('📍 Root element:', rootElement);

if (!rootElement) {
  console.error('❌ Could not find root element!');
  throw new Error("Could not find root element to mount to");
}

console.log('✅ Root element found, creating React root...');
const root = ReactDOM.createRoot(rootElement);

console.log('🎨 Rendering App...');
root.render(
  <React.StrictMode>
    <AudioProvider>
      <App />
    </AudioProvider>
  </React.StrictMode>
);

console.log('✅ React render called');
