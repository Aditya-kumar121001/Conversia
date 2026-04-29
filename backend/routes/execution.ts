import Router from 'express';
const router = Router();
import { GoogleGenAI } from '@google/genai';
import { systemPrompt } from '../utils'
import { InMemoryStore } from '../inMemoryStore';
import { enforceWorkflowLimit } from '../middlewares/planMiddleware';

import { Message } from '../models/Message';
import { Conversation } from "../models/Conversation";
import { Execution } from "../models/Execution"
import { Domain } from '../models/Domain';
import { authMiddleware } from '../middlewares/authMiddleware';
import { Node, Workflow } from '../models/Workflow';
import { executeWorkflow } from '../executor/workflowExecutor';

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

const aiClient = new GoogleGenAI({apiKey: process.env.GEMINI});
const memory = InMemoryStore.getInstance()

// Public: list all supported nodes (also seeds defaults)
router.get("/nodes", async (req, res) => {
    try {
        await Promise.all(
            defaultSupportedNodes.map((node) =>
                Node.findOneAndUpdate(
                    { key: node.key },
                    node,
                    { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true },
                ),
            ),
        );

        const nodes = await Node.find();
        res.status(200).json({
            message: "All supported nodes",
            nodes,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Failed to load supported nodes" });
    }
});

// Authenticated: get workflow by id
router.get("/by-id/:workflowId", authMiddleware, async (req, res) => {
    try {
        const workflow = await Workflow.findOne({
            _id: req.params.workflowId,
            userId: req.userId,
        });

        if (!workflow) return res.status(404).json({ message: "Workflow not found" });

        return res.status(200).json({ workflow });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Failed to fetch workflow" });
    }
});

// Authenticated: update workflow graph (nodes/edges/status)
router.put("/by-id/:workflowId", authMiddleware, async (req, res) => {
    try {
        const { nodes, edges, workflowStatus } = req.body ?? {};

        const update: Record<string, unknown> = {};
        if (Array.isArray(nodes)) update.nodes = nodes;
        if (Array.isArray(edges)) update.edges = edges;
        if (typeof workflowStatus === "string") update.workflowStatus = workflowStatus;

        const workflow = await Workflow.findOneAndUpdate(
            { _id: req.params.workflowId, userId: req.userId },
            { $set: update },
            { new: true },
        );

        if (!workflow) return res.status(404).json({ message: "Workflow not found" });

        return res.status(200).json({ message: "Workflow updated", workflow });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Failed to update workflow" });
    }
});

router.get("/:domain", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const domain = req.params.domain
    try{
        const workflows = await Workflow.find({userId, domain});
        res.status(200).json({
            workflows
        })
    } catch(e){
        console.error(e);
        return res.status(500).json({ message: "Failed to fetch workflows" });
    }
});

router.post("/create-workflow", authMiddleware, enforceWorkflowLimit(), async (req, res) => {
    const userId = req.userId;
    const data = req.body;

    if (!data) return res.status(403).json({
        message: "Incorrect inputs"
    });

    try {
        const workflow = await Workflow.create({
            userId,
            domainId: data.domainId,
            domain: data.domain,
            workflowStatus: data.workflowStatus ?? "PENDING",
            nodes: data.nodes,
            edges: data.edges
        });
        res.status(200).json({
            message: "Workflow created",
            id: workflow._id
        })
    } catch (e) {
        console.log(e)
        res.status(411).json({
            message: "Failed to create workflow"
        })
    }
});

router.post("/executions/:workflowId", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const workflowId = req.params.workflowId;
    const triggerPayload = req.body; // any manual test payload

    try {
        const workflow = await Workflow.findOne({ _id: workflowId, userId });
        if (!workflow) return res.status(404).json({ message: "Workflow not found" });

        // Create execution record immediately so frontend gets an ID
        const execution = await Execution.create({
            workflowId: workflow._id,
            userId,
            status: "RUNNING",
            startedAt: new Date(),
            steps: [],
        });

        // Run async — don't await, respond immediately
        executeWorkflow(workflowId, triggerPayload, execution._id.toString(), { force: true })
            .catch(err => console.error("Execution error:", err));

        res.status(202).json({
            message: "Execution started",
            executionId: execution._id,
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Failed to start execution" });
    }
});

router.get("/executions/:executionId/status", authMiddleware, async (req, res) => {
    try {
        const execution = await Execution.findById(req.params.executionId);
        if (!execution) return res.status(404).json({ message: "Not found" });

        res.status(200).json({ execution });
    } catch (e) {
        res.status(500).json({ message: "Failed to fetch execution" });
    }
});

// List all executions for a workflow
router.get("/:workflowId/executions", authMiddleware, async (req, res) => {
    try {
        const executions = await Execution.find({
            workflowId: req.params.workflowId,
            userId: req.userId,
        }).sort({ startedAt: -1 }).limit(20);

        res.status(200).json({ executions });
    } catch (e) {
        res.status(500).json({ message: "Failed to fetch executions" });
    }
});

export default router;