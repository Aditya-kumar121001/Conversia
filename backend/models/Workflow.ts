import mongoose, { Document, Schema } from "mongoose";

export enum WorkflowStatus {
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
  NodeType: mongoose.Types.ObjectId;
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
      type: Schema.Types.ObjectId,
      ref: "Node",
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
  type: string
}

const nodeSchema = new Schema<Node>(
  {
    title:{
      type: String,
      reuqired: true
    },
    description: {
      type: String,
    },
    type: {
      type: String, enum: ["ACTION", "TRIGGER"],
      required: true
    },

  }
)

export interface Execution extends Document{
  workflowId: mongoose.Types.ObjectId;
  executionStatus: String;
  startTime: Date;
  endTime: Date;
}

const executionSchema = new Schema({
  workflowId: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "Workflow"
  },
  executionStatus: {
    type: String, enum: ["PENDING", "FINISHED"],
    required: true
  },
  startTime: {
    type: Date, default: Date.now(),
    required: true
  },
  endTime: {
    type: Date,
  }
})

export const Workflow = mongoose.model<Workflow>("Workflow", workflowSchema);
export const Node = mongoose.model<Node>("Node", nodeSchema)
export const Execution = mongoose.model<Execution>("Execution", executionSchema);

