import { useState, useCallback, useEffect, useRef } from "react";
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
  const [supportedNodes, setSupportedNodes] = useState<SupportedWorkflowNode[]>(
    [],
  );
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
        type: "select" | "text" | "number" | "boolean" | "json" | "textarea";
        required?: boolean;
        options?: { label: string; value: string }[];
        source?: "domains";
        placeholder?: string;
        default?: unknown;
        showIf?: string;
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
        type: "select" | "text" | "number" | "boolean" | "json" | "textarea";
        required?: boolean;
        options?: { label: string; value: string }[];
        source?: "domains";
        placeholder?: string;
        default?: unknown;
        showIf?: string;
      }[];
    };
  };

  const [executionState, setExecutionState] = useState<{
    executionId: string | null;
    status: "IDLE" | "RUNNING" | "COMPLETED" | "FAILED";
    steps: Array<{
      nodeId: string;
      nodeKey: string;
      status: "SUCCESS" | "FAILED";
      output?: unknown;
      error?: string;
      durationMs: number;
    }>;
    error: string | null;
  }>({ executionId: null, status: "IDLE", steps: [], error: null });

  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [showExecutionPanel, setShowExecutionPanel] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const prepareDefaults = useCallback(
    (backendNode?: SupportedWorkflowNode) => {
      const defaults =
        backendNode &&
        backendNode.config &&
        typeof backendNode.config === "object"
          ? { ...(backendNode.config as Record<string, unknown>) }
          : {};

      backendNode?.metaSchema?.fields?.forEach((f) => {
        if (defaults[f.name] === undefined) {
          if (f.source === "domains" && selectedDomainId) {
            defaults[f.name] = selectedDomainId;
            return;
          }
          if (f.default !== undefined) {
            defaults[f.name] = f.default as unknown;
            return;
          }
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
      console.log(data);
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
        ? supportedNodes.find((n) => n.key === nodeTypeId) ?? supportedNodes.find((n) => n._id === nodeTypeId)
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
            label:
              typeof data.name === "string"
                ? data.name
                : String(data.name ?? ""),
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
        id: n.key,
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
      setNodes(
        (nodesSnapshot) =>
          applyNodeChanges(
            changes,
            nodesSnapshot,
          ) as unknown as Node<WorkflowNodeData>[],
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
    const backendNode = supportedNodes.find((n) => n.key === node.id);
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
        // Store catalog node key in workflow graph
        nodeTypeId: backendNode?.key ?? node.id,
        metadata: {},
        onEdit: () => handleEditNode(newNode.id),
        onDelete: () => handleDeleteNode(newNode.id),
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setShowNodePanel(false);
  };

  const isFieldVisible = (
    field: {
      showIf?: string;
      name: string;
    },
    values: Record<string, unknown>,
  ) => {
    if (!field.showIf) return true;
    const match = field.showIf.match(/^(\w+)\s*==\s*['"]?(.*?)['"]?$/);
    if (!match) return true;
    const [, lhs, rhs] = match;
    return String(values[lhs]) === rhs;
  };

  const handleConfirmConfig = () => {
    if (!configModal.node) return;

    const fields = configModal.metaSchema?.fields ?? [];

    // Validate and normalize JSON fields before saving.
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
      if (field.required && isFieldVisible(field, configValues)) {
        const val = normalizedValues[field.name];
        if (val === undefined || val === null || String(val).trim() === "") {
          return true;
        }
      }
      return false;
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

  const handleCancelConfig = () => {
    setConfigModal({ node: null, defaults: {} });
    setConfigValues({});
    setEditingNodeId(null);
  };

  const toWorkflowPayload = (
    domainId: string,
    domain: string,
    workflowStatus: NonNullable<CreateWorkflowRequest["workflowStatus"]> = "ACTIVE",
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
      workflowStatus,
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
    const missingNodeType = nodes.find(
      (n) => !(n.data as WorkflowNodeData)?.nodeTypeId,
    );
    if (missingNodeType) {
      alert(
        `Node "${missingNodeType.data.name}" is missing a NodeType. Please re-add it.`,
      );
      return;
    }

    const workflowStatus = "ACTIVE";

    try {
      const payload = toWorkflowPayload(selectedDomainId, selectedDomainName, workflowStatus);
      await createWorkflow(payload);
      navigate("/workflow");
    } catch (err) {
      console.error(err);
      alert("Failed to create workflow");
    }
  };

  const executeWorkflow = async () => {
    if (nodes.length === 0) {
      alert("Add at least one node before running.");
      return;
    }

    let idToExecute = workflowId;

    // Auto-save workflow if not yet saved
    if (!idToExecute) {
      if (!selectedDomainId || !selectedDomainName) {
        alert("Please select a domain before running.");
        return;
      }
      try {
        const payload = toWorkflowPayload(selectedDomainId, selectedDomainName);
        const created = await createWorkflow(payload); // make sure createWorkflow returns { id }
        idToExecute = created.id;
        setWorkflowId(created.id);
      } catch (err) {
        console.error(err);
        alert("Failed to save workflow before execution.");
        return;
      }
    }

    // Reset state & open panel
    if (pollRef.current) clearInterval(pollRef.current);
    setExecutionState({
      executionId: null,
      status: "RUNNING",
      steps: [],
      error: null,
    });
    setShowExecutionPanel(true);

    // Kick off execution
    let executionId: string;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${BACKEND_URL}/workflow/executions/${idToExecute}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ 
            text: "Hello, I would like to book an appointment for tomorrow. Budget is $500.",
            conversation: {
              text: "Hello, I would like to book an appointment for tomorrow. Budget is $500."
            }
          }),
        },
      );

      const data = await res.json();
      if (!res.ok || !data.executionId)
        throw new Error(data.message ?? "Execution failed to start");
      executionId = data.executionId;
      setExecutionState((prev) => ({ ...prev, executionId }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start execution";
      setExecutionState({
        executionId: null,
        status: "FAILED",
        steps: [],
        error: message,
      });
      return;
    }

    // Poll for status
    const token = localStorage.getItem("token");
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/workflow/executions/${executionId}/status`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = await res.json();
        const exec = data.execution;

        setExecutionState({
          executionId,
          status: exec.status,
          steps: exec.steps ?? [],
          error: null,
        });

        if (["COMPLETED", "FAILED"].includes(exec.status)) {
          clearInterval(pollRef.current!);
        }
      } catch {
        clearInterval(pollRef.current!);
        setExecutionState((prev) => ({
          ...prev,
          status: "FAILED",
          error: "Lost connection while polling",
        }));
      }
    }, 1500);
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
                onClick={() => executeWorkflow()}
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
              if (!isFieldVisible(field, configValues)) return null;

              const rawValue =
                configValues[field.name] ?? (field.default as unknown) ?? "";
              const isObject = rawValue && typeof rawValue === "object";
              const value = isObject
                ? JSON.stringify(rawValue, null, 2)
                : (rawValue as string | number | boolean | "");

              const label = (
                <span className="text-gray-600">
                  {field.label}
                  {field.required ? " *" : ""}
                </span>
              );

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
                    {label}
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

              if (field.type === "boolean") {
                return (
                  <label
                    key={field.name}
                    className="flex items-center gap-2 mb-3 text-sm"
                  >
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
                      value={
                        value === undefined || value === null
                          ? ""
                          : String(value)
                      }
                      onChange={(e) =>
                        setConfigValues((prev) => ({
                          ...prev,
                          [field.name]:
                            e.target.value === "" ? "" : Number(e.target.value),
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
                  </label>
                );
              }

              // default to text input
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

      {showExecutionPanel && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/30"
            onClick={() => {
              setShowExecutionPanel(false);
              if (pollRef.current) clearInterval(pollRef.current);
            }}
          />
          <div className="w-[500px] bg-white border-l shadow-xl p-4 overflow-y-auto flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Execution</h3>
              <button
                onClick={() => {
                  setShowExecutionPanel(false);
                  if (pollRef.current) clearInterval(pollRef.current);
                }}
              >
                <span className="text-gray-500 hover:text-black text-sm">
                  ✕
                </span>
              </button>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  executionState.status === "COMPLETED"
                    ? "bg-green-100 text-green-700"
                    : executionState.status === "FAILED"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {executionState.status}
              </span>
              {executionState.status === "RUNNING" && (
                <span className="text-xs text-gray-400 animate-pulse">
                  polling…
                </span>
              )}
              {executionState.executionId && (
                <span className="text-xs text-gray-300 truncate">
                  {executionState.executionId}
                </span>
              )}
            </div>

            {/* Error */}
            {executionState.error && (
              <div className="text-sm text-red-600 bg-red-50 rounded p-3">
                {executionState.error}
              </div>
            )}

            {/* Steps */}
            <div className="flex flex-col gap-2">
              {executionState.steps.length === 0 &&
                executionState.status === "RUNNING" && (
                  <p className="text-sm text-gray-400 animate-pulse">
                    Waiting for steps…
                  </p>
                )}

              {executionState.steps.map((step, i) => (
                <div
                  key={i}
                  className="border rounded-lg p-3 flex flex-col gap-1"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        step.status === "SUCCESS"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {step.status}
                    </span>
                    <span className="text-sm font-medium text-gray-800 truncate">
                      {step.nodeId}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400">
                    {step.nodeKey} · {step.durationMs}ms
                  </p>

                  {step.error && (
                    <p className="text-xs text-red-500 mt-1">{step.error}</p>
                  )}

                  {Boolean(step.output) && (
                    <pre className="text-xs bg-gray-50 rounded p-2 mt-1 overflow-x-auto max-h-40">
                      {JSON.stringify(step.output, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>

            {/* Re-run */}
            {["COMPLETED", "FAILED"].includes(executionState.status) && (
              <button
                className="mt-auto px-4 py-2 bg-black text-white text-sm rounded-lg hover:brightness-90"
                onClick={executeWorkflow}
              >
                Run Again
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
