'use client';

import { useCallback, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Background,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Play } from 'lucide-react';

const initialNodes: Node[] = [
  {
    id: 'home',
    type: 'pageNode',
    position: { x: 150, y: 100 },
    data: { label: 'Home Page' },
  },
];

const initialEdges: Edge[] = [];

export default function FrontendNodesTab() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addCustomNode = () => {
    const name = prompt('Custom Node Name (e.g. UserProfile, PricingCard)');
    if (!name) return;

    const newNode: Node = {
      id: Date.now().toString(),
      type: 'customNode',
      position: { x: 400, y: 200 },
      data: {
        label: name,
        code: `export default function ${name.replace(/\s+/g, '')}() {\n  return <div>Custom Component</div>;\n}`,
      },
    };

    setNodes((nds) => nds.concat(newNode));
  };

  const generateProject = async () => {
    const res = await fetch('/api/builder/generate-from-nodes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodes, edges }),
    });

    const data = await res.json();
    if (data.success) {
      alert(`✅ Project generated!\nProject ID: ${data.projectId}`);
    } else {
      alert('Generation failed: ' + (data.error || 'Unknown error'));
    }
  };

  const updateNodeCode = (nodeId: string, newCode: string) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, code: newCode } } : node
      )
    );
  };

  return (
    <div className="flex h-screen">
      {/* Toolbar */}
      <div className="w-80 border-r bg-muted/30 p-4 overflow-auto">
        <h2 className="font-semibold mb-4">Nodes Library</h2>
        <Button onClick={addCustomNode} className="w-full mb-2" variant="outline">
          <Plus className="mr-2 h-4 w-4" /> Create Custom Node
        </Button>

        <Button onClick={generateProject} className="w-full">
          <Play className="mr-2 h-4 w-4" /> Generate Next.js Code
        </Button>
      </div>

      {/* Canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_, node) => setSelectedNode(node)}
          nodeTypes={{
            pageNode: PageNode,
            customNode: CustomNode,
          }}
          fitView
        >
          <Background />
        </ReactFlow>
      </div>

      {/* Right Sidebar - Node Editor */}
      {selectedNode && (
        <div className="w-96 border-l bg-background p-4 overflow-auto">
          <h3 className="font-semibold mb-4">Edit Node: {selectedNode.data.label}</h3>

          {selectedNode.type === 'customNode' && (
            <textarea
              className="w-full h-96 font-mono text-sm p-3 border rounded-md bg-zinc-950 text-white"
              value={selectedNode.data.code}
              onChange={(e) => updateNodeCode(selectedNode.id, e.target.value)}
            />
          )}

          <p className="text-xs text-muted-foreground mt-4">
            Changes are saved automatically
          </p>
        </div>
      )}
    </div>
  );
}

// Node Components
function PageNode({ data }: any) {
  return (
    <Card className="px-4 py-3 min-w-[180px] border-blue-400 bg-blue-50">
      <div className="font-medium">📄 {data.label}</div>
      <div className="text-xs text-blue-600">page.tsx</div>
    </Card>
  );
}

function CustomNode({ data }: any) {
  return (
    <Card className="px-4 py-3 min-w-[200px] border-orange-400">
      <div className="font-medium">✦ {data.label}</div>
    </Card>
  );
}
