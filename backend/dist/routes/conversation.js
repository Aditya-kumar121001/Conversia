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
const elevenlabs_js_1 = require("@elevenlabs/elevenlabs-js");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const Agent_1 = require("../models/Agent");
const client = new elevenlabs_js_1.ElevenLabsClient({ apiKey: process.env.ELEVEN });
const router = (0, express_1.default)();
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
router.get("/conversation-details/:conversationId", authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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