import React from 'react';
import CodeBlock from '../../common/CodeBlock';

const PortalLiveStream: React.FC = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-6 bg-black/30 rounded-lg border border-gray-700">
            <h2 className="font-orbitron text-2xl text-white mb-4">Feature: Holographic Streaming Protocol (HSP)</h2>
            <p>HSP provides ultra-low latency, high-fidelity video streaming suitable for holographic projection. This documentation outlines how to connect your streaming software.</p>
            <h3 className="font-orbitron text-xl text-white mt-6 mb-2">RTMP Ingest Endpoint</h3>
            <p>Configure your streaming software (e.g., OBS) to push to the following RTMP server. Your unique stream key can be generated in your user settings.</p>
            <CodeBlock language="text" code={`
Server: rtmp://stream.portal.ui/live
Stream Key: {YOUR_UNIQUE_STREAM_KEY}
            `} />
            <h3 className="font-orbitron text-xl text-white mt-6 mb-2">Real-time Chat API (WebSocket)</h3>
            <p>Connect a client to our WebSocket endpoint to receive real-time chat messages for your stream. Authentication is handled via a temporary token.</p>
            <CodeBlock language="javascript" code={`
const token = '...'; // Fetch from /api/stream/chat-token
const socket = new WebSocket('wss://chat.portal.ui/v1?token=' + token);

socket.onmessage = (event) => {
  const message = JSON.parse(event.data);
  // { user: 'viewer123', text: 'Hello, world!', timestamp: ... }
  displayChatMessage(message);
};
            `} />
        </div>
        <div className="lg:col-span-1 p-6 bg-black/30 rounded-lg border border-gray-700">
            <h3 className="font-orbitron text-xl text-white text-center mb-4">Stream View (UI Example)</h3>
            <div className="aspect-video bg-black rounded-lg border-2 border-red-500 flex items-center justify-center relative">
                <span className="text-gray-500">Video Feed</span>
                <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">LIVE</div>
                <div className="absolute bottom-2 left-2 text-white text-xs font-bold px-2 py-1 rounded flex items-center"><svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg> 21.7k</div>
            </div>
            <div className="mt-4 h-64 bg-gray-800/50 rounded p-2 text-sm overflow-y-auto">
                <p><span className="text-cyan-400">User1</span>: This is awesome!</p>
                <p><span className="text-fuchsia-400">User2</span>: Great stream quality!</p>
            </div>
        </div>
    </div>
);

export default PortalLiveStream;
