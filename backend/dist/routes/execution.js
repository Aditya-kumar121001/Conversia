"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = (0, express_1.default)();
const genai_1 = require("@google/genai");
const inMemoryStore_1 = require("../inMemoryStore");
const planMiddleware_1 = require("../middlewares/planMiddleware");
const Execution_1 = require("../models/Execution");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const Workflow_1 = require("../models/Workflow");
const workflowExecutor_1 = require("../executor/workflowExecutor");
const rateLimiter_1 = require("../middlewares/rateLimiter");
const defaultSupportedNodes = [
    {
        title: "Conversation Started",
        description: "Fires when a new conversation is created",
        type: "TRIGGER",
        key: "conversia.conversation.trigger",
        config: {},
        metaSchema: { fields: [] },
    },
    {
        title: "Conversation Completed",
        description: "Fires when a conversation is completed",
        type: "TRIGGER",
        key: "conversia.conversation.completed",
        config: {},
        metaSchema: { fields: [] },
    },
    {
        title: "Send Reply",
        description: "Send a reply to the user via the chatbot",
        type: "ACTION",
        key: "conversia.action.reply",
        config: {},
        metaSchema: { fields: [] },
    },
    {
        title: "Delay",
        description: "Pause before running the next step",
        type: "ACTION",
        key: "conversia.logic.delay",
        config: {},
        metaSchema: {
            fields: [
                {
                    name: "delayMs",
                    label: "Delay (ms)",
                    type: "number",
                    required: true,
                },
            ],
        },
    },
];
const aiClient = new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI });
const memory = inMemoryStore_1.InMemoryStore.getInstance();
// Public: list all supported nodes (also seeds defaults)
router.get("/nodes", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield Promise.all(defaultSupportedNodes.map((node) => Workflow_1.Node.findOneAndUpdate({ key: node.key }, node, { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true })));
        const nodes = yield Workflow_1.Node.find();
        res.status(200).json({
            message: "All supported nodes",
            nodes,
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "Failed to load supported nodes" });
    }
}));
// Authenticated: get workflow by id
router.get("/by-id/:workflowId", authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const workflow = yield Workflow_1.Workflow.findOne({
            _id: req.params.workflowId,
            userId: req.userId,
        });
        if (!workflow)
            return res.status(404).json({ message: "Workflow not found" });
        return res.status(200).json({ workflow });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Failed to fetch workflow" });
    }
}));
// Authenticated: update workflow graph (nodes/edges/status)
router.put("/by-id/:workflowId", authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { nodes, edges, workflowStatus } = (_a = req.body) !== null && _a !== void 0 ? _a : {};
        const update = {};
        if (Array.isArray(nodes))
            update.nodes = nodes;
        if (Array.isArray(edges))
            update.edges = edges;
        if (typeof workflowStatus === "string")
            update.workflowStatus = workflowStatus;
        const workflow = yield Workflow_1.Workflow.findOneAndUpdate({ _id: req.params.workflowId, userId: req.userId }, { $set: update }, { new: true });
        if (!workflow)
            return res.status(404).json({ message: "Workflow not found" });
        return res.status(200).json({ message: "Workflow updated", workflow });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Failed to update workflow" });
    }
}));
router.get("/:domain", authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const domain = req.params.domain;
    try {
        const workflows = yield Workflow_1.Workflow.find({ userId, domain });
        res.status(200).json({
            workflows
        });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Failed to fetch workflows" });
    }
}));
router.post("/create-workflow", authMiddleware_1.authMiddleware, rateLimiter_1.workflowCreateLimiter, (0, planMiddleware_1.enforceWorkflowLimit)(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = req.userId;
    const data = req.body;
    if (!data)
        return res.status(403).json({
            message: "Incorrect inputs"
        });
    try {
        const workflow = yield Workflow_1.Workflow.create({
            userId,
            domainId: data.domainId,
            domain: data.domain,
            workflowStatus: (_a = data.workflowStatus) !== null && _a !== void 0 ? _a : "PENDING",
            nodes: data.nodes,
            edges: data.edges
        });
        res.status(200).json({
            message: "Workflow created",
            id: workflow._id
        });
    }
    catch (e) {
        console.log(e);
        res.status(411).json({
            message: "Failed to create workflow"
        });
    }
}));
router.post("/executions/:workflowId", authMiddleware_1.authMiddleware, rateLimiter_1.executionLimiter, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const workflowId = req.params.workflowId;
    const triggerPayload = req.body; // any manual test payload
    try {
        const workflow = yield Workflow_1.Workflow.findOne({ _id: workflowId, userId });
        if (!workflow)
            return res.status(404).json({ message: "Workflow not found" });
        // Create execution record immediately so frontend gets an ID
        const execution = yield Execution_1.Execution.create({
            workflowId: workflow._id,
            userId,
            status: "RUNNING",
            startedAt: new Date(),
            steps: [],
        });
        // Run async — don't await, respond immediately
        (0, workflowExecutor_1.executeWorkflow)(workflowId, triggerPayload, execution._id.toString(), { force: true })
            .catch(err => console.error("Execution error:", err));
        res.status(202).json({
            message: "Execution started",
            executionId: execution._id,
        });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ message: "Failed to start execution" });
    }
}));
router.get("/executions/:executionId/status", authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const execution = yield Execution_1.Execution.findById(req.params.executionId);
        if (!execution)
            return res.status(404).json({ message: "Not found" });
        res.status(200).json({ execution });
    }
    catch (e) {
        res.status(500).json({ message: "Failed to fetch execution" });
    }
}));
// List all executions for a workflow
router.get("/:workflowId/executions", authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const executions = yield Execution_1.Execution.find({
            workflowId: req.params.workflowId,
            userId: req.userId,
        }).sort({ startedAt: -1 }).limit(20);
        res.status(200).json({ executions });
    }
    catch (e) {
        res.status(500).json({ message: "Failed to fetch executions" });
    }
}));
exports.default = router;
//# sourceMappingURL=execution.js.map