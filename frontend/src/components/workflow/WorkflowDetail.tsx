import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  Controls,
  Panel,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Play, Plus, Pencil, Trash2, Save, RotateCcw } from "lucide-react";
import { NodeSection } from "./NodeSelection";
import {
  fetchSupportedNodes,
  fetchWorkflowById,
  startExecution,
  updateWorkflow,
  type NodeDefinition,
  type WorkflowEdge,
  type WorkflowNode,
} from "../../lib/workflowClient";

type NodeStyles = {
  color?: string;
  borderClass?: string;
  backgroundClass?: string;
};

type NodeSectionNode = {
  id: string;
  label: string;
  desc: string;
  group?: string;
  styles?: { color: string; borderClass: string; backgroundClass: string };
};

type WorkflowNodeData = {
  name: string;
  job?: string;
  group?: "trigger" | "action" | "logic";
  styles?: NodeStyles;
  nodeTypeId?: string;
  metadata?: Record<string, unknown>;
  onEdit?: () => void;
  onDelete?: () => void;
};

type ConfigField = {
  name: string;
  label: string;
  type: "select" | "text" | "number" | "boolean" | "json" | "textarea";
  required?: boolean;
  options?: { label?: string; value: unknown }[];
  placeholder?: string;
  default?: unknown;
  showIf?: string;
  source?: "domains";
};

export default function WorkflowDetail() {
  const navigate = useNavigate();
  const { workflowId } = useParams<{ workflowId: string }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [supportedNodes, setSupportedNodes] = useState<NodeDefinition[]>([]);
  const [nodes, setNodes] = useState<Node<WorkflowNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const nodesRef = useRef<Node<WorkflowNodeData>[]>([]);

  const supportedNodeByKeyRef = useRef<Map<string, NodeDefinition>>(new Map());
  const supportedNodeByMongoIdRef = useRef<Map<string, NodeDefinition>>(new Map());

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    const byKey = new Map<string, NodeDefinition>();
    const byMongoId = new Map<string, NodeDefinition>();
    for (const n of supportedNodes) {
      if (n._id) byMongoId.set(n._id, n);
      if (n.key) byKey.set(n.key, n);
    }
    supportedNodeByKeyRef.current = byKey;
    supportedNodeByMongoIdRef.current = byMongoId;
  }, [supportedNodes]);

  const [showNodePanel, setShowNodePanel] = useState(false);

  const [configModal, setConfigModal] = useState<{
    node: {
      label: string;
      group?: "trigger" | "action" | "logic";
      styles?: NodeStyles;
      id: string;
    } | null;
    defaults: Record<string, unknown>;
    metaSchema?: { fields?: ConfigField[] };
  }>({ node: null, defaults: {} });

  const [configValues, setConfigValues] = useState<Record<string, unknown>>({});
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

  const isFieldVisible = useCallback(
    (field: { showIf?: string }, values: Record<string, unknown>) => {
      if (!field.showIf) return true;
      const match = field.showIf.match(/^(\w+)\s*==\s*['"]?(.*?)['"]?$/);
      if (!match) return true;
      const [, lhs, rhs] = match;
      return String(values[lhs]) === rhs;
    },
    [],
  );

  const inferGroup = useCallback((wfNode: WorkflowNode, def?: NodeDefinition) => {
    if (wfNode.nodeData?.kind === "TRIGGER") return "trigger" as const;
    const key = def?.key ?? "";
    if (key.includes(".logic.") || key.includes("logic.")) return "logic" as const;
    return "action" as const;
  }, []);

  const prepareDefaults = useCallback(
    (backendNode?: NodeDefinition) => {
      const defaults =
        backendNode && backendNode.config && typeof backendNode.config === "object"
          ? { ...(backendNode.config as Record<string, unknown>) }
          : {};

      const fields = backendNode?.metaSchema?.fields ?? [];
      for (const f of fields) {
        if (defaults[f.name] === undefined && f.default !== undefined) {
          defaults[f.name] = f.default;
        }
      }

      return defaults;
    },
    [],
  );

  const CustomNode = ({ data }: { data: WorkflowNodeData }) => {
    const hasTarget = data.group !== "trigger";
    const borderClass = data.styles?.borderClass ?? "border-gray-200";
    const backgroundClass = data.styles?.backgroundClass ?? "bg-white";

    return (
      <div
        className={`group relative px-4 py-2 shadow-xs rounded-md border ${backgroundClass} ${borderClass}`}
      >
        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            aria-label="Edit node"
            className="p-1 rounded border border-gray-200 bg-white hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation();
              data.onEdit?.();
            }}
          >
            <Pencil className="w-3 h-3" />
          </button>
          <button
            aria-label="Delete node"
            className="p-1 rounded border border-gray-200 bg-white hover:bg-red-50"
            onClick={(e) => {
              e.stopPropagation();
              data.onDelete?.();
            }}
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>

        <div className="flex">
          <div className="ml-2">
            <div className="text-xs font-bold">{data.name}</div>
            <div className="text-[8px] text-gray-500">{data.job ?? "Node"}</div>
          </div>
        </div>

        {hasTarget && (
          <Handle type="target" position={Position.Top} className="w-16 !bg-gray-700" />
        )}
        <Handle type="source" position={Position.Bottom} className="w-16 !bg-gray-700" />
      </div>
    );
  };

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nodesSnapshot) =>
        applyNodeChanges(changes, nodesSnapshot) as unknown as Node<WorkflowNodeData>[],
      ),
    [],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );

  const onConnect = useCallback(
    (params: Edge | Connection) =>
      setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
  }, []);

  const handleEditNode = useCallback(
    (nodeId: string) => {
      const node = nodesRef.current.find((n) => n.id === nodeId);
      if (!node) return;

      const data = node.data as WorkflowNodeData;
      const nodeTypeId = data.nodeTypeId;
      const backendNode = nodeTypeId
        ? supportedNodeByKeyRef.current.get(nodeTypeId) ?? supportedNodeByMongoIdRef.current.get(nodeTypeId)
        : undefined;
      const currentMeta = data.metadata;
      const defaults = currentMeta ?? {};

      const hasConfig =
        backendNode &&
        ((backendNode.metaSchema?.fields?.length ?? 0) > 0 || Object.keys(defaults).length > 0);

      if (data.group === "trigger" || hasConfig) {
        const mergedDefaults = { ...prepareDefaults(backendNode), ...defaults };
        setEditingNodeId(nodeId);
        setConfigValues(mergedDefaults);
        setConfigModal({
          node: {
            id: nodeTypeId ?? node.id,
            label: typeof data.name === "string" ? data.name : String(data.name ?? ""),
            group: data.group,
            styles: data.styles,
          },
          defaults: mergedDefaults,
          metaSchema: backendNode?.metaSchema as { fields?: ConfigField[] } | undefined,
        });
        return;
      }

      const newName = window.prompt("Edit node label", data.name);
      if (!newName) return;

      setNodes((nds) =>
        nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, name: newName } } : n)),
      );
    },
    [prepareDefaults],
  );

  const toSectionNodesFromBackend = useCallback(
    (groupName: "trigger" | "action" | "logic") =>
      supportedNodes
        .filter((n) => {
          if (groupName === "trigger") return n.type === "TRIGGER";
          const key = n.key ?? "";
          const isLogic = key.includes(".logic.") || key.includes("logic.");
          if (groupName === "logic") return n.type === "ACTION" && isLogic;
          return n.type === "ACTION" && !isLogic;
        })
        .map((n) => ({
          id: n.key ?? n._id,
          label: n.title,
          desc: n.description ?? "",
          group: groupName,
        })),
    [supportedNodes],
  );

  const handleCreateNode = useCallback(
    (node: NodeSectionNode) => {
      const backendNode =
        supportedNodeByKeyRef.current.get(node.id) ?? supportedNodeByMongoIdRef.current.get(node.id);
      const mergedDefaults = prepareDefaults(backendNode);

      const group =
        node.group === "trigger" || node.group === "action" || node.group === "logic"
          ? (node.group as "trigger" | "action" | "logic")
          : undefined;
      const styles: NodeStyles | undefined = node.styles
        ? {
            color: node.styles.color,
            borderClass: node.styles.borderClass,
            backgroundClass: node.styles.backgroundClass,
          }
        : undefined;

      const needsConfig =
        backendNode &&
        ((backendNode.metaSchema?.fields?.length ?? 0) > 0 ||
          Object.keys(mergedDefaults).length > 0 ||
          group === "trigger");

      if (needsConfig) {
        setEditingNodeId(null);
        setConfigValues(mergedDefaults);
        setConfigModal({
          node: {
            id: node.id,
            label: node.label,
            group,
            styles,
          },
          defaults: mergedDefaults,
          metaSchema: backendNode?.metaSchema as { fields?: ConfigField[] } | undefined,
        });
        return;
      }

      const newNode: Node<WorkflowNodeData> = {
        id: `${node.label}-${Date.now()}`,
        type: "custom",
        position: { x: 250, y: 150 },
        data: {
          name: node.label,
          job: group === "trigger" ? "Trigger" : "Workflow node",
          group,
          styles,
          // Prefer storing the catalog node key in the workflow graph
          nodeTypeId: backendNode?.key ?? node.id,
          metadata: {},
          onEdit: () => handleEditNode(newNode.id),
          onDelete: () => handleDeleteNode(newNode.id),
        },
      };

      setNodes((nds) => [...nds, newNode]);
      setShowNodePanel(false);
    },
    [handleDeleteNode, handleEditNode, prepareDefaults],
  );

  const handleCancelConfig = () => {
    setConfigModal({ node: null, defaults: {} });
    setConfigValues({});
    setEditingNodeId(null);
  };

  const handleConfirmConfig = () => {
    if (!configModal.node) return;

    const fields = (configModal.metaSchema?.fields ?? []) as ConfigField[];

    // Validate & normalize JSON fields before saving.
    const normalizedValues: Record<string, unknown> = { ...configValues };
    for (const field of fields) {
      if (!isFieldVisible(field, configValues)) continue;
      if (field.type !== "json") continue;

      const val = normalizedValues[field.name];
      if (typeof val === "string") {
        const trimmed = val.trim();
        if (trimmed === "") continue;
        try {
          normalizedValues[field.name] = JSON.parse(trimmed);
        } catch {
          alert(`Invalid JSON in "${field.label}"`);
          return;
        }
      }
    }

    const visibleRequiredMissing = fields.some((field) => {
      if (!field.required) return false;
      if (!isFieldVisible(field, normalizedValues)) return false;
      const val = normalizedValues[field.name];
      return val === undefined || val === null || String(val).trim() === "";
    });

    if (visibleRequiredMissing) {
      alert("Please fill all required fields.");
      return;
    }

    if (editingNodeId) {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === editingNodeId
            ? {
                ...n,
                data: {
                  ...n.data,
                  metadata: normalizedValues,
                  onEdit: () => handleEditNode(editingNodeId),
                  onDelete: () => handleDeleteNode(editingNodeId),
                },
              }
            : n,
        ),
      );
    } else {
      const newNodeId = `${configModal.node.label}-${Date.now()}`;
      const group = configModal.node.group ?? "action";
      const newNode: Node<WorkflowNodeData> = {
        id: newNodeId,
        type: "custom",
        position: { x: 250, y: 150 },
        data: {
          name: configModal.node.label,
          job: group === "trigger" ? "Trigger" : "Workflow node",
          group,
          styles: configModal.node.styles,
          nodeTypeId: configModal.node.id,
          metadata: normalizedValues,
          onEdit: () => handleEditNode(newNodeId),
          onDelete: () => handleDeleteNode(newNodeId),
        },
      };
      setNodes((nds) => [...nds, newNode]);
    }

    setEditingNodeId(null);
    setConfigModal({ node: null, defaults: {} });
    setShowNodePanel(false);
  };

  const toWorkflowGraphPayload = useCallback(() => {
    const wfNodes: WorkflowNode[] = nodes.map((n) => ({
      id: n.id,
      position: { x: n.position.x, y: n.position.y },
      NodeType: (n.data as WorkflowNodeData)?.nodeTypeId ?? "",
      nodeData: {
        kind: n.data.group === "trigger" ? "TRIGGER" : "ACTION",
        metadata: (n.data as WorkflowNodeData)?.metadata ?? {},
      },
    }));

    const wfEdges: WorkflowEdge[] = edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
    }));

    return { nodes: wfNodes, edges: wfEdges };
  }, [edges, nodes]);

  const loadWorkflow = useCallback(async () => {
    if (!workflowId) {
      setError("Missing workflow id");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token") ?? undefined;
      const [nodeDefs, workflow] = await Promise.all([
        fetchSupportedNodes(),
        fetchWorkflowById(workflowId, token),
      ]);

      setSupportedNodes(nodeDefs);

      // Map persisted workflow graph to ReactFlow nodes/edges.
      const rfNodes: Node<WorkflowNodeData>[] = (workflow.nodes ?? []).map((wfNode) => {
        const def = wfNode.NodeType
          ? nodeDefs.find((d) => d.key === wfNode.NodeType) ?? nodeDefs.find((d) => d._id === wfNode.NodeType)
          : undefined;
        const group = inferGroup(wfNode, def);

        const newNode: Node<WorkflowNodeData> = {
          id: wfNode.id,
          type: "custom",
          position: { x: wfNode.position?.x ?? 250, y: wfNode.position?.y ?? 150 },
          data: {
            name: def?.title ?? "Unknown node",
            job: group === "trigger" ? "Trigger" : "Workflow node",
            group,
            // Could be key (preferred) or legacy Mongo id
            nodeTypeId: wfNode.NodeType,
            metadata: wfNode.nodeData?.metadata ?? {},
            onEdit: () => handleEditNode(wfNode.id),
            onDelete: () => handleDeleteNode(wfNode.id),
          },
        };

        return newNode;
      });

      const rfEdges: Edge[] = (workflow.edges ?? []).map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
      }));

      setNodes(rfNodes);
      setEdges(rfEdges);
    } catch (e) {
      console.error(e);
      setError("Failed to load workflow");
    } finally {
      setLoading(false);
    }
  }, [handleDeleteNode, handleEditNode, inferGroup, workflowId]);

  useEffect(() => {
    loadWorkflow();
  }, [loadWorkflow]);

  const handleSave = async () => {
    if (!workflowId) return;

    const missingNodeType = nodes.find((n) => !(n.data as WorkflowNodeData)?.nodeTypeId);
    if (missingNodeType) {
      alert(`Node "${missingNodeType.data.name}" is missing a NodeType. Please re-add it.`);
      return;
    }

    try {
      const token = localStorage.getItem("token") ?? undefined;
      const payload = toWorkflowGraphPayload();
      await updateWorkflow(workflowId, payload, token);
      alert("Workflow saved");
    } catch (e) {
      console.error(e);
      alert("Failed to save workflow");
    }
  };

  const handleExecute = async () => {
    if (!workflowId) return;

    try {
      const token = localStorage.getItem("token") ?? undefined;
      const testPayload = { 
        text: "Hello, I would like to book an appointment for tomorrow. Budget is $500.",
        conversation: {
          text: "Hello, I would like to book an appointment for tomorrow. Budget is $500."
        }
      };
      const { executionId } = await startExecution(workflowId, testPayload, token);
      alert(`Execution started: ${executionId}`);
      navigate(`/executions/${workflowId}`);
    } catch (e) {
      console.error(e);
      alert("Failed to start execution");
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-2 mb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-gray-600">
            <div className="font-medium text-gray-900">Workflow</div>
            <div className="text-xs">{workflowId}</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="px-4 py-1 rounded-md border border-gray-300 bg-white text-black hover:bg-gray-100 flex items-center gap-2"
              onClick={loadWorkflow}
            >
              <RotateCcw className="w-4 h-4" />
              Reload
            </button>
            <button
              className="px-4 py-1 rounded-md border border-gray-300 bg-white text-black hover:bg-gray-100 flex items-center gap-2"
              onClick={handleSave}
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              className="px-4 py-1 rounded-md bg-black text-white hover:brightness-90 flex items-center gap-2"
              onClick={handleExecute}
            >
              <Play className="w-4 h-4" />
              Execute
            </button>
          </div>
        </div>

        {loading && <div className="text-xs text-gray-500">Loading workflow…</div>}
        {error && <div className="text-xs text-red-600">{error}</div>}
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
          </ReactFlow>
        </div>
      </div>

      {showNodePanel && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30" onClick={() => setShowNodePanel(false)} />
          <div className="w-[400px] bg-white border-l shadow-xl p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Node</h3>
              <button onClick={() => setShowNodePanel(false)}>
                <div className="w-5 h-5 text-gray-500 hover:text-black">X</div>
              </button>
            </div>

            <NodeSection title="Triggers" nodes={toSectionNodesFromBackend("trigger")} onAdd={handleCreateNode} />

            <NodeSection title="AI Actions" nodes={toSectionNodesFromBackend("action")} onAdd={handleCreateNode} />

            <NodeSection title="Logic" nodes={toSectionNodesFromBackend("logic")} onAdd={handleCreateNode} />
          </div>
        </div>
      )}

      {configModal.node && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30" onClick={handleCancelConfig} />
          <div className="w-[400px] bg-white border-l shadow-xl p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {configModal.node.group === "trigger" ? "Configure Trigger" : "Configure Action"}
              </h3>
              <button onClick={handleCancelConfig}>
                <div className="w-5 h-5 text-gray-500 hover:text-black">X</div>
              </button>
            </div>

            {(configModal.metaSchema?.fields?.length ?? 0) === 0 && Object.keys(configModal.defaults).length === 0 && (
              <div className="text-sm text-gray-500 mb-3">No metadata required.</div>
            )}

            {configModal.metaSchema?.fields?.map((field) => {
              if (!isFieldVisible(field, configValues)) return null;

              const rawValue = configValues[field.name] ?? field.default ?? "";
              const isObject = rawValue && typeof rawValue === "object";
              const value = isObject ? JSON.stringify(rawValue, null, 2) : rawValue;

              const label = (
                <span className="text-gray-600">
                  {field.label}
                  {field.required ? " *" : ""}
                </span>
              );

              if (field.type === "select") {
                const options = field.options ?? [];
                return (
                  <label key={field.name} className="block mb-3 text-sm">
                    {label}
                    <select
                      className="mt-1 w-full border rounded px-2 py-1 text-sm"
                      value={String(value ?? "")}
                      onChange={(e) =>
                        setConfigValues((prev) => ({
                          ...prev,
                          [field.name]: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select</option>
                      {options.map((opt) => (
                        <option key={String(opt.value)} value={String(opt.value)}>
                          {opt.label ?? String(opt.value)}
                        </option>
                      ))}
                    </select>
                  </label>
                );
              }

              if (field.type === "boolean") {
                return (
                  <label key={field.name} className="flex items-center gap-2 mb-3 text-sm">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={Boolean(value)}
                      onChange={(e) =>
                        setConfigValues((prev) => ({
                          ...prev,
                          [field.name]: e.target.checked,
                        }))
                      }
                    />
                    {label}
                  </label>
                );
              }

              if (field.type === "number") {
                return (
                  <label key={field.name} className="block mb-3 text-sm">
                    {label}
                    <input
                      className="mt-1 w-full border rounded px-2 py-1 text-sm"
                      type="number"
                      value={value === undefined || value === null ? "" : String(value)}
                      onChange={(e) =>
                        setConfigValues((prev) => ({
                          ...prev,
                          [field.name]: e.target.value === "" ? "" : Number(e.target.value),
                        }))
                      }
                      placeholder={field.placeholder}
                    />
                  </label>
                );
              }

              if (field.type === "textarea") {
                return (
                  <label key={field.name} className="block mb-3 text-sm">
                    {label}
                    <textarea
                      className="mt-1 w-full border rounded px-2 py-1 text-sm"
                      rows={4}
                      value={String(value ?? "")}
                      placeholder={field.placeholder}
                      onChange={(e) =>
                        setConfigValues((prev) => ({
                          ...prev,
                          [field.name]: e.target.value,
                        }))
                      }
                    />
                  </label>
                );
              }

              if (field.type === "json") {
                return (
                  <label key={field.name} className="block mb-3 text-sm">
                    {label}
                    <textarea
                      className="mt-1 w-full border rounded px-2 py-1 text-sm font-mono"
                      rows={6}
                      value={isObject ? (value as string) : String(value ?? "")}
                      placeholder={field.placeholder}
                      onChange={(e) =>
                        setConfigValues((prev) => ({
                          ...prev,
                          [field.name]: e.target.value,
                        }))
                      }
                    />
                  </label>
                );
              }

              return (
                <label key={field.name} className="block mb-3 text-sm">
                  {label}
                  <input
                    className="mt-1 w-full border rounded px-2 py-1 text-sm"
                    value={String(value ?? "")}
                    placeholder={field.placeholder}
                    onChange={(e) =>
                      setConfigValues((prev) => ({
                        ...prev,
                        [field.name]: e.target.value,
                      }))
                    }
                  />
                </label>
              );
            })}

            <div className="flex gap-2 justify-end">
              <button className="px-3 py-1 rounded border" onClick={handleCancelConfig}>
                Cancel
              </button>
              <button className="px-3 py-1 rounded bg-black text-white" onClick={handleConfirmConfig}>
                {configModal.node.group === "trigger" ? "Save trigger" : "Save node"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
