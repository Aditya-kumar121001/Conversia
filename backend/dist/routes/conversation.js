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
const pinecone_1 = require("@pinecone-database/pinecone");
const utils_1 = require("../utils");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const Agent_1 = require("../models/Agent");
const Conversation_1 = require("../models/Conversation");
const inMemoryStore_1 = require("../inMemoryStore");
const utils_2 = require("../utils");
const Message_1 = require("../models/Message");
const pc = new pinecone_1.Pinecone({
    apiKey: process.env.PINECONE
});
const index = pc.index(utils_1.pineconeConfig.indexName);
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
//END CHAT
router.post("/chat/feedback", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { rating, conversationId } = req.body;
    console.log(rating, conversationId);
    if (!rating || !conversationId) {
        res.status(500).json({
            message: "Internal server error"
        });
        return;
    }
    try {
        const updatedConversation = yield Conversation_1.Conversation.findByIdAndUpdate(conversationId, { rating, status: "FINISH" }, { new: true });
        if (!updatedConversation) {
            res.status(404).json({
                message: "Conversation not found"
            });
            return;
        }
        //Generate AI summary
        const messages = yield Message_1.Message.find({ conversationId }).sort({ createdAt: 1 }).select("role content");
        console.log(messages);
        const conversationText = messages.map((m) => `${m.role === "user" ? "User" : "Bot"}: ${m.content}`).join("\n");
        console.log(conversationText);
        const summary = yield aiClient.models.generateContent({
            model: "gemini-2.5-flash",
            contents: conversationText,
            config: {
                systemInstruction: utils_2.summaryPrompt,
            },
        });
        const updatedSummary = yield Conversation_1.Conversation.findByIdAndUpdate(conversationId, { summary: summary.text }, { new: true });
        console.log(updatedSummary);
        res.status(200).json({
            success: true,
            message: "Conversation Updated",
        });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({
            message: "Internal server error"
        });
    }
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
                rating: 0,
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
        const userMessageEmbedding = yield aiClient.models.embedContent({
            model: 'text-embedding-004',
            contents: message,
        });
        if (!userMessageEmbedding || !userMessageEmbedding.embeddings) {
            throw new Error('Embedding generation failed. Unexpected response format.');
        }
        const queryResult = yield index.query(Object.assign(Object.assign({}, utils_1.pineconeConfig.similarityQuery), { vector: userMessageEmbedding.embeddings[0].values }));
        console.log(queryResult);
        const response = yield aiClient.models.generateContent({
            model: "gemini-2.5-flash",
            contents: message,
            config: {
                systemInstruction: utils_2.systemPrompt,
            },
        });
        // const response = {
        //   text: "AI response"
        // }
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