import { Router } from 'express'
import { authMiddleware } from '../middlewares/authMiddleware';
import { Conversation } from '../models/Conversation';
import { Domain } from '../models/Domain';
import { Message } from '../models/Message';
import { Bot } from '../models/Bot';
import { Workflow } from '../models/Workflow';
import { Execution } from '../models/Execution';
import { File as KBFile } from '../models/KnowlodgeBase';
import { User } from '../models/User';
import mongoose from 'mongoose';
import { getLimitsForUser } from '../planConfig';

const router = Router();

// GET /dashboard — all metrics in one efficient call
router.get("/", authMiddleware, async (req, res) => {
    const userId = req.userId;

    try {
        const userObjId = new mongoose.Types.ObjectId(userId);

        // Fetch user + domains in parallel
        const [user, domains] = await Promise.all([
            User.findById(userObjId).lean(),
            Domain.find({ userId: userObjId }).lean(),
        ]);

        if (!user) return res.status(404).json({ message: "User not found" });

        const domainNames = domains.map(d => d.domainName);
        const domainIds = domains.map(d => String(d._id));

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Run all DB queries in parallel
        const [
            totalConversations,
            conversationsToday,
            conversationsThisMonth,
            finishedConversations,
            ratedConversations,
            totalMessages,
            bots,
            workflows,
            workflowExecutions,
            kbFiles,
        ] = await Promise.all([
            // Total all-time conversations across user domains
            Conversation.countDocuments({ domain: { $in: domainNames } }),

            // Conversations created today
            Conversation.countDocuments({
                domain: { $in: domainNames },
                createdAt: { $gte: startOfToday },
            }),

            // Conversations this calendar month
            Conversation.countDocuments({
                domain: { $in: domainNames },
                createdAt: { $gte: startOfMonth },
            }),

            // Finished (resolved) conversations
            Conversation.countDocuments({
                domain: { $in: domainNames },
                status: "FINISH",
            }),

            // Rated conversations (rating > 0)
            Conversation.find({
                domain: { $in: domainNames },
                rating: { $gt: 0 },
            }, { rating: 1 }).lean(),

            // Total messages via aggregation
            Message.aggregate([
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
            Bot.find({ domainId: { $in: domainIds } }, { botType: 1 }).lean(),

            // Workflows count
            Workflow.countDocuments({ userId: userObjId }),

            // Workflow executions count
            Execution.countDocuments({ userId: userObjId }),

            // KB files count
            KBFile.countDocuments({ userId: userObjId }),
        ]);

        // Compute derived metrics
        const totalMessagesCount = totalMessages[0]?.total ?? 0;

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

        // Active domains — domains with at least one conversation this month
        const activeDomainsThisMonth = await Conversation.distinct("domain", {
            domain: { $in: domainNames },
            createdAt: { $gte: startOfMonth },
        });

        // Plan limits
        const limits = getLimitsForUser(user);

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
            avgMessagesPerConversation,

            // Usage / Plan
            workflowCount: workflows,
            workflowExecutions,
            kbFilesCount: kbFiles,
            plan: user.plan ?? "free",
            isPremium: user.isPremium ?? false,
            limits: {
                maxDomains: limits.maxDomains === Infinity ? -1 : limits.maxDomains,
                maxConversationsPerMonth: limits.maxConversationsPerMonth === Infinity ? -1 : limits.maxConversationsPerMonth,
                maxKBFiles: limits.maxKBFiles === Infinity ? -1 : limits.maxKBFiles,
                maxWorkflows: limits.maxWorkflows === Infinity ? -1 : limits.maxWorkflows,
            },
        });

    } catch (e) {
        console.error("Dashboard error:", e);
        return res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
});

// GET /dashboard/messages-per-month — messages aggregated by month (last 12)
router.get("/messages-per-month", authMiddleware, async (req, res) => {
    const userId = req.userId;

    try {
        const domains = await Domain.find({ userId }).lean();
        const domainNames = domains.map(d => d.domainName);

        const conversationIds = (
            await Conversation.find({ domain: { $in: domainNames } }, { _id: 1 }).lean()
        ).map(c => c._id);

        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);

        const result = await Message.aggregate([
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
            { $sort: { _id: 1 as 1 | -1 } },
            { $project: { _id: 0, month: "$_id", count: 1 } },
        ]);

        res.status(200).json({ messagesPerMonth: result });
    } catch (e) {
        console.error("messages-per-month error:", e);
        res.status(500).json({ error: "Failed to fetch messages per month" });
    }
});

// GET /dashboard/conversations-per-day — conversations for last 30 days
router.get("/conversations-per-day", authMiddleware, async (req, res) => {
    const userId = req.userId;

    try {
        const domains = await Domain.find({ userId }).lean();
        const domainNames = domains.map(d => d.domainName);

        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);

        const result = await Conversation.aggregate([
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
            { $sort: { _id: 1 as 1 | -1 } },
            { $project: { _id: 0, date: "$_id", count: 1 } },
        ]);

        res.status(200).json({ conversationsPerDay: result });
    } catch (e) {
        console.error("conversations-per-day error:", e);
        res.status(500).json({ error: "Failed to fetch conversations per day" });
    }
});

export default router;