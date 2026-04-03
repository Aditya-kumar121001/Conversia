import mongoose, { Document, Schema } from "mongoose";

export enum WorkflowStatus {
  ACTIVE = "ACTIVE",
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

export interface Edge extends Document {
  id: string;
  source: string;
  target: string;
}

export interface NodeMetadata extends Document {
  kind: string;
  metadata: string;
}

export interface Node extends Document {
  id: string;
  position: Position;
  // Catalog node identifier. Prefer storing the node `key` (e.g. "conversia.ai.extract").
  // Backward-compatible: older workflows may still store a Node catalog _id.
  NodeType: string;
  nodeData: NodeMetadata;
}

export interface Position extends Document {
  x: number;
  y: number;
}

export interface Workflow extends Document {
  userId: mongoose.Types.ObjectId;
  domainId: mongoose.Types.ObjectId;
  domain: string;
  workflowStatus: WorkflowStatus;
  nodes: [{}];
  edges: [{}];
}

const NodeMetadataSchema = new Schema<NodeMetadata>(
  {
    kind: {
      type: String,
      enum: ["ACTION", "TRIGGER"],
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  { _id: false },
);

const WorkflowNodeSchema = new Schema<Node>(
  {
    id: {
      type: String,
      required: true,
    },
    NodeType: {
      type: Schema.Types.Mixed,
      required: true,
    },
    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
    },
    nodeData: NodeMetadataSchema,
  },
  {
    _id: false,
  },
);

const EdgesSchema = new Schema<Edge>(
  {
    id: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      required: true,
    },
    target: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  },
);

const workflowSchema = new Schema<Workflow>(
  {
    userId: {type: Schema.Types.ObjectId, required: true, ref: "User"},
    domainId: { type: Schema.Types.ObjectId, required: true, ref: "Domain" },
    domain: { type: String, required: true },
    workflowStatus: {
      type: String,
      enum: Object.values(WorkflowStatus),
      required: true,
    },
    nodes: [WorkflowNodeSchema],
    edges: [EdgesSchema],
  },
  { timestamps: true },
);

export interface Node extends Document {
  title: string,
  description: string,
  type: string,
  key: string,
}

const nodeSchema = new Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
  },

  type: {
    type: String,
    enum: ["ACTION", "TRIGGER"],
    required: true,
  },

  config: {
    type: Schema.Types.Mixed,
    default: {},
  },

  metaSchema: {
    fields: [
      {
        name: { type: String, required: true },
        label: String,
        type: {
          type: String,
          enum: ["text", "number", "select", "boolean", "json", "textarea"],
          required: true,
        },
        required: { type: Boolean, default: false },
        placeholder: String,
        default: Schema.Types.Mixed,
        showIf: String,
        options: [
          {
            label: String,
            value: Schema.Types.Mixed,
          },
        ],
      },
    ],
  },
});

export const Workflow = mongoose.model<Workflow>("Workflow", workflowSchema);
export const Node = mongoose.model<Node>("Node", nodeSchema)
