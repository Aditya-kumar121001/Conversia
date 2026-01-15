"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = (0, express_1.default)();
const Domain_1 = require("../models/Domain");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const utils_1 = require("../utils");
const Bot_1 = require("../models/Bot");
const User_1 = require("../models/User");
const Conversation_1 = require("../models/Conversation");
router.post("/new-domain", authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    if (!userId)
        return res.status(401).send("Unauthorized User");
    const { domainName, domainUrl, domainImageUrl } = req.body;
    if (!domainName || !domainUrl || !domainImageUrl)
        return res.status(400).json({
            success: false, message: "Missing required fields"
        });
    try {
        let domain = new Domain_1.Domain({
            userId: userId,
            domainName: domainName,
            domainUrl: domainUrl,
            domainImageUrl: domainImageUrl
        });
        yield domain.save();
        console.log("Domain Created");
        if (!domain) {
            return res.status(404).json({
                message: "Domain not created",
            });
        }
        const exisitingBots = yield Bot_1.Bot.findOne({ domainId: domain._id });
        if (exisitingBots) {
            return res.status(200).json({
                message: "Bots already exists"
            });
        }
        try {
            let chatBot = new Bot_1.Bot({
                domainId: domain._id,
                domainName: domain.domainName,
                botType: "chat",
                generalSettings: {
                    systemPrompt: utils_1.botCongif.instructions.systemPrompt,
                    firstMessage: utils_1.botCongif.instructions.firstMessage,
                    fallbackMessage: utils_1.botCongif.instructions.fallbackMessage,
                    starters: []
                },
                appearance_settings: {
                    themeColor: utils_1.botCongif.ui.themeColor,
                    fontSize: "14",
                    logoUrl: domainImageUrl
                },
                language: utils_1.botCongif.language,
            });
            yield chatBot.save();
            console.log("ChatBot is created");
            if (!chatBot) {
                return res.status(404).json({
                    message: "Chabot not created",
                });
            }
            let voiceBot = new Bot_1.Bot({
                domainId: domain._id,
                domainName: domain.domainName,
                botType: "voice",
                generalSettings: {
                    systemPrompt: utils_1.botCongif.instructions.systemPrompt,
                    firstMessage: utils_1.botCongif.instructions.firstMessage,
                    fallbackMessage: utils_1.botCongif.instructions.fallbackMessage,
                    starters: []
                },
                appearance_settings: {
                    themeColor: utils_1.botCongif.ui.themeColor,
                    fontSize: "14",
                    logoUrl: domainImageUrl
                },
                language: utils_1.botCongif.language,
            });
            yield voiceBot.save();
            console.log("Voice bot is created");
            if (!chatBot) {
                return res.status(404).json({
                    message: "Voice bot not created",
                });
            }
        }
        catch (e) {
            console.log(e);
        }
        res.status(201).json({
            success: true,
            message: "Domain Created"
        });
    }
    catch (e) {
        console.log(e);
    }
}));
router.get("/get-domain", authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    if (!userId)
        return res.status(401).send("Unauthorized User");
    try {
        const allDomains = yield Domain_1.Domain.find({ userId: userId });
        const user = yield User_1.User.findOne({ _id: userId });
        res.status(200).json({ allDomains, user });
    }
    catch (e) {
        console.log(e);
    }
}));
router.get("/meta/:domain", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const domain = req.params.domain;
    if (!domain) {
        return res.status(400).json({ message: "Invalid domain" });
    }
    try {
        const response = yield Domain_1.Domain.findOne({ domainName: domain });
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
    }
    catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}));
// Helper: pick allowed keys from obj
const pick = (obj, keys) => {
    const out = {};
    for (const k of keys)
        if (Object.prototype.hasOwnProperty.call(obj, k))
            out[k] = obj[k];
    return out;
};
router.put("/:domainUrl", authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    if (!userId)
        return res.status(401).json({ success: false, message: "Unauthorized" });
    const domainUrl = req.params.domainUrl;
    if (!domainUrl)
        return res.status(400).json({ success: false, message: "domainUrl required" });
    try {
        const domain = yield Domain_1.Domain.findOne({ domainUrl: domainUrl, userId: userId }).lean();
        if (!domain)
            return res.status(404).json({ success: false, message: "Domain not found" });
        const body = req.body || {};
        const allowedTopLevel = [
            "botType",
            "systemPrompt",
            "firstMessage",
            "language",
            "context",
        ];
        const updateSet = pick(body, allowedTopLevel);
        // Handle appearance_settings
        const allowedAppearanceKeys = ["themeColor", "fontSize", "logoUrl"];
        if (Object.prototype.hasOwnProperty.call(body, "appearance_settings")) {
            const appearance = pick(body.appearance_settings || {}, allowedAppearanceKeys);
            if (Object.keys(appearance).length > 0) {
                updateSet["appearance_settings"] = appearance;
            }
        }
        else {
            for (const k of allowedAppearanceKeys) {
                const nestedKey = `appearance_settings.${k}`;
                if (Object.prototype.hasOwnProperty.call(body, nestedKey)) {
                    if (!Object.prototype.hasOwnProperty.call(updateSet, "appearance_settings") ||
                        typeof updateSet["appearance_settings"] !== "object" ||
                        updateSet["appearance_settings"] === null) {
                        updateSet["appearance_settings"] = {};
                    }
                    updateSet["appearance_settings"][k] = body[nestedKey];
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
        const filterQuery = { domainId: domainIdToUse };
        if (botType) {
            filterQuery.botType = botType;
        }
        let updatedBot = yield Bot_1.Bot.findOneAndUpdate(filterQuery, { $set: updateSet }, { new: true, runValidators: true }).lean();
        if (!updatedBot) {
            // If bot doesn't exist, create it
            const createObj = {
                domainId: domainIdToUse,
                domainName: domain.domainName,
                botType: botType,
                systemPrompt: updateSet.systemPrompt || "",
                firstMessage: updateSet.firstMessage || "",
                appearance_settings: updateSet.appearance_settings || {
                    themeColor: "#000000",
                    fontSize: "14",
                    logoUrl: "",
                },
                language: updateSet.language || "en",
                context: updateSet.context || "",
            };
            const created = yield Bot_1.Bot.create(createObj);
            return res.status(201).json({ success: true, message: "Bot created", bot: created });
        }
        return res.status(200).json({ success: true, message: "Bot settings updated", bot: updatedBot });
    }
    catch (err) {
        console.error("PUT /:domainUrl error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}));
router.get("/chat-history/:domainName", authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const { domainName } = req.params;
    if (!domainName) {
        return res.status(400).json({ success: false, message: "Domain name required" });
    }
    try {
        const conversations = yield Conversation_1.Conversation.find({
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
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch conversations",
        });
    }
}));
exports.default = router;
//# sourceMappingURL=domain.js.map