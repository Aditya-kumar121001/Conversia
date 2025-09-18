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
const elevenlabs_js_1 = require("@elevenlabs/elevenlabs-js");
const personalAgents_1 = require("../personalAgents");
const router = (0, express_1.default)();
const client = new elevenlabs_js_1.ElevenLabsClient({ apiKey: process.env.ELEVEN });
const authMiddleware_1 = require("../middlewares/authMiddleware");
const Agent_1 = require("../models/Agent");
//create a new agent
router.post("/new-agent", authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    console.log(`user id: ${userId}`);
    if (!userId) {
        return res.status(401).send("Unauthorzised User");
    }
    const { name, agentType, agentSubtype } = req.body;
    if (!name || !agentType || !agentSubtype) {
        return res
            .status(400)
            .json({ success: false, message: "Missing required fields" });
    }
    const agentObj = personalAgents_1.personalAgents.find((a) => a.title === agentSubtype);
    const firstMessage = agentObj && agentObj.firstMessage ? agentObj.firstMessage : "";
    const systemPrompt = agentObj && agentObj.systemPrompt ? agentObj.systemPrompt : "";
    try {
        const agentId = yield client.conversationalAi.agents.create({
            name: name,
            conversationConfig: {
                agent: {
                    firstMessage: firstMessage,
                    prompt: {
                        prompt: systemPrompt,
                    },
                },
            },
        });
        if (!agentId) {
            throw new Error("Failed to create agent");
        }
        //add agent in particular agent
        console.log(agentId.agentId);
        try {
            let agent = new Agent_1.Agent({
                userId: userId,
                agentId: agentId.agentId,
                agentType: agentType,
                agentSubtype: agentSubtype,
            });
            yield agent.save();
            console.log("agent created");
            if (!agent) {
                return res.status(404).json({ message: "Agent not created" });
            }
        }
        catch (e) {
            console.log(e);
        }
        res.status(201).json({
            success: true,
            agentId: agentId.agentId,
            message: "Agent created successfully",
        });
    }
    catch (e) {
        console.log(e);
    }
}));
//get all agent by agent id
router.get("/all-agents", authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const allAgents = yield Agent_1.Agent.find({ userId: userId });
    //console.log(allAgents)
    res.status(200).json(allAgents);
}));
//get agent conversations
router.get("/conversations", authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    console.log(userId);
    try {
        //get all the agent for user
        const agents = yield Agent_1.Agent.find({ userId });
        console.log(agents);
        const agentIds = Array.isArray(agents)
            ? agents.map((a) => a.agentId)
            : agents
                ? [agents.agentId]
                : [];
        console.log(agentIds);
        //get conversation history for all the agents in parallel
        const allConversations = yield Promise.all(agentIds.map((agentId) => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield client.conversationalAi.conversations.list({
                agentId,
            });
            return { agentId, conversations: response };
        })));
        //merge the results and send to frontend
        console.log(allConversations);
        const flattened = allConversations.flatMap((entry) => {
            return entry.conversations.conversations.map((c) => (Object.assign(Object.assign({}, c), { agentId: entry.agentId })));
        });
        return res.json({ success: true, data: flattened });
    }
    catch (e) {
        console.log("Unable to get conversations", e);
        return res
            .status(500)
            .json({ success: false, message: "Failed to fetch conversations" });
    }
}));
exports.default = router;
//# sourceMappingURL=agent.js.map