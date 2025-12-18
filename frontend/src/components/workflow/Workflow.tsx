import { useState, useCallback } from 'react';
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Background,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { AppSidebar } from '../AppSidebar';

const initialNodes: Node[] = [
  { id: 'n1', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
  { id: 'n2', position: { x: 0, y: 100 }, data: { label: 'Node 2' } },
];
const initialEdges: Edge[] = [{ id: 'n1-n2', source: 'n1', target: 'n2' }];

export default function Workflow() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [nextNodeId, setNextNodeId] = useState(3);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  const handleAddStep = useCallback(() => {
    setNodes((previousNodes) => {
      const newId = `n${nextNodeId}`;
      const lastNode = previousNodes[previousNodes.length - 1];

      const newNode = {
        id: newId,
        position: {
          x: lastNode ? lastNode.position.x : 0,
          y: lastNode ? lastNode.position.y + 100 : 0,
        },
        data: { label: `Node ${nextNodeId}` },
      };

      setEdges((previousEdges) => [
        ...previousEdges,
        {
          id: `${lastNode?.id ?? 'start'}-${newId}`,
          source: lastNode?.id ?? 'n1',
          target: newId,
        },
      ]);

      return [...previousNodes, newNode];
    });
    setNextNodeId((previous) => previous + 1);
  }, [nextNodeId]);

  const handleResetWorkflow = useCallback(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setNextNodeId(3);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        width: '100%',
      }}
    >
      <div style={{ flex: 1, height: '80vh', }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Background />
        </ReactFlow>
      </div>
      {/* Sidebar aligned at right, with workflow options */}
      <div
        style={{
          width: '20vw',
          borderLeft: '1px solid #e5e7eb',
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            padding: '1rem',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <h3 style={{ marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: 600 }}>
            Workflow options
          </h3>
          <button
            onClick={handleAddStep}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              marginBottom: '0.5rem',
              borderRadius: '0.375rem',
              border: '1px solid #d1d5db',
              background: '#111827',
              color: '#fff',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Add step
          </button>
          <button
            onClick={handleResetWorkflow}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.375rem',
              border: '1px solid #d1d5db',
              background: '#f9fafb',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Reset workflow
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <AppSidebar />
        </div>
      </div>
    </div>
  );
}