import Router from 'express';
const router = Router();
import { GoogleGenAI } from '@google/genai';
import { systemPrompt } from '../utils'
import { InMemoryStore } from '../inMemoryStore';

import { Message } from '../models/Message';
import { Conversation } from "../models/Conversation";
import { Execution } from "../models/Execution"
import { Domain } from '../models/Domain';
import { authMiddleware } from '../middlewares/authMiddleware';
import { Node, Workflow } from '../models/Workflow';

const aiClient = new GoogleGenAI({apiKey: process.env.GEMINI});
const memory = InMemoryStore.getInstance()

router.post("/create-workflow", authMiddleware, async (req, res) => {
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

router.get("/executions/:workflowId", (req, res) => {
    
});

router.post("/credentials", (req, res) => {
    
})

router.get("/nodes", async (req, res) => {
    const nodes = await Node.find();
    res.status(200).json({
        message: "All supported nodes",
        nodes
    })
})

export default router;