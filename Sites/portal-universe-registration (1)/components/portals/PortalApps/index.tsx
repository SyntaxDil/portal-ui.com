import React from 'react';
import CodeBlock from '../../common/CodeBlock';

const PortalApps: React.FC = () => (
    <div className="p-6 bg-black/30 rounded-lg border border-gray-700">
        <h2 className="font-orbitron text-2xl text-white mb-4">Building Apps for Portal</h2>
        <p>Create applications that run inside the Portal Universe. Our sandboxed environment uses a JavaScript-based API, allowing you to create tools, widgets, and experiences.</p>
        <h3 className="font-orbitron text-xl text-white mt-6 mb-2">"Hello World" App Example</h3>
        <p>All Portal Apps must export a \`main\` function which serves as the entry point.</p>
        <CodeBlock language="javascript" code={`
import { UI, User } from '@portal/api';

export function main(container) {
  // Get the current user's data
  const currentUser = User.getCurrent();

  // Create a UI element
  const greeting = UI.createElement('h1');
  greeting.setText(\`Hello, \${currentUser.displayName}!\`);

  // Append it to the app's container
  container.appendChild(greeting);
}
        `} />
         <h3 className="font-orbitron text-xl text-white mt-6 mb-2">Permissions Model</h3>
         <p>Apps must declare required permissions in a \`portal.json\` manifest file. Users will be prompted to grant these permissions upon installation.</p>
         <CodeBlock language="json" code={`
{
  "name": "My First App",
  "version": "1.0.0",
  "permissions": [
    "user:profile:read",
    "wallet:xp:read",
    "notifications:send"
  ]
}
        `} />
    </div>
);

export default PortalApps;
