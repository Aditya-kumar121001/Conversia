import Router from "express";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { personalAgents } from "../personalAgents";
const router = Router();

//create a new agent
router.post("/new-agent", async (req, res) => {
  const data = req.body;
  console.log(data);
  const agentSubtype = data.agentSubtype
  const firstMessage = personalAgents.find(a => a.key === agentSubtype)?.firstMessage
  const prompt = personalAgents.find(a => a.key === agentSubtype)?.systemPrompt

  try {
    const client = new ElevenLabsClient({ apiKey: process.env.ELEVEN });
    const agentId = await client.conversationalAi.agents.create({
      name: data.agentName,
      conversationConfig: {
        agent: {
          firstMessage: firstMessage,
          prompt:{
            prompt: prompt
          }
        },
      },
    });

    if (!agentId) {
      throw new Error("Failed to create agent");
    }
    //add agent in particular agent
    console.log(`Agent id: ${agentId.agentId}`)

    res.status(200).json({agendId: agentId})
  } catch(e){
    console.log(e)
  }
});

//get agent by agent id

export default router;
