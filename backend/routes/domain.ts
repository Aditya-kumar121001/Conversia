import Router from 'express'
const router = Router();
import { Domain } from '../models/Domain';
import { authMiddleware } from '../middlewares/authMiddleware';
import { botCongif } from '../utils';
import { Bot } from '../models/Bot';
import { User } from "../models/User"
import { Conversation } from '../models/Conversation';
import type { UpdateBotSettingsRequest } from '../types';

router.post("/new-domain", authMiddleware ,async (req,res) => {
    const userId = req.userId;
    if(!userId) return res.status(401).send("Unauthorized User");

    const {domainName, domainUrl, domainImageUrl} = req.body;
    if(!domainName || !domainUrl || !domainImageUrl) return res.status(400).json({
        success: false, message: "Missing required fields"
    })
    try{
        let domain = new Domain({
            userId: userId,
            domainName: domainName,
            domainUrl: domainUrl,
            domainImageUrl: domainImageUrl
        })
        await domain.save();
        console.log("Domain Created")
        if (!domain) {
            return res.status(404).json({
              message: "Domain not created",
            });
        }
        const exisitingBots = await Bot.findOne({domainId: domain._id})
        if(exisitingBots){
            return res.status(200).json({
                message: "Bots already exists"
            })
        }
        try{
            let chatBot = new Bot({
                domainId: domain._id,
                domainName: domain.domainName,
                botType: "chat",
                generalSettings: {
                  systemPrompt: botCongif.instructions.systemPrompt,
                  firstMessage: botCongif.instructions.firstMessage,
                  fallbackMessage: botCongif.instructions.fallbackMessage,
                  starters: []
                },
                appearance_settings: {
                    themeColor: botCongif.ui.themeColor,
                    fontSize: "14",
                    logoUrl: domainImageUrl
                },
                language: botCongif.language,
            })
            await chatBot.save();
            console.log("ChatBot is created");
            if(!chatBot){
                return res.status(404).json({
                    message: "Chabot not created",
                });
            }

            let voiceBot = new Bot({
                domainId: domain._id,
                domainName: domain.domainName,
                botType: "voice",
                generalSettings: {
                  systemPrompt: botCongif.instructions.systemPrompt,
                  firstMessage: botCongif.instructions.firstMessage,
                  fallbackMessage: botCongif.instructions.fallbackMessage,
                  starters: []
                },
                appearance_settings: {
                    themeColor: botCongif.ui.themeColor,
                    fontSize: "14",
                    logoUrl: domainImageUrl
                },
                language: botCongif.language,
            })
            await voiceBot.save();
            console.log("Voice bot is created");
            if(!chatBot){
                return res.status(404).json({
                    message: "Voice bot not created",
                });
            }
        } catch(e){
            console.log(e)
        }

        res.status(201).json({
            success: true,
            message: "Domain Created"
        })
    } catch(e){
        console.log(e)
    }
});

router.get("/get-domain", authMiddleware ,async (req,res) => {
    const userId = req.userId;
    if(!userId) return res.status(401).send("Unauthorized User");

    try{
        const allDomains = await Domain.find({userId: userId});
        const user = await User.findOne({ _id: userId });
        res.status(200).json({allDomains,user})
    } catch(e){
        console.log(e)
    }
})

router.get("/meta/:domain", async (req, res) => {
    const domain = req.params.domain;
    if (!domain) {
        return res.status(400).json({ message: "Invalid domain" });
    }

    try {
        const response = await Domain.findOne({ domainName: domain });
        if (!response) {
            return res.status(404).json({
                success: false,
                message: "Domain not found",
            });
        }
        console.log(response);
        res.status(200).json({
            success: true,
            metadata: response,
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});

// Helper: pick allowed keys from obj
const pick = (obj: any, keys: string[]) => {
  const out: Record<string, any> = {};
  for (const k of keys)
    if (Object.prototype.hasOwnProperty.call(obj, k)) out[k] = obj[k];
  return out;
};

router.put("/:domainUrl", authMiddleware, async (req, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

  const domainUrl = req.params.domainUrl;
  if (!domainUrl) return res.status(400).json({ success: false, message: "domainUrl required" });

  try {
    const domain = await Domain.findOne({ domainUrl: domainUrl, userId: userId }).lean();
    if (!domain) return res.status(404).json({ success: false, message: "Domain not found" });

    const body: UpdateBotSettingsRequest = req.body || {};

    const allowedTopLevel = [
      "botType",
      "systemPrompt",
      "firstMessage",
      "language",
      "context",
    ];

    const updateSet: Record<string, unknown> = pick(body, allowedTopLevel);

    // Handle appearance_settings
    const allowedAppearanceKeys = ["themeColor", "fontSize", "logoUrl"];
    if (Object.prototype.hasOwnProperty.call(body, "appearance_settings")) {
      const appearance = pick(body.appearance_settings || {}, allowedAppearanceKeys);
      if (Object.keys(appearance).length > 0) {
        updateSet["appearance_settings"] = appearance;
      }
    } else {
      for (const k of allowedAppearanceKeys) {
        const nestedKey = `appearance_settings.${k}`;
        if (Object.prototype.hasOwnProperty.call(body, nestedKey)) {
          if (
            !Object.prototype.hasOwnProperty.call(updateSet, "appearance_settings") ||
            typeof updateSet["appearance_settings"] !== "object" ||
            updateSet["appearance_settings"] === null
          ) {
            updateSet["appearance_settings"] = {};
          }
          (updateSet["appearance_settings"] as Record<string, unknown>)[k] = (body as Record<string, unknown>)[nestedKey];
        }
      }
    }

    // Map greeting to firstMessage if firstMessage is not already set
    if (!("firstMessage" in updateSet) && body.greeting) {
      updateSet["firstMessage"] = body.greeting;
    }

    if (Object.keys(updateSet).length === 0) {
      return res.status(400).json({ success: false, message: "No valid fields to update" });
    }

    // Convert domain._id (ObjectId) to string for Bot.domainId
    const domainIdToUse = domain._id ? String(domain._id) : null;
    if (!domainIdToUse) {
      console.error("Domain missing _id:", domain);
      return res.status(500).json({ success: false, message: "Domain identifier missing" });
    }

    // Determine botType for filtering - use from body or default to "chat"
    const botType = body.botType || "chat";
    
    // Find and update bot by both domainId and botType to ensure we update the correct bot
    const filterQuery: { domainId: string; botType?: string } = { domainId: domainIdToUse };
    if (botType) {
      filterQuery.botType = botType;
    }

    let updatedBot = await Bot.findOneAndUpdate(
      filterQuery,
      { $set: updateSet },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedBot) {
      // If bot doesn't exist, create it
      const createObj = {
        domainId: domainIdToUse,
        domainName: domain.domainName,
        botType: botType,
        systemPrompt: (updateSet.systemPrompt as string) || "",
        firstMessage: (updateSet.firstMessage as string) || "",
        appearance_settings: (updateSet.appearance_settings as Record<string, unknown>) || {
          themeColor: "#000000",
          fontSize: "14",
          logoUrl: "",
        },
        language: (updateSet.language as string) || "en",
        context: (updateSet.context as string) || "",
      };
      const created = await Bot.create(createObj);
      return res.status(201).json({ success: true, message: "Bot created", bot: created });
    }

    return res.status(200).json({ success: true, message: "Bot settings updated", bot: updatedBot });
  } catch (err) {
    console.error("PUT /:domainUrl error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/chat-history/:domainName", authMiddleware, async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const { domainName } = req.params;
  if (!domainName) {
    return res.status(400).json({ success: false, message: "Domain name required" });
  }

  try {
    const conversations = await Conversation.find({
      domain: domainName,
    })
      .sort({ lastMessageAt: -1 })
      .populate({
        path: "messages",
        select: "role content createdAt updatedAt conversationId",
        options: { sort: { createdAt: 1 } },
      });

    return res.status(200).json({
      success: true,
      history: conversations,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
    });
  }
});

export default router;