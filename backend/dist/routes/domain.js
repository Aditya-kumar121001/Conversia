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
        const updateSet = {};
        // Handle botType
        if (body.botType) {
            updateSet["botType"] = body.botType;
        }
        // Handle language
        if (body.language) {
            updateSet["language"] = body.language;
        }
        // Handle context
        if (body.context !== undefined) {
            updateSet["context"] = body.context;
        }
        // Handle kbFiles explicitly, or derive it from context.files if present
        const kbFilesFromBody = Array.isArray(body.kbFiles) ? body.kbFiles : undefined;
        let kbFilesFromContext = undefined;
        if (typeof body.context === "string") {
            try {
                const parsed = JSON.parse(body.context);
                const files = Array.isArray(parsed === null || parsed === void 0 ? void 0 : parsed.kbFiles) ? parsed.kbFiles : parsed === null || parsed === void 0 ? void 0 : parsed.files;
                if (Array.isArray(files)) {
                    kbFilesFromContext = files.filter((x) => typeof x === "string");
                }
            }
            catch (_a) {
                // ignore invalid JSON context
            }
        }
        const kbFilesToUse = kbFilesFromBody !== null && kbFilesFromBody !== void 0 ? kbFilesFromBody : kbFilesFromContext;
        if (kbFilesToUse) {
            updateSet["kbFiles"] = kbFilesToUse;
        }
        // Handle generalSettings as nested object
        const generalSettingsUpdate = {};
        let hasGeneralSettingsUpdate = false;
        // Map greeting to firstMessage (for backward compatibility)
        if (body.greeting) {
            generalSettingsUpdate["firstMessage"] = body.greeting;
            hasGeneralSettingsUpdate = true;
        }
        // Handle firstMessage directly
        if (body.firstMessage) {
            generalSettingsUpdate["firstMessage"] = body.firstMessage;
            hasGeneralSettingsUpdate = true;
        }
        // Handle systemPrompt
        if (body.systemPrompt !== undefined) {
            generalSettingsUpdate["systemPrompt"] = body.systemPrompt;
            hasGeneralSettingsUpdate = true;
        }
        // Handle generalSettings object if provided directly
        if (body.generalSettings && typeof body.generalSettings === "object") {
            if (body.generalSettings.firstMessage !== undefined) {
                generalSettingsUpdate["firstMessage"] = body.generalSettings.firstMessage;
                hasGeneralSettingsUpdate = true;
            }
            if (body.generalSettings.fallbackMessage !== undefined) {
                generalSettingsUpdate["fallbackMessage"] = body.generalSettings.fallbackMessage;
                hasGeneralSettingsUpdate = true;
            }
            if (body.generalSettings.starters !== undefined) {
                generalSettingsUpdate["starters"] = body.generalSettings.starters;
                hasGeneralSettingsUpdate = true;
            }
            if (body.generalSettings.systemPrompt !== undefined) {
                generalSettingsUpdate["systemPrompt"] = body.generalSettings.systemPrompt;
                hasGeneralSettingsUpdate = true;
            }
        }
        // Also check for fallbackMessage and starters at top level (for flexibility)
        if (body.fallbackMessage !== undefined) {
            generalSettingsUpdate["fallbackMessage"] = body.fallbackMessage;
            hasGeneralSettingsUpdate = true;
        }
        if (body.starters !== undefined) {
            generalSettingsUpdate["starters"] = body.starters;
            hasGeneralSettingsUpdate = true;
        }
        if (hasGeneralSettingsUpdate) {
            updateSet["generalSettings"] = generalSettingsUpdate;
        }
        // Handle appearance_settings
        const allowedAppearanceKeys = ["themeColor", "fontSize", "logoUrl"];
        if (Object.prototype.hasOwnProperty.call(body, "appearance_settings")) {
            const appearance = pick(body.appearance_settings || {}, allowedAppearanceKeys);
            if (Object.keys(appearance).length > 0) {
                updateSet["appearance_settings"] = appearance;
            }
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
        // Build the update object with proper nested structure
        const mongoUpdate = {};
        // Handle top-level fields
        if (updateSet.botType)
            mongoUpdate["botType"] = updateSet.botType;
        if (updateSet.language)
            mongoUpdate["language"] = updateSet.language;
        if (updateSet.context !== undefined)
            mongoUpdate["context"] = updateSet.context;
        if (updateSet.kbFiles)
            mongoUpdate["kbFiles"] = updateSet.kbFiles;
        // Handle appearance_settings with dot notation for nested updates (prevents losing existing fields)
        if (updateSet.appearance_settings) {
            const as = updateSet.appearance_settings;
            for (const key in as) {
                mongoUpdate[`appearance_settings.${key}`] = as[key];
            }
        }
        // Handle generalSettings with dot notation for nested updates
        if (updateSet.generalSettings) {
            const gs = updateSet.generalSettings;
            for (const key in gs) {
                mongoUpdate[`generalSettings.${key}`] = gs[key];
            }
        }
        let updatedBot = yield Bot_1.Bot.findOneAndUpdate(filterQuery, { $set: mongoUpdate }, { new: true, runValidators: true }).lean();
        if (!updatedBot) {
            // If bot doesn't exist, create it with proper structure
            const createObj = {
                domainId: domainIdToUse,
                domainName: domain.domainName,
                botType: botType,
                generalSettings: {
                    systemPrompt: generalSettingsUpdate.systemPrompt || "",
                    firstMessage: generalSettingsUpdate.firstMessage || "",
                    fallbackMessage: generalSettingsUpdate.fallbackMessage || "",
                    starters: generalSettingsUpdate.starters || [],
                },
                kbFiles: kbFilesToUse || [],
                appearance_settings: updateSet.appearance_settings || {
                    themeColor: "#000000",
                    fontSize: "14",
                    logoUrl: "",
                },
                language: updateSet.language || "en",
            };
            if (updateSet.context !== undefined) {
                createObj.context = updateSet.context;
            }
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