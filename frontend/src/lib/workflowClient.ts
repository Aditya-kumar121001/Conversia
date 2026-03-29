import { BACKEND_URL } from "./utils";

export type WorkflowStatus = "PENDING" | "RUNNING" | "SUCCESS" | "FAILED" | "CANCELLED";
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

export async function startExecution(workflowId: string, token?: string): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/workflow/executions/${workflowId}`, {
    method: "POST",
    headers: {
      ...withAuth(token),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to start execution (${res.status}): ${text || res.statusText}`);
  }
}
