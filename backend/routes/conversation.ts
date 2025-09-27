//get agent conversations
import Router from "express";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { authMiddleware } from "../middlewares/authMiddleware";
import { Agent } from "../models/Agent";

const client = new ElevenLabsClient({ apiKey: process.env.ELEVEN });
const router = Router();

router.get("/conversations", authMiddleware, async (req, res) => {
  const userId = req.userId;
  try {
    //get all the agent for user
    const agents = await Agent.find({ userId });

    const agentIds = Array.isArray(agents)
      ? agents.map((a: any) => a.agentId)
      : [];

    //get conversation history for all the agents in parallel
    const allConversations = await Promise.all(
      agentIds.map(async (agentId: string) => {
        const response = await client.conversationalAi.conversations.list({
          agentId,
        });
        return { agentId, conversations: response };
      })
    );
    //merge the results and send to frontend
    const flattened = allConversations.flatMap((entry) => {
      return entry.conversations.conversations.map((c: any) => ({
        ...c,
        agentId: entry.agentId,
      }));
    });
    return res.json({ success: true, data: flattened });
  } catch (e) {
    console.log("Unable to get conversations", e);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch conversations" });
  }
});

router.get("/conversation-details/:conversationId", authMiddleware, async (req, res) => {
    const conversationId = req.params.conversationId;
    try {
      const response = await client.conversationalAi.conversations.get(
        conversationId
      );
      return res.status(200).json({
        message: "success",
        data: response,
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Unable to fetch conversation" });
    }
  }
);

export default router;
