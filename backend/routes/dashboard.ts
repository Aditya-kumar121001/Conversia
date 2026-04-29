import { Router } from 'express'
import { authMiddleware } from '../middlewares/authMiddleware';
import { Conversation } from '../models/Conversation';
import { Domain } from '../models/Domain';
import { Message } from '../models/Message';

const router = Router();

router.get("/", authMiddleware, async (req, res) => {
    const userId = req.userId;

    try{
        const domains = await Domain.find({userId: userId})

        const totalConversationsArr = await Promise.all(
            domains.map(async (domain) => {
              const conversations = await Conversation.countDocuments({
                domain: domain.domainName,
              });
              return conversations;
            })
        );

        const conversations = await Conversation.find();
        const totalMessagesArr = await Promise.all(
            conversations.map(async (conversation) => {
                return conversation.messages.length
            })
        )

        const totalConversations = totalConversationsArr.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        const totalMessages = totalMessagesArr.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

        return res.status(200).json({
            totalConversations,
            totalMessages,
        });

    } catch(e){
        console.error("Dashboard error:", e);
        return res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
});

// GET /dashboard/messages-per-month — aggregates messages by month for the last 12 months
router.get("/messages-per-month", authMiddleware, async (req, res) => {
    const userId = req.userId;

    try {
        // Get all domains for this user
        const domains = await Domain.find({ userId });
        const domainNames = domains.map(d => d.domainName);

        // Get all conversation IDs for those domains
        const conversations = await Conversation.find(
            { domain: { $in: domainNames } },
            { _id: 1 }
        );
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
            { $sort: { _id: 1 as 1 | -1 } },
            {
                $project: {
                    _id: 0,
                    month: "$_id",
                    count: 1,
                },
            },
        ];

        const result = await Message.aggregate(pipeline);

        res.status(200).json({ messagesPerMonth: result });
    } catch (e) {
        console.error("messages-per-month error:", e);
        res.status(500).json({ error: "Failed to fetch messages per month" });
    }
});

export default router;