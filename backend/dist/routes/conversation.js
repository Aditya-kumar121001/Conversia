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
//get agent conversations
const express_1 = __importDefault(require("express"));
const router = (0, express_1.default)();
const elevenlabs_js_1 = require("@elevenlabs/elevenlabs-js");
const genai_1 = require("@google/genai");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const Agent_1 = require("../models/Agent");
const Conversation_1 = require("../models/Conversation");
const inMemoryStore_1 = require("../inMemoryStore");
const utils_1 = require("../utils");
const Message_1 = require("../models/Message");
//voice client, AI client
const client = new elevenlabs_js_1.ElevenLabsClient({ apiKey: process.env.ELEVEN });
const aiClient = new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI });
const memory = inMemoryStore_1.InMemoryStore.getInstance();
//Chatbot Conversations
//Get all conversation based on email ID
router.get("/chat/all-conversation", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body;
    if (!email) {
        res.status(401).json({ message: "No email found" });
        return;
    }
    try {
        const conversations = yield Conversation_1.Conversation.find({ email });
        res.status(200).json({ conversations: conversations, message: "Conversations Found" });
    }
    catch (e) {
        console.log(e);
    }
    res.status(404).json({ message: "No conversations found for this email" });
}));
// CREATE / CONTINUE CONVERSATION
router.post("/chat/:domain", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const domain = req.params.domain;
    const { email, message } = req.body;
    if (!email) {
        return res.status(400).json({ message: "Email not present" });
    }
    if (!message) {
        return res.status(400).json({ message: "Message not present" });
    }
    try {
        //Find existing OPEN conversation for this email + domain
        let conversation = yield Conversation_1.Conversation.findOne({
            email,
            domain,
            status: "OPEN",
        });
        //Create new conversation if none exists
        if (!conversation) {
            conversation = yield Conversation_1.Conversation.create({
                email,
                domain,
                status: "OPEN",
                messages: [],
                lastMessageAt: new Date(),
            });
        }
        //Save user message
        const userMessage = yield Message_1.Message.create({
            conversationId: conversation._id,
            role: "user",
            content: message,
        });
        //@ts-ignore
        conversation.messages.push(userMessage._id);
        //Generate AI response
        const response = yield aiClient.models.generateContent({
            model: "gemini-2.5-flash",
            contents: message,
            config: {
                systemInstruction: utils_1.systemPrompt,
            },
        });
        //Save bot message
        const botMessage = yield Message_1.Message.create({
            conversationId: conversation._id,
            role: "bot",
            content: response.text,
        });
        //@ts-ignore
        conversation.messages.push(botMessage._id);
        conversation.lastMessageAt = new Date();
        yield conversation.save();
        res.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:5501");
        //Return SAME conversationId every time
        return res.status(200).json({
            success: true,
            message: response.text,
            conversationId: conversation._id,
        });
    }
    catch (err) {
        console.error("Chat error:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}));
//GET CHAT CONVERSATION
router.get("/chat/:conversationId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const conversationId = req.params.conversationId;
    try {
        const conversation = yield Conversation_1.Conversation.findById(conversationId)
            .populate("messages");
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found",
                data: null
            });
        }
        res.status(200).json({
            success: true,
            message: "Conversation found",
            data: conversation
        });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({
            success: false,
            message: "Server error",
            data: null
        });
    }
}));
//Voicebot Conversations
router.get("/conversations", authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    try {
        //get all the agent for user
        const agents = yield Agent_1.Agent.find({ userId });
        const agentIds = Array.isArray(agents)
            ? agents.map((a) => a.agentId)
            : [];
        //get conversation history for all the agents in parallel
        const allConversations = yield Promise.all(agentIds.map((agentId) => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield client.conversationalAi.conversations.list({
                agentId,
            });
            return { agentId, conversations: response };
        })));
        //merge the results and send to frontend
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
router.get("/conversation-details/:conversationId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const conversationId = req.params.conversationId;
    try {
        const response = yield client.conversationalAi.conversations.get(conversationId);
        return res.status(200).json({
            message: "success",
            data: response,
        });
    }
    catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Unable to fetch conversation" });
    }
}));
exports.default = router;
//# sourceMappingURL=conversation.js.map