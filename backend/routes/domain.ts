import Router from 'express'
const router = Router();
import {v4 as uuid4} from 'uuid'
import { Domain } from '../models/Domain';
import { authMiddleware } from '../middlewares/authMiddleware';
import { botCongif } from '../utils';
import { Bot } from '../models/Bot';
import { User } from "../models/User"
import { Conversation } from '../models/Conversation';

router.post("/new-domain", authMiddleware ,async (req,res) => {
    const userId = req.userId;
    if(!userId) return res.status(401).send("Unauthorized User");

    const {domainName, domainUrl, domainImageUrl} = req.body;
    if(!domainName || !domainUrl || !domainImageUrl) return res.status(400).json({
        success: false, message: "Missing required fields"
    })
    const domainId = uuid4()
    try{
        let domain = new Domain({
            userId: userId,
            domainId: domainId,
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
        const exisitingBots = await Bot.findOne({domainId: domainId})
        if(exisitingBots){
            return res.status(200).json({
                message: "Bots already exists"
            })
        }
        try{
            let chatBot = new Bot({
                domainId: domainId,
                botType: "chat",
                systemPrompt: botCongif.instructions.systemPrompt,
                firstMessage: botCongif.instructions.firstMessage,
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
                domainId: domainId,
                botType: "voice",
                systemPrompt: botCongif.instructions.systemPrompt,
                firstMessage: botCongif.instructions.firstMessage,
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

    const body = req.body || {};

    const allowedTopLevel = [
      "botType",
      "systemPrompt",
      "firstMessage",
      "language",
      "context",
    ];

    const updateSet: Record<string, any> = pick(body, allowedTopLevel);

    const allowedAppearanceKeys = ["themeColor", "fontSize", "logoUrl"];
    if (Object.prototype.hasOwnProperty.call(body, "appearance_settings")) {
      const appearance = pick(body.appearance_settings, allowedAppearanceKeys);
      if (Object.keys(appearance).length > 0) {
        updateSet["appearance_settings"] = appearance;
      }
    } else {
      for (const k of allowedAppearanceKeys) {
        const nestedKey = `appearance_settings.${k}`;
        if (Object.prototype.hasOwnProperty.call(body, nestedKey)) {
          if (
            !Object.prototype.hasOwnProperty.call(updateSet, "appearance_settings") ||
            typeof (updateSet as any).appearance_settings !== "object" ||
            (updateSet as any).appearance_settings === null
          ) {
            (updateSet as any).appearance_settings = {};
          }
          ((updateSet as any).appearance_settings as Record<string, unknown>)[k] = body[nestedKey];
        }
      }
    }

    if (!("firstMessage" in updateSet) && Object.prototype.hasOwnProperty.call(body, "greeting")) {
      (updateSet as Record<string, unknown>)["firstMessage"] = body.greeting;
    }

    if (Object.keys(updateSet).length === 0) {
      return res.status(400).json({ success: false, message: "No valid fields to update" });
    }

    const domainIdToUse = domain.domainId ?? String(domain._id) ?? domain.domainUrl;
    if (!domainIdToUse) {
      console.error("Domain missing domainId/_id:", domain);
      return res.status(500).json({ success: false, message: "Domain identifier missing" });
    }

    let updatedBot = await Bot.findOneAndUpdate(
      { domainId: domainIdToUse },
      { $set: updateSet },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedBot) {
      const createObj: any = {
        domainId: domainIdToUse,
        botType: updateSet.botType ?? "chat",
        systemPrompt: updateSet.systemPrompt ?? "",
        firstMessage: updateSet.firstMessage ?? "",
        appearance_settings: updateSet.appearance_settings ?? {
          themeColor: "#000000",
          fontSize: "14",
          logoUrl: "",
        },
        language: updateSet.language ?? "en",
        context: updateSet.context ?? "",
        userId: domain.userId ?? userId,
        domainUrl: domain.domainUrl ?? domainUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
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