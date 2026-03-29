import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Play, Plus, Pencil, Trash2 } from "lucide-react";
import { NodeSection } from "./NodeSelection";
import { BACKEND_URL } from "../../lib/utils";
import {
  createWorkflow,
  type CreateWorkflowRequest,
  type WorkflowNode,
  type WorkflowEdge,
} from "../../lib/workflowClient";
import { useTenant } from "../../context/Context";

type NodeStyles = {
  borderClass?: string;
  backgroundClass?: string;
};

type WorkflowNodeData = {
  emoji?: string;
  name: string;
  job?: string;
  group?: string;
  styles?: NodeStyles;
  nodeTypeId?: string;
  metadata?: Record<string, unknown>;
  onEdit?: () => void;
  onDelete?: () => void;
};

const initialNodes: Node<WorkflowNodeData>[] = [];

const initialEdges: Edge[] = [];

export default function CreateWorkflow() {
  const navigate = useNavigate();
  const [nodes, setNodes] = useState<Node<WorkflowNodeData>[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [showNodePanel, setShowNodePanel] = useState(false);
  const [supportedNodes, setSupportedNodes] = useState<SupportedWorkflowNode[]>([]);
  const [supportedNodesLoading, setSupportedNodesLoading] = useState(false);
  const [supportedNodesError, setSupportedNodesError] = useState<string | null>(
    null,
  );
  const [configModal, setConfigModal] = useState<{
    node: {
      label: string;
      group?: string;
      styles?: NodeStyles;
      id: string;
    } | null;
    defaults: Record<string, unknown>;
    metaSchema?: {
      fields?: {
        name: string;
        label: string;
        type: "select" | "text" | "number" | "boolean";
        required?: boolean;
        options?: { label: string; value: string }[];
        source?: "domains";
      }[];
    };
  }>({ node: null, defaults: {} });
  const [configValues, setConfigValues] = useState<Record<string, unknown>>({});
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const isEmptyWorkflow = nodes.length === 0;
  const { domains } = useTenant();
  const [selectedDomainId, setSelectedDomainId] = useState<string>("");
  const [selectedDomainName, setSelectedDomainName] = useState<string>("");

  type SupportedWorkflowNode = {
    _id: string;
    title: string;
    description?: string;
    type: "TRIGGER" | "ACTION";
    key: string;
    config?: unknown;
    metaSchema?: {
      fields?: {
        name: string;
        label: string;
        type: "select" | "text" | "number" | "boolean";
        required?: boolean;
        options?: { label: string; value: string }[];
        source?: "domains";
      }[];
    };
  };

  const prepareDefaults = useCallback(
    (backendNode?: SupportedWorkflowNode) => {
      const defaults =
        backendNode &&
        backendNode.config &&
        typeof backendNode.config === "object"
          ? { ...(backendNode.config as Record<string, unknown>) }
          : {};

      backendNode?.metaSchema?.fields?.forEach((f) => {
        if (
          defaults[f.name] === undefined &&
          f.source === "domains" &&
          selectedDomainId
        ) {
          defaults[f.name] = selectedDomainId;
        }
      });

      return defaults;
    },
    [selectedDomainId],
  );

  //Fetch all nodes
  const allNodes = async () => {
    try {
      setSupportedNodesLoading(true);
      setSupportedNodesError(null);
      const response = await fetch(`${BACKEND_URL}/workflow/nodes`, {
        headers: {
          "content-type": "application/json",
        },
      });

      const data = await response.json();
      setSupportedNodes(Array.isArray(data?.nodes) ? data.nodes : []);
    } catch (e) {
      console.log(e);
      setSupportedNodesError("Failed to load supported nodes");
    } finally {
      setSupportedNodesLoading(false);
    }
  };

  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) =>
      eds.filter((e) => e.source !== nodeId && e.target !== nodeId),
    );
  }, []);

  const handleEditNode = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      const data = node.data as WorkflowNodeData;
      const nodeTypeId = data.nodeTypeId;
      const backendNode = nodeTypeId
        ? supportedNodes.find((n) => n._id === nodeTypeId)
        : undefined;
      const currentMeta = data.metadata;
      const defaults = currentMeta ?? {};
      const hasConfig =
        backendNode &&
        ((backendNode.metaSchema?.fields?.length ?? 0) > 0 ||
          Object.keys(defaults).length > 0);

      if (node.data.group === "trigger" || hasConfig) {
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
          metaSchema: backendNode?.metaSchema,
        });
        return;
      }

      const newName = window.prompt(
        "Edit node label",
        typeof data.name === "string" ? data.name : undefined,
      );
      if (!newName) return;
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId
            ? {
                ...n,
                data: {
                  ...n.data,
                  name: newName,
                },
              }
            : n,
        ),
      );
    },
    [nodes, supportedNodes, prepareDefaults],
  );

  const CustomNode = ({
    data,
  }: {
    data: WorkflowNodeData;
  }) => {
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
            <div className="text-[8px] text-gray-500">
              {data.job ?? "Custom node"}
            </div>
          </div>
        </div>

        {hasTarget && (
          <Handle
            type="target"
            position={Position.Top}
            className="w-16 !bg-gray-700"
          />
        )}
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-16 !bg-gray-700"
        />
      </div>
    );
  };

  const nodeTypes = { custom: CustomNode };

  const toSectionNodesFromBackend = (
    groupName: "trigger" | "action" | "logic",
  ) =>
    supportedNodes
      .filter((n) => {
        if (groupName === "trigger") return n.type === "TRIGGER";
        if (groupName === "logic")
          return n.key.includes(".logic.") || n.key.includes("logic.");
        return (
          n.type === "ACTION" &&
          !(n.key.includes(".logic.") || n.key.includes("logic."))
        );
      })
      .map((n) => ({
        id: n._id,
        label: n.title,
        desc: n.description ?? "",
        group: groupName,
      }));

  useEffect(() => {
    if (domains.length > 0 && !selectedDomainId) {
      setSelectedDomainId(domains[0].domainId);
      setSelectedDomainName(domains[0].domainName);
    }
  }, [domains, selectedDomainId]);

  useEffect(() => {
    if (isEmptyWorkflow) {
      setShowNodePanel(true);
    }
  }, [isEmptyWorkflow]);

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

  const handleResetWorkflow = useCallback(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, []);

  const handleCreateNode = (node: {
    id: string;
    label: string;
    group?: string;
    styles?: NodeStyles;
  }) => {
    const backendNode = supportedNodes.find((n) => n._id === node.id);
    const mergedDefaults = prepareDefaults(backendNode);
    const needsConfig =
      backendNode &&
      ((backendNode.metaSchema?.fields?.length ?? 0) > 0 ||
        Object.keys(mergedDefaults).length > 0 ||
        node.group === "trigger");

    if (needsConfig) {
      setEditingNodeId(null);
      setConfigValues(mergedDefaults);
      setConfigModal({
        node,
        defaults: mergedDefaults,
        metaSchema: backendNode?.metaSchema,
      });
      return;
    }

    const newNode: Node<WorkflowNodeData> = {
      id: `${node.label}-${Date.now()}`,
      type: "custom",
      position: { x: 250, y: 150 },
      data: {
        name: node.label,
        job: node.group === "trigger" ? "Trigger" : "Workflow node",
        group: node.group,
        styles: node.styles,
        nodeTypeId: node.id,
        metadata: {},
        onEdit: () => handleEditNode(newNode.id),
        onDelete: () => handleDeleteNode(newNode.id),
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setShowNodePanel(false);
  };

  const handleConfirmConfig = () => {
    if (!configModal.node) return;
    if (editingNodeId) {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === editingNodeId
            ? {
                ...n,
                data: {
                  ...n.data,
                  metadata: configValues,
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
          metadata: configValues,
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

  const handleCancelConfig = () => {
    setConfigModal({ node: null, defaults: {} });
    setConfigValues({});
    setEditingNodeId(null);
  };

  const toWorkflowPayload = (
    domainId: string,
    domain: string,
  ): CreateWorkflowRequest => {
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

    return {
      domainId,
      domain,
      workflowStatus: "PENDING",
      nodes: wfNodes,
      edges: wfEdges,
    };
  };

  const handleCreateWorkflow = async () => {
    if (!selectedDomainId || !selectedDomainName) {
      alert("Please select a domain.");
      return;
    }
    if (nodes.length === 0) {
      alert("Add at least one node before publishing.");
      return;
    }
    const missingNodeType = nodes.find((n) => !(n.data as WorkflowNodeData)?.nodeTypeId);
    if (missingNodeType) {
      alert(
        `Node "${missingNodeType.data.name}" is missing a NodeType. Please re-add it.`,
      );
      return;
    }

    try {
      const payload = toWorkflowPayload(selectedDomainId, selectedDomainName);
      await createWorkflow(payload);
      navigate("/workflow");
    } catch (err) {
      console.error(err);
      alert("Failed to create workflow");
    }
  };

  useEffect(() => {
    allNodes();
  }, []);

  return (
    <div>
      <div className="flex flex-col gap-2 mb-3">
        <div className="flex justify-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700">Domain</label>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={selectedDomainId}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedDomainId(id);
                const domainName =
                  domains.find((d) => d.domainId === id)?.domainName ?? "";
                setSelectedDomainName(domainName);
              }}
            >
              {domains.map((d) => (
                <option key={d.domainId} value={d.domainId}>
                  {d.domainName}
                </option>
              ))}
            </select>
          </div>

          <button
            className="px-4 py-1 rounded-md bg-black text-white hover:brightness-90"
            onClick={() => {
              handleCreateWorkflow();
            }}
          >
            Publish
          </button>
          <button
            className="px-4 py-1 rounded-md border border-gray-300 bg-white text-black hover:bg-gray-100"
            onClick={handleResetWorkflow}
          >
            Reset
          </button>
        </div>
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
          <div
            className="flex-1 bg-black/30"
            onClick={() => setShowNodePanel(false)}
          />

          {/* Side Panel */}
          <div className="w-[400px] bg-white border-l shadow-xl p-4 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Node</h3>
              <button onClick={() => setShowNodePanel(false)}>
                <div className="w-5 h-5 text-gray-500 hover:text-black">X</div>
              </button>
            </div>

            {/* Sections */}
            <NodeSection
              title="Triggers"
              nodes={toSectionNodesFromBackend("trigger")}
              onAdd={handleCreateNode}
            />

            {supportedNodesLoading && (
              <div className="text-xs text-gray-500 mt-2">Loading nodes…</div>
            )}
            {supportedNodesError && (
              <div className="text-xs text-red-600 mt-2">
                {supportedNodesError}
              </div>
            )}

            {!isEmptyWorkflow && (
              <>
                <NodeSection
                  title="AI Actions"
                  nodes={toSectionNodesFromBackend("action")}
                  onAdd={handleCreateNode}
                />

                <NodeSection
                  title="Logic"
                  nodes={toSectionNodesFromBackend("logic")}
                  onAdd={handleCreateNode}
                />
              </>
            )}
          </div>
        </div>
      )}

      {configModal.node && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30" onClick={handleCancelConfig} />
          <div className="w-[400px] bg-white border-l shadow-xl p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {configModal.node.group === "trigger"
                  ? "Configure Trigger"
                  : "Configure Action"}
              </h3>
              <button onClick={handleCancelConfig}>
                <div className="w-5 h-5 text-gray-500 hover:text-black">X</div>
              </button>
            </div>

            {(!configModal.metaSchema?.fields ||
              configModal.metaSchema.fields.length === 0) &&
              Object.keys(configModal.defaults).length === 0 && (
                <div className="text-sm text-gray-500 mb-3">
                  No metadata required for this trigger.
                </div>
              )}

            {configModal.metaSchema?.fields?.map((field) => {
              const rawValue = configValues[field.name];
              const isObject = rawValue && typeof rawValue === "object";
              const value = isObject
                ? JSON.stringify(rawValue, null, 2)
                : (rawValue ?? "");
              if (field.type === "select") {
                const options =
                  field.source === "domains"
                    ? domains.map((d) => ({
                        label: d.domainName,
                        value: d.domainId,
                      }))
                    : (field.options ?? []);
                return (
                  <label key={field.name} className="block mb-3 text-sm">
                    <span className="text-gray-600">
                      {field.label}
                      {field.required ? " *" : ""}
                    </span>
                    <select
                      className="mt-1 w-full border rounded px-2 py-1 text-sm"
                      value={String(value)}
                      onChange={(e) =>
                        setConfigValues((prev) => ({
                          ...prev,
                          [field.name]: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select</option>
                      {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                );
              }

              // default to text / textarea for objects
              return (
                <label key={field.name} className="block mb-3 text-sm">
                  <span className="text-gray-600">
                    {field.label}
                    {field.required ? " *" : ""}
                  </span>
                  {isObject ? (
                    <textarea
                      className="mt-1 w-full border rounded px-2 py-1 text-sm font-mono"
                      rows={4}
                      value={value as string}
                      onChange={(e) => {
                        const next = e.target.value;
                        try {
                          const parsed = JSON.parse(next);
                          setConfigValues((prev) => ({
                            ...prev,
                            [field.name]: parsed,
                          }));
                        } catch {
                          setConfigValues((prev) => ({
                            ...prev,
                            [field.name]: next,
                          }));
                        }
                      }}
                    />
                  ) : (
                    <input
                      className="mt-1 w-full border rounded px-2 py-1 text-sm"
                      value={String(value)}
                      onChange={(e) =>
                        setConfigValues((prev) => ({
                          ...prev,
                          [field.name]: e.target.value,
                        }))
                      }
                    />
                  )}
                </label>
              );
            })}

            {!configModal.metaSchema?.fields &&
              Object.entries(configModal.defaults).map(([key, value]) => (
                <label key={key} className="block mb-3 text-sm">
                  <span className="text-gray-600">{key}</span>
                  <input
                    className="mt-1 w-full border rounded px-2 py-1 text-sm"
                    value={String(configValues[key] ?? value ?? "")}
                    onChange={(e) =>
                      setConfigValues((prev) => ({
                        ...prev,
                        [key]: e.target.value,
                      }))
                    }
                  />
                </label>
              ))}

            <div className="flex gap-2 justify-end">
              <button
                className="px-3 py-1 rounded border"
                onClick={handleCancelConfig}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 rounded bg-black text-white"
                onClick={handleConfirmConfig}
              >
                {configModal.node.group === "trigger"
                  ? "Add trigger"
                  : "Add node"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
