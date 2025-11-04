import React from 'react';

const CodeBlock: React.FC<{ code: string; language: string }> = ({ code, language }) => (
    <pre className="bg-gray-900/70 p-4 rounded-md text-cyan-300 text-sm my-4 overflow-x-auto"><code className={`language-${language}`}>{code.trim()}</code></pre>
);

export default CodeBlock;