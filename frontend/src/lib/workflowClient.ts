import { BACKEND_URL } from "./utils";

export type WorkflowStatus = "ACTIVE" | "PENDING" | "RUNNING" | "SUCCESS" | "FAILED" | "CANCELLED";
export type ExecutionStatus = "PENDING" | "FINISHED";

export type Position = {
  x: number;
  y: number;
};

export type NodeMetadata = {
  kind: "ACTION" | "TRIGGER";
  metadata: Record<string, unknown>;
};

export type WorkflowNode = {
  id: string;
  NodeType: string; // Mongo ObjectId of the catalog node
  position: Position;
  nodeData: NodeMetadata;
};

export type WorkflowEdge = {
  id: string;
  source: string;
  target: string;
};

export type CreateWorkflowRequest = {
  domainId: string;
  domain: string;
  workflowStatus?: WorkflowStatus;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
};

export type CreateWorkflowResponse = {
  id: string;
  message: string;
};

export type WorkflowRecord = {
  _id: string;
  domainId: string;
  domain: string;
  workflowStatus?: WorkflowStatus;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt?: string;
  updatedAt?: string;
};

export type NodeDefinition = {
  _id: string;
  title: string;
  description?: string;
  type: "ACTION" | "TRIGGER";
  key?: string;
  config?: unknown;
  metaSchema?: {
    fields?: {
      name: string;
      label?: string;
      type: "text" | "number" | "select" | "boolean" | "json" | "textarea";
      required?: boolean;
      placeholder?: string;
      default?: unknown;
      showIf?: string;
      source?: "domains";
      options?: { label?: string; value: unknown }[];
    }[];
  };
};

const withAuth = (token?: string) => {
  const resolved = token ?? (typeof window !== "undefined" ? localStorage.getItem("token") : null);
  if (!resolved) throw new Error("Missing auth token");
  return {
    Authorization: `Bearer ${resolved}`,
  } as const;
};

export async function fetchSupportedNodes(): Promise<NodeDefinition[]> {
  const res = await fetch(`${BACKEND_URL}/workflow/nodes`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch nodes (${res.status})`);
  }

  const json = await res.json();
  const nodes = Array.isArray(json?.nodes) ? json.nodes : [];
  return nodes as NodeDefinition[];
}

export async function createWorkflow(
  payload: CreateWorkflowRequest,
  token?: string,
): Promise<CreateWorkflowResponse> {
  const res = await fetch(`${BACKEND_URL}/workflow/create-workflow`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...withAuth(token),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create workflow (${res.status}): ${text || res.statusText}`);
  }

  const json = await res.json();
  return {
    id: json?.id as string,
    message: json?.message as string,
  };
}

export async function fetchUserWorkflows(token?: string, domain?: string): Promise<WorkflowRecord[]> {
  const res = await fetch(`${BACKEND_URL}/workflow/${domain}`, {
    method: "GET",
    headers: {
      ...withAuth(token),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch workflows (${res.status}): ${text || res.statusText}`);
  }

  const json = await res.json();
  const workflows = Array.isArray(json?.workflows) ? json.workflows : [];
  return workflows as WorkflowRecord[];
}

export async function fetchWorkflowById(workflowId: string, token?: string): Promise<WorkflowRecord> {
  const res = await fetch(`${BACKEND_URL}/workflow/by-id/${workflowId}`, {
    method: "GET",
    headers: {
      ...withAuth(token),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch workflow (${res.status}): ${text || res.statusText}`);
  }

  const json = await res.json();
  return json?.workflow as WorkflowRecord;
}

export async function updateWorkflow(
  workflowId: string,
  payload: Pick<CreateWorkflowRequest, "nodes" | "edges"> & { workflowStatus?: WorkflowStatus },
  token?: string,
): Promise<WorkflowRecord> {
  const res = await fetch(`${BACKEND_URL}/workflow/by-id/${workflowId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...withAuth(token),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to update workflow (${res.status}): ${text || res.statusText}`);
  }

  const json = await res.json();
  return json?.workflow as WorkflowRecord;
}

export async function startExecution(
  workflowId: string,
  triggerPayload: unknown = {},
  token?: string,
): Promise<{ executionId: string }> {
  const res = await fetch(`${BACKEND_URL}/workflow/executions/${workflowId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...withAuth(token),
    },
    body: JSON.stringify(triggerPayload ?? {}),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to start execution (${res.status}): ${text || res.statusText}`);
  }

  const json = await res.json();
  return { executionId: String(json?.executionId ?? "") };
}

export type ExecutionLog = {
  _id: string; // matches backend
  workflowId: string;
  status: "COMPLETED" | "FAILED" | "PENDING" | "RUNNING";
  startedAt: string;
  completedAt?: string;
  triggerPayload?: any;
  logs: any[];
  error?: string;
};

export async function fetchExecutions(workflowId: string, token?: string): Promise<ExecutionLog[]> {
  const res = await fetch(`${BACKEND_URL}/workflow/${workflowId}/executions`, {
    method: "GET",
    headers: {
      ...withAuth(token),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch executions (${res.status}): ${text || res.statusText}`);
  }

  const json = await res.json();
  return (json?.executions ?? []) as ExecutionLog[];
}
