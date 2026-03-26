import { useState, useCallback, useEffect } from "react";
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, Background, type Node, type Edge, type NodeChange, type EdgeChange, type Connection, Controls, Panel, Handle, Position } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Play, Plus } from "lucide-react";
import { NodeSection } from "./NodeSelection";
import { type ConversiaNodeType } from "./nodes/node-registry";
import { BACKEND_URL } from "../../lib/utils";

const initialNodes: Node[] = [];

const initialEdges: Edge[] = [];

export default function CreateWorkflow() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [showNodePanel, setShowNodePanel] = useState(false);
  const [supportedNodes, setSupportedNodes] = useState<SupportedWorkflowNode[]>([]);
  const [supportedNodesLoading, setSupportedNodesLoading] = useState(false);
  const [supportedNodesError, setSupportedNodesError] = useState<string | null>(null);
  const isEmptyWorkflow = nodes.length === 0;

  type SupportedWorkflowNode = {
    _id: string;
    title: string;
    description?: string;
    type: "TRIGGER" | "ACTION";
    key: string;
    config?: unknown;
  };

  //Fetch all nodes
  const allNodes = async () => {
    try{
      setSupportedNodesLoading(true);
      setSupportedNodesError(null);
      const response = await fetch(`${BACKEND_URL}/workflow/nodes`, {
        headers: {
          "content-type": "application/json" 
        }
      })

      const data = await response.json();
      setSupportedNodes(Array.isArray(data?.nodes) ? data.nodes : []);
    } catch(e){
      console.log(e)
      setSupportedNodesError("Failed to load supported nodes");
    } finally {
      setSupportedNodesLoading(false);
    }
  }

  const CustomNode = ({
    data,
  }: {
    data: {
      emoji?: string;
      name: string;
      job?: string;
      group?: string;
      styles?: ConversiaNodeType["description"]["styles"];
    };
  }) => {
    const hasTarget = data.group !== "trigger";
    const borderClass = data.styles?.borderClass ?? "border-gray-200";
    const backgroundClass = data.styles?.backgroundClass ?? "bg-white";

    return (
      <div className={`px-4 py-2 shadow-xs rounded-md border ${backgroundClass} ${borderClass}`}>
        <div className="flex">
          <div className="ml-2">
            <div className="text-xs font-bold">{data.name}</div>
            <div className="text-[8px] text-gray-500">{data.job ?? "Custom node"}</div>
          </div>
        </div>

        {hasTarget && <Handle type="target" position={Position.Top} className="w-16 !bg-gray-700" />}
        <Handle type="source" position={Position.Bottom} className="w-16 !bg-gray-700" />
      </div>
    );
  };

  const nodeTypes = { custom: CustomNode };

  const toSectionNodesFromBackend = (groupName: "trigger" | "action" | "logic") =>
    supportedNodes
      .filter((n) => {
        if (groupName === "trigger") return n.type === "TRIGGER";
        if (groupName === "logic") return n.key.includes(".logic.") || n.key.includes("logic.");
        return n.type === "ACTION" && !(n.key.includes(".logic.") || n.key.includes("logic."));
      })
      .map((n) => ({
        id: n._id,
        label: n.title,
        desc: n.description ?? "",
        group: groupName,
      }));

  useEffect(() => {
    if (isEmptyWorkflow) {
      setShowNodePanel(true);
    }
  }, [isEmptyWorkflow]);

  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)), []);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)), []);
  const onConnect = useCallback((params: Edge | Connection) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)), []);

  const handleResetWorkflow = useCallback(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, []);

  const handleCreateNode = (node: { label: string; group?: string; styles?: ConversiaNodeType["description"]["styles"] }) => {
    const newNode = {
      id: `${node.label}-${Date.now()}`,
      type: "custom",
      position: { x: 250, y: 150 },
      data: {
        name: node.label,
        job: node.group === "trigger" ? "Trigger" : "Workflow node",
        group: node.group,
        styles: node.styles,
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setShowNodePanel(false);
  };

  useEffect(() => {
    allNodes()
  }, [])

  return (
    <div>
      <div className="flex justify-center gap-3 mb-3">
        <button
          className="px-4 py-1 rounded-md bg-black text-white hover:brightness-90"
          // You can add your publish logic in onClick
          onClick={() => {
            // TODO: Add publish logic here
            alert("Publish workflow");
          }}
        >
          Publish
        </button>
        <button className="px-4 py-1 rounded-md border border-gray-300 bg-white text-black hover:bg-gray-100" onClick={handleResetWorkflow}>
          Reset
        </button>
      </div>

      <div className="px-1 flex w-full gap-2">
        <div className="flex-1 border rounded-md h-[90vh]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Controls />
            <Panel position="top-left">
              <button
                onClick={() => setShowNodePanel(true)}
                className="w-10 h-10 bg-black text-white rounded-full cursor-pointer border-none flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </Panel>
            <Panel position="top-right">
              <button
                onClick={() => alert("Execute workflow")}
                className="w-10 h-10 bg-black text-white rounded-full cursor-pointer border-none flex items-center justify-center"
              >
                <Play className="w-4 h-4" />
              </button>
            </Panel>
          </ReactFlow>
        </div>
      </div>

      {showNodePanel && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="flex-1 bg-black/30" onClick={() => setShowNodePanel(false)} />

          {/* Side Panel */}
          <div className="w-[320px] bg-white border-l shadow-xl p-4 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Node</h3>
              <button onClick={() => setShowNodePanel(false)}>
                <div className="w-5 h-5 text-gray-500 hover:text-black">X</div>
              </button>
            </div>

            {/* Sections */}
            <NodeSection title="Triggers" nodes={toSectionNodesFromBackend("trigger")} onAdd={handleCreateNode} />

            {supportedNodesLoading && <div className="text-xs text-gray-500 mt-2">Loading nodes…</div>}
            {supportedNodesError && <div className="text-xs text-red-600 mt-2">{supportedNodesError}</div>}

            {!isEmptyWorkflow && (
              <>
                <NodeSection title="AI Actions" nodes={toSectionNodesFromBackend("action")} onAdd={handleCreateNode} />

                <NodeSection title="Logic" nodes={toSectionNodesFromBackend("logic")} onAdd={handleCreateNode} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
