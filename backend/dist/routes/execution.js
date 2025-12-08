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
const Conversation_1 = require("../models/Conversation");
const genai_1 = require("@google/genai");
const utils_1 = require("../utils");
const inMemoryStore_1 = require("../inMemoryStore");
const Message_1 = require("../models/Message");
const Domain_1 = require("../models/Domain");
//import {v4 as uuid4} from 'uuid'
const Session_1 = require("../models/Session");
const aiClient = new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI });
const memory = inMemoryStore_1.InMemoryStore.getInstance();
//Create session for the conversation
router.post("/chat/:domain/session", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const domain = req.params.domain;
    const { visitorId } = req.body;
    console.log(visitorId);
    try {
        const metaDomain = yield Domain_1.Domain.findOne({ domainName: domain });
        if (!metaDomain) {
            res.status(401).json({ message: "Invalid Domain" });
            return;
        }
    }
    catch (e) {
        console.log(e);
    }
    if (!visitorId) {
        res.status(401).json({ message: "Invalid visitor Id" });
        return;
    }
    //create a session
    const newSession = {
        visitorId: visitorId,
        domain: domain,
        createdAt: Date.now(),
        expiredAt: new Date(Date.now() + 60 * 60 * 1000)
    };
    let createdSession;
    try {
        createdSession = yield Session_1.Session.create(newSession);
        console.log(createdSession);
    }
    catch (e) {
        console.log(e);
    }
    //store session in memory Store
    try {
        memory.set(createdSession._id, createdSession);
        console.log("Session is created");
    }
    catch (e) {
        console.log(e);
    }
    const origin = 'http://127.0.0.1:5501';
    res.setHeader('Access-Control-Allow-Origin', origin);
    return res.status(201).json({
        sessionId: createdSession._id,
        visitorId,
        expiresAt: createdSession.expiresAt,
    });
}));
router.post("/chat/:domain", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const domain = req.params.domain;
    const { message, email } = req.body;
    if (!message || !email) {
        res.status(401).json({ message: "Invalid input" });
        return;
    }
    //Create conversation
    try {
        const newConveration = yield Conversation_1.Conversation.create({
            email: email,
            createdAt: Date.now,
            updatedAt: Date.now,
            messages: [{
                    role: "user",
                    content: message,
                    timestamp: new Date()
                }]
        });
        yield newConveration.save();
        console.log("Conversaion created");
    }
    catch (e) {
        console.log(e);
    }
    //Search on knowledge base => context
    //Call LLM => {message, Context}
    const response = yield aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: message,
        config: {
            systemInstruction: utils_1.systemPrompt,
        },
    });
    //Update DB
    try {
        const conversation = yield Conversation_1.Conversation.findOne({ email: email }).sort({ createdAt: -1 });
        if (conversation) {
            // Create new message doc
            const newMessage = {
                conversationId: conversation._id,
                role: "assistant",
                content: response.text,
                timestamp: new Date(),
            };
            // Add to conversation's messages array
            const messageDoc = yield Message_1.Message.create(newMessage);
            // Ensure the _id is a valid ObjectId before pushing
            if (messageDoc && messageDoc._id) {
                // @ts-ignore
                conversation.messages.push(messageDoc._id);
            }
            else {
                console.warn('Message creation failed or _id missing', messageDoc);
            }
            conversation.updatedAt = new Date();
            yield conversation.save();
        }
        else {
            console.log(`Conversation not found for email: ${email}`);
        }
    }
    catch (e) {
        console.log(e);
    }
    //Close session after 15 or on completion
    const origin = 'http://127.0.0.1:5501';
    res.setHeader('Access-Control-Allow-Origin', origin);
    //Stream to widget
    res.status(200).json({
        success: true,
        message: response.text,
    });
}));
exports.default = router;
//# sourceMappingURL=execution.js.map