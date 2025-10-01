import React from 'react';

const N8NConnectionInstructions: React.FC<{ agentName?: string }> = ({ agentName }) => {
    // const displayAgentName = agentName || 'My Agent';
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    agentName;

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-2">1. Add an AI Agent in your workflow</h3>
            <p className="text-sm text-gray-700">In the bottom of the AI Agent node you can click on + to add Tools</p>
            <h3 className="text-lg font-semibold mb-2">2. Choose the MCP Client Tool</h3>
            <p className="text-sm text-gray-700">And configure as such:</p>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 mb-3">
                <li><code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">Endpoint</code>: runtime_host/mcp:3001 where runtime_host points to a valid URL of a connected 2ly runtime.</li>
                <li><code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">Server Transpoert</code>: HTTP Streamable</li>
                <li><code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">Authentication</code>: None</li>
            </ul>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-gray-700">Currently when connecting to 2LY in remote mode, you always connect to the "Main Runtime". We are working on supporting multi-agents from remote connection.</p>
            </div>
        </div>
    );
};

export default N8NConnectionInstructions;


