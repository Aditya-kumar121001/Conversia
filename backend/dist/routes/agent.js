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
const User_1 = require("../models/User");
const mongoose_1 = __importDefault(require("mongoose"));
//create a new agent
router.post("/new-agent", authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    console.log(`user id: ${userId}`);
    if (!userId) {
        return res.status(401).send("Unauthorzised User");
    }
    console.log(req.body);
    const { name, agentType, agentSubType } = req.body;
    if (!name || !agentType || !agentSubType) {
        return res
            .status(400)
            .json({ success: false, message: "Missing required fields" });
    }
    const agentObj = personalAgents_1.personalAgents.find((a) => a.title === agentSubType);
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
                agentName: name,
                userId: userId,
                agentId: agentId.agentId,
                agentType: agentType,
                agentSubType: agentSubType,
                firstMessage: firstMessage,
                prompt: systemPrompt,
            });
            yield agent.save();
            console.log("agent created");
            if (!agent) {
                return res.status(404).json({
                    message: "Agent not created",
                });
            }
        }
        catch (e) {
            console.log(e);
        }
        res.status(201).json({
            success: true,
            message: "Agent created successfully",
            agentId: agentId.agentId,
            firstMessage: firstMessage,
            prompt: systemPrompt,
        });
    }
    catch (e) {
        console.log(e);
    }
}));
// New business agent
router.post("/new-business-agent", authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    console.log(`user id: ${userId}`);
    if (!userId) {
        return res.status(401).send("Unauthorzised User");
    }
    console.log(req.body);
    const { name, agentType, agentSubType, firstMessage, systemPrompt } = req.body;
    if (!name || !agentType || !agentSubType || !firstMessage || !systemPrompt) {
        return res
            .status(400)
            .json({ success: false, message: "Missing required fields" });
    }
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
                agentName: name,
                userId: userId,
                agentId: agentId.agentId,
                agentType: agentType,
                agentSubType: agentSubType,
                firstMessage: firstMessage,
                prompt: systemPrompt,
            });
            yield agent.save();
            console.log("agent created");
            if (!agent) {
                return res.status(404).json({
                    message: "Agent not created",
                });
            }
        }
        catch (e) {
            console.log(e);
        }
        res.status(201).json({
            success: true,
            message: "Agent created successfully",
            agentId: agentId.agentId,
            firstMessage: firstMessage,
            prompt: systemPrompt,
        });
    }
    catch (e) {
        console.log(e);
    }
}));
//get all agent by user id
router.get("/all-agents", authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const allAgents = yield Agent_1.Agent.find({ userId: userId });
    //console.log(allAgents)
    res.status(200).json(allAgents);
}));
// Delete agent by agentId
router.delete("/:id", authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const agentId = req.params.id;
    try {
        // Only allow deletion if the agent belongs to the user
        const agent = yield Agent_1.Agent.findOne({ agentId: agentId, userId: userId });
        if (!agent) {
            return res
                .status(404)
                .json({ success: false, message: "Agent not found" });
        }
        yield Agent_1.Agent.deleteOne({ agentId: agentId, userId: userId });
        return res
            .status(200)
            .json({ success: true, message: "Agent deleted successfully" });
    }
    catch (e) {
        console.error(e);
        return res
            .status(500)
            .json({ success: false, message: "Failed to delete agent" });
    }
}));
//resourse details for dashboard
router.get("/dashboard", authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    try {
        const now = new Date();
        // Find user by _id
        const user = yield User_1.User.findById(new mongoose_1.default.Types.ObjectId(userId));
        if (!user) {
            throw new Error("User not found");
        }
        if (!user.createdAt) {
            throw new Error("Missing registration date on user");
        }
        const startOfDay = new Date(user.createdAt);
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        console.log(startOfDay.getTime() / 1000);
        const response = yield client.usage.get({
            startUnix: Math.floor(startOfDay.getTime() / 1000),
            endUnix: Math.floor(endOfDay.getTime() / 1000),
            aggregationInterval: "cumulative",
            metric: "credits",
        });
        console.log(response);
        res.json({ success: true, data: response });
    }
    catch (e) {
        console.error(e);
        res
            .status(500)
            .json({ success: false, message: "Failed to get usage stats" });
    }
}));
exports.default = router;
//# sourceMappingURL=agent.js.map