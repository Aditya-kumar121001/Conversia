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
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const Conversation_1 = require("../models/Conversation");
const Domain_1 = require("../models/Domain");
const Message_1 = require("../models/Message");
const Bot_1 = require("../models/Bot");
const Workflow_1 = require("../models/Workflow");
const Execution_1 = require("../models/Execution");
const KnowlodgeBase_1 = require("../models/KnowlodgeBase");
const User_1 = require("../models/User");
const mongoose_1 = __importDefault(require("mongoose"));
const planConfig_1 = require("../planConfig");
const router = (0, express_1.Router)();
// GET /dashboard — all metrics in one efficient call
router.get("/", authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const userId = req.userId;
    try {
        const userObjId = new mongoose_1.default.Types.ObjectId(userId);
        // Fetch user + domains in parallel
        const [user, domains] = yield Promise.all([
            User_1.User.findById(userObjId).lean(),
            Domain_1.Domain.find({ userId: userObjId }).lean(),
        ]);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        const domainNames = domains.map(d => d.domainName);
        const domainIds = domains.map(d => String(d._id));
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        // Run all DB queries in parallel
        const [totalConversations, conversationsToday, conversationsThisMonth, finishedConversations, ratedConversations, totalMessages, bots, workflows, workflowExecutions, kbFiles,] = yield Promise.all([
            // Total all-time conversations across user domains
            Conversation_1.Conversation.countDocuments({ domain: { $in: domainNames } }),
            // Conversations created today
            Conversation_1.Conversation.countDocuments({
                domain: { $in: domainNames },
                createdAt: { $gte: startOfToday },
            }),
            // Conversations this calendar month
            Conversation_1.Conversation.countDocuments({
                domain: { $in: domainNames },
                createdAt: { $gte: startOfMonth },
            }),
            // Finished (resolved) conversations
            Conversation_1.Conversation.countDocuments({
                domain: { $in: domainNames },
                status: "FINISH",
            }),
            // Rated conversations (rating > 0)
            Conversation_1.Conversation.find({
                domain: { $in: domainNames },
                rating: { $gt: 0 },
            }, { rating: 1 }).lean(),
            // Total messages via aggregation
            Message_1.Message.aggregate([
                {
                    $lookup: {
                        from: "conversations",
                        localField: "conversationId",
                        foreignField: "_id",
                        as: "conv",
                    },
                },
                { $unwind: "$conv" },
                { $match: { "conv.domain": { $in: domainNames } } },
                { $count: "total" },
            ]),
            // Bots split by type
            Bot_1.Bot.find({ domainId: { $in: domainIds } }, { botType: 1, isActive: 1 }).lean(),
            // Workflows count
            Workflow_1.Workflow.countDocuments({ userId: userObjId }),
            // Workflow executions count
            Execution_1.Execution.countDocuments({ userId: userObjId }),
            // KB files count
            KnowlodgeBase_1.File.countDocuments({ userId: userObjId }),
        ]);
        // Compute derived metrics
        const totalMessagesCount = (_b = (_a = totalMessages[0]) === null || _a === void 0 ? void 0 : _a.total) !== null && _b !== void 0 ? _b : 0;
        const avgRating = ratedConversations.length > 0
            ? ratedConversations.reduce((sum, c) => sum + c.rating, 0) / ratedConversations.length
            : 0;
        const satisfiedCount = ratedConversations.filter(c => c.rating >= 4).length;
        const satisfactionRate = ratedConversations.length > 0
            ? Math.round((satisfiedCount / ratedConversations.length) * 100)
            : 0;
        const resolutionRate = totalConversations > 0
            ? Math.round((finishedConversations / totalConversations) * 100)
            : 0;
        const avgMessagesPerConversation = totalConversations > 0
            ? parseFloat((totalMessagesCount / totalConversations).toFixed(1))
            : 0;
        const chatBotCount = bots.filter(b => b.botType === "chat").length;
        const voiceBotCount = bots.filter(b => b.botType === "voice").length;
        const activeChatBotCount = bots.filter(b => b.botType === "chat" && b.isActive !== false).length;
        const activeVoiceBotCount = bots.filter(b => b.botType === "voice" && b.isActive !== false).length;
        // Active domains — domains with at least one conversation this month
        const activeDomainsThisMonth = yield Conversation_1.Conversation.distinct("domain", {
            domain: { $in: domainNames },
            createdAt: { $gte: startOfMonth },
        });
        // Plan limits
        const limits = (0, planConfig_1.getLimitsForUser)(user);
        return res.status(200).json({
            // Engagement
            totalConversations,
            conversationsToday,
            conversationsThisMonth,
            totalMessages: totalMessagesCount,
            // Quality
            avgRating: parseFloat(avgRating.toFixed(1)),
            satisfactionRate,
            ratedConversationsCount: ratedConversations.length,
            resolutionRate,
            finishedConversations,
            // Bot performance
            totalDomains: domains.length,
            activeDomainsThisMonth: activeDomainsThisMonth.length,
            chatBotCount,
            voiceBotCount,
            activeChatBotCount,
            activeVoiceBotCount,
            avgMessagesPerConversation,
            // Usage / Plan
            workflowCount: workflows,
            workflowExecutions,
            kbFilesCount: kbFiles,
            plan: (_c = user.plan) !== null && _c !== void 0 ? _c : "free",
            isPremium: (_d = user.isPremium) !== null && _d !== void 0 ? _d : false,
            limits: {
                maxDomains: limits.maxDomains === Infinity ? -1 : limits.maxDomains,
                maxConversationsPerMonth: limits.maxConversationsPerMonth === Infinity ? -1 : limits.maxConversationsPerMonth,
                maxKBFiles: limits.maxKBFiles === Infinity ? -1 : limits.maxKBFiles,
                maxWorkflows: limits.maxWorkflows === Infinity ? -1 : limits.maxWorkflows,
            },
        });
    }
    catch (e) {
        console.error("Dashboard error:", e);
        return res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
}));
// GET /dashboard/messages-per-month — messages aggregated by month (last 12)
router.get("/messages-per-month", authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    try {
        const domains = yield Domain_1.Domain.find({ userId }).lean();
        const domainNames = domains.map(d => d.domainName);
        const conversationIds = (yield Conversation_1.Conversation.find({ domain: { $in: domainNames } }, { _id: 1 }).lean()).map(c => c._id);
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
        const result = yield Message_1.Message.aggregate([
            {
                $match: {
                    conversationId: { $in: conversationIds },
                    createdAt: { $gte: start },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, month: "$_id", count: 1 } },
        ]);
        res.status(200).json({ messagesPerMonth: result });
    }
    catch (e) {
        console.error("messages-per-month error:", e);
        res.status(500).json({ error: "Failed to fetch messages per month" });
    }
}));
// GET /dashboard/conversations-per-day — conversations for last 30 days
router.get("/conversations-per-day", authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    try {
        const domains = yield Domain_1.Domain.find({ userId }).lean();
        const domainNames = domains.map(d => d.domainName);
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
        const result = yield Conversation_1.Conversation.aggregate([
            {
                $match: {
                    domain: { $in: domainNames },
                    createdAt: { $gte: start },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, date: "$_id", count: 1 } },
        ]);
        res.status(200).json({ conversationsPerDay: result });
    }
    catch (e) {
        console.error("conversations-per-day error:", e);
        res.status(500).json({ error: "Failed to fetch conversations per day" });
    }
}));
exports.default = router;
//# sourceMappingURL=dashboard.js.map