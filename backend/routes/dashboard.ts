import { Router } from 'express'
import { authMiddleware } from '../middlewares/authMiddleware';
import { Conversation } from '../models/Conversation';
import { Domain } from '../models/Domain';

const router = Router();

router.get("/", authMiddleware, async (req, res) => {
    const userId = req.userId;
    let totalConversations;
    let totalMessages;

    try{
        const domains = await Domain.find({userId: userId})

        console.log(domains)
        totalConversations = await Promise.all(
            domains.map(async (domain) => {
              const conversations = await Conversation.countDocuments({
                domain: domain.domainName,
              });
              return conversations;
            })
        );

        const conversations = await Conversation.find();
        totalMessages = await Promise.all(
            conversations.map(async (conversation) => {
                return conversation.messages.length
            })
        )
        totalConversations = totalConversations.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        totalMessages = totalMessages.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

        console.log(totalConversations)
        console.log(totalMessages)

    } catch(e){
        console.log(e)
    }

    res.status(200).json({
        totalConversations,
        totalMessages,
    })
});

export default router;