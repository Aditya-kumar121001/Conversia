import Router from "express";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { personalAgents } from "../personalAgents";
const router = Router();
const client = new ElevenLabsClient({ apiKey: process.env.ELEVEN });
import { authMiddleware } from "../middlewares/authMiddleware";
import { Agent } from "../models/Agent";
import { User } from "../models/User";
import mongoose from "mongoose";

//create a new agent
router.post("/new-agent", authMiddleware, async (req, res) => {
  const userId = req.userId;
  console.log(`user id: ${userId}`);

  if (!userId) {
    return res.status(401).send("Unauthorzised User");
  }

  const { name, agentType, agentSubtype } = req.body;
  if (!name || !agentType || !agentSubtype) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  const agentObj = personalAgents.find((a) => a.title === agentSubtype);
  const firstMessage =
    agentObj && agentObj.firstMessage ? agentObj.firstMessage : "";
  const systemPrompt =
    agentObj && agentObj.systemPrompt ? agentObj.systemPrompt : "";

  try {
    const agentId = await client.conversationalAi.agents.create({
      name: name,
      conversationConfig: {
        agent: {
          firstMessage: firstMessage,
          prompt: {
            prompt: systemPrompt,
          },
        },
      },
    });

    if (!agentId) {
      throw new Error("Failed to create agent");
    }
    //add agent in particular agent
    console.log(agentId.agentId);

    try {
      let agent = new Agent({
        userId: userId,
        agentId: agentId.agentId,
        agentType: agentType,
        agentSubtype: agentSubtype,
        firstMessage: firstMessage,
        prompt: systemPrompt,
      });

      await agent.save();
      console.log("agent created");
      if (!agent) {
        return res.status(404).json(
          { 
            message: "Agent not created",
          }
        );
      }
    } catch (e) {
      console.log(e);
    }
    res.status(201).json({
      success: true,
      message: "Agent created successfully",
      agentId: agentId.agentId,
      firstMessage: firstMessage,
      prompt: systemPrompt,
    });
  } catch (e) {
    console.log(e);
  }
});

// New business agent
router.post("/new-business-agent", authMiddleware, async (req, res) => {
  const userId = req.userId;
  console.log(`user id: ${userId}`);

  if (!userId) {
    return res.status(401).send("Unauthorzised User");
  }
  console.log(req.body)
  const { name, agentType, agentSubType, firstMessage, systemPrompt } = req.body;
   if (!name || !agentType || !agentSubType || !firstMessage || !systemPrompt) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    const agentId = await client.conversationalAi.agents.create({
      name: name,
      conversationConfig: {
        agent: {
          firstMessage: firstMessage,
          prompt: {
            prompt: systemPrompt,
          },
        },
      },
    });

    if (!agentId) {
      throw new Error("Failed to create agent");
    }
    //add agent in particular agent
    console.log(agentId.agentId);

    try {
      let agent = new Agent({
        userId: userId,
        agentId: agentId.agentId,
        agentType: agentType,
        agentSubType: agentSubType,
        firstMessage: firstMessage,
        prompt: systemPrompt,
      });

      await agent.save();
      console.log("agent created");
      if (!agent) {
        return res.status(404).json(
          { 
            message: "Agent not created",
          }
        );
      }
    } catch (e) {
      console.log(e);
    }
    res.status(201).json({
      success: true,
      message: "Agent created successfully",
      agentId: agentId.agentId,
      firstMessage: firstMessage,
      prompt: systemPrompt,
    });
  } catch (e) {
    console.log(e);
  }
});

//get all agent by user id
router.get("/all-agents", authMiddleware, async (req, res) => {
  const userId = req.userId;
  const allAgents = await Agent.find({ userId: userId });
  //console.log(allAgents)
  res.status(200).json(allAgents);
});

// Delete agent by agentId
router.delete("/:id", authMiddleware, async (req, res) => {
  const userId = req.userId;
  const agentId = req.params.id;

  try {
    // Only allow deletion if the agent belongs to the user
    const agent = await Agent.findOne({ agentId: agentId, userId: userId });
    if (!agent) {
      return res.status(404).json({ success: false, message: "Agent not found" });
    }

    await Agent.deleteOne({ agentId: agentId, userId: userId });
    return res.status(200).json({ success: true, message: "Agent deleted successfully" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Failed to delete agent" });
  }
});


//resourse details for dashboard
router.get("/dashboard", authMiddleware, async (req, res) => {
  const userId = req.userId;

  try {
    const now = new Date();

    // Find user by _id
    const user = await User.findById(new mongoose.Types.ObjectId(userId));

    if (!user) {
      throw new Error("User not found");
    }
    if (!user.createdAt) {
      throw new Error("Missing registration date on user");
    }

    const startOfDay = new Date(user.createdAt);
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999
    );
    console.log(startOfDay.getTime() / 1000);
    const response = await client.usage.get({
      startUnix: Math.floor(startOfDay.getTime() / 1000),
      endUnix: Math.floor(endOfDay.getTime() / 1000),
      aggregationInterval: "cumulative",
      metric: "credits",
    });
    console.log(response);
    res.json({ success: true, data: response });
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .json({ success: false, message: "Failed to get usage stats" });
  }
});

export default router;
