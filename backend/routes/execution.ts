import Router from 'express';
const router = Router();
import { GoogleGenAI } from '@google/genai';
import { systemPrompt } from '../utils'
import { InMemoryStore } from '../inMemoryStore';

import { Message } from '../models/Message';
import { Conversation } from "../models/Conversation";
import { Execution } from "../models/Execution"
import { Domain } from '../models/Domain';

const aiClient = new GoogleGenAI({apiKey: process.env.GEMINI});
const memory = InMemoryStore.getInstance()

router.get("/workflow/:workflowId", async (req, res) => {
    
});

router.get("/executions/:workflowId", (req, res) => {

});

router.post("/credentials", (req, res) => {
    
})




export default router;