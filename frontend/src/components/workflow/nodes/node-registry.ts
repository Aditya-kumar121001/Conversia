/* eslint-disable @typescript-eslint/no-explicit-any */

/* =========================================================
   CORE TYPES
========================================================= */

export type NodeGroup = "trigger" | "action" | "logic";

export interface ConversiaNodeStyle {
  color: string;
  borderClass: string;
  backgroundClass: string;
  textClass?: string;
}

export interface ConversiaNodeProperty {
  displayName: string;
  name: string;
  type: "string" | "number" | "boolean" | "options" | "json";
  required?: boolean;
  default?: any;
  options?: { name: string; value: any }[];
}

export interface ConversiaNodeType {
  description: {
    displayName: string;
    name: string;
    type: string; // unique node type ID
    version: number;
    group: NodeGroup[];
    icon: string;
    premium?: boolean;
    styles: ConversiaNodeStyle;
    inputs: string[];
    outputs: string[];
    properties: ConversiaNodeProperty[];
  };

  execute?: (ctx: any) => Promise<any>;
}

/* =========================================================
   TRIGGERS
========================================================= */

const ChatTrigger: ConversiaNodeType = {
  description: {
    displayName: "Chat Started",
    name: "chatTrigger",
    type: "conversia.chat.trigger",
    version: 1,
    group: ["trigger"],
    icon: "message-circle",
    inputs: [],
    outputs: ["main"],
    styles: {
      color: "#0ea5e9",
      borderClass: "border-sky-400",
      backgroundClass: "bg-sky-50",
      textClass: "text-sky-700",
    },
    properties: [
      {
        displayName: "Greeting Message",
        name: "greeting",
        type: "string",
        default: "Hi! How can I help you today?",
      },
    ],
  },
};

const VoiceCallTrigger: ConversiaNodeType = {
  description: {
    displayName: "Incoming Call",
    name: "voiceTrigger",
    type: "conversia.voice.trigger",
    version: 1,
    group: ["trigger"],
    icon: "phone",
    inputs: [],
    outputs: ["main"],
    styles: {
      color: "#22c55e",
      borderClass: "border-green-400",
      backgroundClass: "bg-green-50",
      textClass: "text-green-700",
    },
    properties: [
      {
        displayName: "Language",
        name: "language",
        type: "options",
        default: "en",
        options: [
          { name: "English", value: "en" },
          { name: "Hindi", value: "hi" },
        ],
      },
    ],
  },
};

/* =========================================================
   AI ACTIONS
========================================================= */

const AIReply: ConversiaNodeType = {
  description: {
    displayName: "AI Reply",
    name: "aiReply",
    type: "conversia.ai.reply",
    version: 1,
    group: ["action"],
    icon: "sparkles",
    premium: true,
    inputs: ["main"],
    outputs: ["main"],
    styles: {
      color: "#8b5cf6",
      borderClass: "border-violet-400",
      backgroundClass: "bg-violet-50",
      textClass: "text-violet-700",
    },
    properties: [
      {
        displayName: "System Prompt",
        name: "prompt",
        type: "string",
        required: true,
      },
      {
        displayName: "Model",
        name: "model",
        type: "options",
        default: "gpt-4",
        options: [
          { name: "GPT-4", value: "gpt-4" },
          { name: "GPT-3.5", value: "gpt-3.5" },
        ],
      },
    ],
  },
};

const TextToSpeech: ConversiaNodeType = {
  description: {
    displayName: "Text to Speech",
    name: "tts",
    type: "conversia.voice.tts",
    version: 1,
    group: ["action"],
    icon: "volume-2",
    premium: true,
    inputs: ["main"],
    outputs: ["main"],
    styles: {
      color: "#f59e0b",
      borderClass: "border-amber-400",
      backgroundClass: "bg-amber-50",
      textClass: "text-amber-700",
    },
    properties: [
      {
        displayName: "Voice Style",
        name: "voiceStyle",
        type: "options",
        default: "neutral",
        options: [
          { name: "Neutral", value: "neutral" },
          { name: "Friendly", value: "friendly" },
          { name: "Professional", value: "professional" },
        ],
      },
    ],
  },
};

/* =========================================================
   LOGIC / FLOW CONTROL
========================================================= */

const ConditionNode: ConversiaNodeType = {
  description: {
    displayName: "Condition",
    name: "condition",
    type: "conversia.logic.condition",
    version: 1,
    group: ["logic"],
    icon: "git-branch",
    inputs: ["main"],
    outputs: ["true", "false"],
    styles: {
      color: "#f97316",
      borderClass: "border-orange-400",
      backgroundClass: "bg-orange-50",
      textClass: "text-orange-700",
    },
    properties: [
      {
        displayName: "Condition Expression",
        name: "expression",
        type: "string",
        required: true,
      },
    ],
  },
};

const DelayNode: ConversiaNodeType = {
  description: {
    displayName: "Delay",
    name: "delay",
    type: "conversia.logic.delay",
    version: 1,
    group: ["logic"],
    icon: "clock",
    inputs: ["main"],
    outputs: ["main"],
    styles: {
      color: "#64748b",
      borderClass: "border-slate-400",
      backgroundClass: "bg-slate-50",
      textClass: "text-slate-700",
    },
    properties: [
      {
        displayName: "Delay (seconds)",
        name: "seconds",
        type: "number",
        default: 1,
      },
    ],
  },
};

/* =========================================================
   NODE REGISTRY (n8n-style)
========================================================= */

export const CONVERSIA_NODES: Record<string, ConversiaNodeType> = {
  // Triggers
  [ChatTrigger.description.type]: ChatTrigger,
  [VoiceCallTrigger.description.type]: VoiceCallTrigger,

  // Actions
  [AIReply.description.type]: AIReply,
  [TextToSpeech.description.type]: TextToSpeech,

  // Logic
  [ConditionNode.description.type]: ConditionNode,
  [DelayNode.description.type]: DelayNode,
};

/* =========================================================
   HELPERS (USED BY UI)
========================================================= */

export const ALL_NODES = Object.values(CONVERSIA_NODES);

export const NODES_BY_GROUP: Record<NodeGroup, ConversiaNodeType[]> = {
  trigger: ALL_NODES.filter((n) =>
    n.description.group.includes("trigger")
  ),
  action: ALL_NODES.filter((n) =>
    n.description.group.includes("action")
  ),
  logic: ALL_NODES.filter((n) =>
    n.description.group.includes("logic")
  ),
};
