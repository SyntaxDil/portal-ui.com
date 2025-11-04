import React from 'react';
import CodeBlock from '../../common/CodeBlock';

const PortalMarketplace: React.FC = () => (
    <div className="p-6 bg-black/30 rounded-lg border border-gray-700">
        <h2 className="font-orbitron text-2xl text-white mb-4">API: Quantum Ledger</h2>
        <p>The Portal Marketplace runs on a decentralized Quantum Ledger, ensuring transparent, secure, and instant ownership of digital assets. All interactions are done via our REST API.</p>
        <h3 className="font-orbitron text-xl text-white mt-6 mb-2">Schema: Digital Asset</h3>
        <p>This is the standard object structure for any asset on the marketplace.</p>
        <CodeBlock language="json" code={`
{
  "assetId": "string (UUID)",
  "ownerId": "string (User Handle)",
  "name": "string",
  "description": "string",
  "mediaUrl": "string (URL to image/model)",
  "price": {
    "amount": "number",
    "currency": "XP" // or other portal currencies
  },
  "tags": ["string"]
}
        `} />
        <h3 className="font-orbitron text-xl text-white mt-6 mb-2">Endpoint: Purchase Asset</h3>
        <p>To purchase an asset, send the assetId to the purchase endpoint. The user's wallet must be authenticated.</p>
        <CodeBlock language="http" code={`
POST /api/marketplace/purchase
Authorization: Bearer {USER_AUTH_TOKEN}
Content-Type: application/json

{
  "assetId": "asset-uuid-goes-here"
}
        `} />
    </div>
);

export default PortalMarketplace;
