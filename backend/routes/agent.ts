import Router from "express";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { personalAgents } from "../personalAgents";
const router = Router();
const client = new ElevenLabsClient({ apiKey: process.env.ELEVEN });
import { authMiddleware } from "../middlewares/authMiddleware";
import { Agent } from "../models/Agent";
import mongoose from "mongoose";

//create a new agent
router.post("/new-agent", authMiddleware, async (req, res) => {
  const userId = req.userId
  console.log(`user id: ${userId}`)

  if(!userId){
    return res.status(401).send("Unauthorzised User")
  }

  const { name, agentType, agentSubtype } = req.body;
  if (!name || !agentType || !agentSubtype) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  const agentObj = personalAgents.find(a => a.title === agentSubtype);
  const firstMessage = agentObj && agentObj.firstMessage ? agentObj.firstMessage : "";
  const systemPrompt = agentObj && agentObj.systemPrompt ? agentObj.systemPrompt : "";

  try {
    const agentId = await client.conversationalAi.agents.create({
        name: name,
        conversationConfig: {
            agent: {
                firstMessage: firstMessage,
                prompt: {
                    prompt: systemPrompt
                }
            }
        }
      },
    );

    if (!agentId) {
      throw new Error("Failed to create agent");
    }
    //add agent in particular agent
    console.log(agentId.agentId)

    try{
        let agent = new Agent({
            userId: userId,
            agentId: agentId.agentId,
            agentType: agentType,
            agentSubtype: agentSubtype
        });
          
        await agent.save();
        console.log("agent created")
        if (!agent) {
            return res.status(404).json({ message: "Agent not created" });
        }
        
    }catch(e){
        console.log(e)
    }
    res.status(201).json({
        success: true,
        agentId: agentId.agentId,
        message: "Agent created successfully"
    });

  } catch(e){
    console.log(e)
  }
});

//get all agent by agent id
router.get("/all-agents", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const allAgents = await Agent.find({ userId: userId });
    //console.log(allAgents)
    res.status(200).json(allAgents)
})

//get agent conversations
router.get("/conversations", authMiddleware, async(req, res) => {
    const userId = req.userId;
    try{
        //get all the agent for user
        const agents = await Agent.findById({ userId: new mongoose.Types.ObjectId(userId) })
        const agentIds = Array.isArray(agents) ? agents.map(a => a.agentId) : (agents ? [agents.agentId] : []);
        //get conversation history for all the agents in parallel
        const allConversations = await Promise.all(
            agentIds.map(async (agentId:string) => {
                const response = await client.conversationalAi.conversations.list({ agentId });
                return {agentId, conversations: response}
            })
        ) 
        //merge the results and send to frontend
        return res.json({ success: true, data: allConversations.flat() });

    }catch(e){
        console.log("Unable to get conversations", e);
        return res.status(500).json({ success: false, message: "Failed to fetch conversations" });
    }
    
})
export default router;
