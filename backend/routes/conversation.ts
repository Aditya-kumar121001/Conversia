//get agent conversations
import Router from "express";
const router = Router();
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { createUserContent, GoogleGenAI } from '@google/genai';
import { Pinecone } from '@pinecone-database/pinecone';
import { pineconeConfig } from '../utils';
import { authMiddleware } from "../middlewares/authMiddleware";
import { Agent } from "../models/Agent";
import { Conversation } from "../models/Conversation";
import { InMemoryStore } from "../inMemoryStore";
import { summaryPrompt, systemPrompt } from "../utils";
import { Message } from "../models/Message";
import { Domain } from "../models/Domain";
import { Bot } from "../models/Bot";

const pc = new Pinecone({
  apiKey: process.env.PINECONE
});
const index = pc.index(pineconeConfig.indexName);

//voice client, AI client
const client = new ElevenLabsClient({ apiKey: process.env.ELEVEN });
const aiClient = new GoogleGenAI({apiKey: process.env.GEMINI});
const memory = InMemoryStore.getInstance()

//Chatbot Conversations
//Get all conversation based on email ID
router.get("/chat/all-conversation", async (req, res) => {
  const email = req.body
  if(!email){
    res.status(401).json({message: "No email found"})
    return;
  }
  
  try{
    const conversations = await Conversation.find({email})
    res.status(200).json({conversations: conversations, message: "Conversations Found"})
  } catch(e){
    console.log(e)
  }
  res.status(404).json({message: "No conversations found for this email"})

});

//END CHAT
router.post("/chat/feedback", async (req, res) => {
  const {rating, conversationId} = req.body;
  if(!rating || !conversationId){
    res.status(500).json({
      message: "Internal server error"
    });
    return;
  }

  try{
    const updatedConversation = await Conversation.findByIdAndUpdate(
      conversationId,
      { rating, status: "FINISH" },
      { new: true }
    );

    if(!updatedConversation){
      res.status(404).json({
        message: "Conversation not found"
      })
      return
    }    
    
    //Generate AI summary
    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 }).select("role content");
    const conversationText = messages.map((m) => `${m.role === "user" ? "User" : "Bot"}: ${m.content}`).join("\n");

    const summary = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: conversationText,
      config: {
        systemInstruction: summaryPrompt,
      },
    });

    const updatedSummary = await Conversation.findByIdAndUpdate(
      conversationId,
      { summary: summary.text },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Conversation Updated",
    })
  } catch(e){
    console.log(e)
    res.status(500).json({
      message: "Internal server error"
    })
  }
});

// CREATE / CONTINUE CONVERSATION
router.post("/chat/:domain", async (req, res) => {
  const domain = req.params.domain;
  const { email, message } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email not present" });
  }

  if (!message) {
    return res.status(400).json({ message: "Message not present" });
  }

  try {
    // Load domain + bot settings (kbFiles) for retrieval
    const domainDoc = await Domain.findOne({ domainName: domain }).lean();
    const domainIdToUse = domainDoc?._id ? String(domainDoc._id) : null;
    const bot = domainIdToUse
      ? await Bot.findOne({ domainId: domainIdToUse, botType: "chat" }).lean()
      : null;
    const kbFiles: string[] = Array.isArray((bot as any)?.kbFiles) ? ((bot as any).kbFiles as string[]) : [];

    //Find existing OPEN conversation for this email + domain
    let conversation = await Conversation.findOne({
      email,
      domain,
      status: "OPEN",
    });

    //Create new conversation if none exists
    if (!conversation) {
      conversation = await Conversation.create({
        email,
        domain,
        status: "OPEN",
        messages: [],
        rating: 0,
        lastMessageAt: new Date(),
      });
    }
    
    //Save user message
    const userMessage = await Message.create({
      conversationId: conversation._id,
      role: "user",
      content: message,
    });

    //@ts-ignore
    conversation.messages.push(userMessage._id);

    //Generate AI response
    const userMessageEmbedding = await aiClient.models.embedContent({
        model: 'gemini-embedding-001',
        contents: message,
        config: {
          outputDimensionality: 768, 
        },
    }
    );

    if (
      !userMessageEmbedding.embeddings ||
      !userMessageEmbedding.embeddings[0]?.values
    ) {
      throw new Error("Invalid query embedding");
    }
    

    //pinecone query
    const queryResult = await index.query({
      vector: userMessageEmbedding.embeddings[0].values,
      topK: 3,
      includeMetadata: true,
      filter: {
        embeddingID: "files",
        ...(kbFiles.length > 0 ? { fileId: { $in: kbFiles } } : {}),
      },
    });
    
    
    const context = queryResult.matches
    .map(m => `Source (${m.metadata.sourceName}):\n${m.metadata.text}`)
    .join("\n\n");

    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
      },
      contents: [
        createUserContent([
          context, userMessage.content
        ]),
      ],
    });

    // const response = {
    //   text: "AI response"
    // }

    //Save bot message
    const botMessage = await Message.create({
      conversationId: conversation._id,
      role: "bot",
      content: response.text,
    });

    //@ts-ignore
    conversation.messages.push(botMessage._id);
    conversation.lastMessageAt = new Date();

    await conversation.save();

    res.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:5501");

    //Return SAME conversationId every time
    return res.status(200).json({
      success: true,
      message: response.text,
      conversationId: conversation._id,
    });

  } catch (err) {
    console.error("Chat error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

//GET CHAT CONVERSATION
router.get("/chat/:conversationId", async (req, res) => {
  const conversationId = req.params.conversationId;

  try {
    const conversation = await Conversation.findById(conversationId)
      .populate("messages");

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: "Conversation found",
      data: conversation
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Server error",
      data: null
    });
  }
});

//Voicebot Conversations
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

router.get("/conversation-details/:conversationId", async (req, res) => {
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
