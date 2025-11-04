import React from 'react';
import CodeBlock from '../../common/CodeBlock';

const PortalDJ: React.FC = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div className="lg:col-span-2 p-6 bg-black/30 rounded-lg border border-gray-700">
      <h2 className="font-orbitron text-2xl text-white mb-4">Feature: Quantum Audio Engine</h2>
      <p>The Quantum Audio Engine allows for real-time, lossless audio streaming across the Portal network. Our SDK provides tools for track analysis, AI-powered transitions, and broadcasting.</p>
      <h3 className="font-orbitron text-xl text-white mt-6 mb-2">API: Broadcast Endpoint</h3>
      <p>To start a broadcast, send a POST request with your track metadata. The server will respond with a dedicated stream URL.</p>
      <CodeBlock language="http" code={`
POST /api/dj/broadcast
Content-Type: application/json

{
  "sessionName": "My First Mix",
  "genre": "Synthwave",
  "isPublic": true
}
      `} />
       <h3 className="font-orbitron text-xl text-white mt-6 mb-2">SDK: Track Upload</h3>
       <p>Use our CLI or SDK to upload and analyze tracks. Analysis provides BPM, key, and energy level for seamless mixing.</p>
       <CodeBlock language="javascript" code={`
import { PortalDJSDK } from '@portal/dj-sdk';
const sdk = new PortalDJSDK({ apiKey: '...' });

const trackData = await sdk.uploadTrack('./my-track.mp3');
console.log(trackData.analysis);
// { bpm: 128, key: 'Am', energy: 0.8 }
      `} />
    </div>
    <div className="lg:col-span-1 p-6 bg-black/30 rounded-lg border border-gray-700 flex flex-col items-center justify-center space-y-4">
        <h3 className="font-orbitron text-xl text-white">Mixing Console (UI Example)</h3>
        <div className="w-full h-24 bg-gradient-to-r from-cyan-500 to-fuchsia-500 rounded-lg flex items-center justify-center font-bold text-black">VISUALIZER</div>
        <p className="text-sm text-gray-400">Now Playing: Starlight Cruiser - Nebula Run</p>
        <div className="flex w-full justify-around items-center">
            <div className="text-center"><div className="w-16 h-16 rounded-full bg-gray-700 border-2 border-cyan-500 flex items-center justify-center">FX</div><span className="text-xs">Effects</span></div>
            <div className="text-center"><div className="w-20 h-20 rounded-full bg-gray-700 border-2 border-cyan-500 flex items-center justify-center text-2xl">A</div><span className="text-xs">Deck A</span></div>
            <div className="text-center"><div className="w-20 h-20 rounded-full bg-gray-700 border-2 border-cyan-500 flex items-center justify-center text-2xl">B</div><span className="text-xs">Deck B</span></div>
        </div>
    </div>
  </div>
);

export default PortalDJ;
