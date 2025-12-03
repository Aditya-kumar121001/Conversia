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
const Execution_1 = require("../models/Execution");
const genai_1 = require("@google/genai");
const utils_1 = require("../utils");
const aiClient = new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI });
router.post("/chat/:domain", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //parse the user input
    const { message, email, domain, domainId } = req.body;
    if (!message || !email) {
        res.status(401).json({ message: "Invalid input" });
        return;
    }
    //Create conversation
    const newConveration = yield Conversation_1.Conversation.create({
        email: email,
        createdAt: Date.now,
        updatedAt: Date.now,
        messages: []
    });
    //create execution session for 15 mins with create an empty conversation
    const newExecution = yield Execution_1.Execution.create({
        domain: req.params.domain,
        domainId: domainId,
        executionType: "chat",
        executionStatus: "PENDING",
        conversationId: newConveration._id,
        startedAt: new Date(),
        completedAt: null
    });
    //Search on knowledge base => context
    //Call LLM => {message, Context}
    const response = yield aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: message,
        config: {
            systemInstruction: utils_1.systemPrompt,
        },
    });
    //console.log(response.text)
    //Stream response to BE
    //Update DB
    //Stream to widget
    //Close session after 15 or on completion
    res.status(200).json({
        success: true,
        message: response.text,
    });
}));
exports.default = router;
//# sourceMappingURL=execution.js.map