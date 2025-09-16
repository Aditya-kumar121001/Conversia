import Router from "express";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { personalAgents } from "../personalAgents";
const router = Router();
const client = new ElevenLabsClient({ apiKey: process.env.ELEVEN });
import { authMiddleware } from "../middlewares/authMiddleware";
import { Agent } from "../models/Agent";

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

//get agent by agent id

export default router;
