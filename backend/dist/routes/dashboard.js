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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const Conversation_1 = require("../models/Conversation");
const Domain_1 = require("../models/Domain");
const router = (0, express_1.Router)();
router.get("/", authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    let totalConversations;
    let totalMessages;
    try {
        const domains = yield Domain_1.Domain.find({ userId: userId });
        console.log(domains);
        totalConversations = yield Promise.all(domains.map((domain) => __awaiter(void 0, void 0, void 0, function* () {
            const conversations = yield Conversation_1.Conversation.countDocuments({
                domain: domain.domainName,
            });
            return conversations;
        })));
        const conversations = yield Conversation_1.Conversation.find();
        totalMessages = yield Promise.all(conversations.map((conversation) => __awaiter(void 0, void 0, void 0, function* () {
            return conversation.messages.length;
        })));
        totalConversations = totalConversations.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        totalMessages = totalMessages.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        console.log(totalConversations);
        console.log(totalMessages);
    }
    catch (e) {
        console.log(e);
    }
    res.status(200).json({
        totalConversations,
        totalMessages,
    });
}));
exports.default = router;
//# sourceMappingURL=dashboard.js.map