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
const Message_1 = require("../models/Message");
const router = (0, express_1.Router)();
router.get("/", authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    try {
        const domains = yield Domain_1.Domain.find({ userId: userId });
        const totalConversationsArr = yield Promise.all(domains.map((domain) => __awaiter(void 0, void 0, void 0, function* () {
            const conversations = yield Conversation_1.Conversation.countDocuments({
                domain: domain.domainName,
            });
            return conversations;
        })));
        const conversations = yield Conversation_1.Conversation.find();
        const totalMessagesArr = yield Promise.all(conversations.map((conversation) => __awaiter(void 0, void 0, void 0, function* () {
            return conversation.messages.length;
        })));
        const totalConversations = totalConversationsArr.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        const totalMessages = totalMessagesArr.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        return res.status(200).json({
            totalConversations,
            totalMessages,
        });
    }
    catch (e) {
        console.error("Dashboard error:", e);
        return res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
}));
// GET /dashboard/messages-per-month — aggregates messages by month for the last 12 months
router.get("/messages-per-month", authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    try {
        // Get all domains for this user
        const domains = yield Domain_1.Domain.find({ userId });
        const domainNames = domains.map(d => d.domainName);
        // Get all conversation IDs for those domains
        const conversations = yield Conversation_1.Conversation.find({ domain: { $in: domainNames } }, { _id: 1 });
        const conversationIds = conversations.map(c => c._id);
        // Last 12 months boundary
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
        // Aggregate messages by month
        const pipeline = [
            {
                $match: {
                    conversationId: { $in: conversationIds },
                    createdAt: { $gte: start },
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m", date: "$createdAt" },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
            {
                $project: {
                    _id: 0,
                    month: "$_id",
                    count: 1,
                },
            },
        ];
        const result = yield Message_1.Message.aggregate(pipeline);
        res.status(200).json({ messagesPerMonth: result });
    }
    catch (e) {
        console.error("messages-per-month error:", e);
        res.status(500).json({ error: "Failed to fetch messages per month" });
    }
}));
exports.default = router;
//# sourceMappingURL=dashboard.js.map