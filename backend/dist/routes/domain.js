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
const uuid_1 = require("uuid");
const Domain_1 = require("../models/Domain");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const utils_1 = require("../utils");
const Bot_1 = require("../models/Bot");
router.post("/new-domain", authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    if (!userId)
        return res.status(401).send("Unauthorized User");
    const { domainName, domainUrl, domainImageUrl } = req.body;
    if (!domainName || !domainUrl || !domainImageUrl)
        return res.status(400).json({
            success: false, message: "Missing required fields"
        });
    const domainId = (0, uuid_1.v4)();
    try {
        let domain = new Domain_1.Domain({
            userId: userId,
            domainId: domainId,
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
        const exisitingBots = yield Bot_1.Bot.findOne({ domainId: domainId });
        if (exisitingBots) {
            return res.status(200).json({
                message: "Bots already exists"
            });
        }
        try {
            let chatBot = new Bot_1.Bot({
                domainId: domainId,
                botType: "chat",
                systemPrompt: utils_1.botCongif.instructions.systemPrompt,
                firstMessage: utils_1.botCongif.instructions.firstMessage,
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
                domainId: domainId,
                botType: "voice",
                systemPrompt: utils_1.botCongif.instructions.systemPrompt,
                firstMessage: utils_1.botCongif.instructions.firstMessage,
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
        res.status(200).json(allDomains);
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
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
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
        const allowedAppearanceKeys = ["themeColor", "fontSize", "logoUrl"];
        if (Object.prototype.hasOwnProperty.call(body, "appearance_settings")) {
            const appearance = pick(body.appearance_settings, allowedAppearanceKeys);
            if (Object.keys(appearance).length > 0) {
                updateSet["appearance_settings"] = appearance;
            }
        }
        else {
            for (const k of allowedAppearanceKeys) {
                const nestedKey = `appearance_settings.${k}`;
                if (Object.prototype.hasOwnProperty.call(body, nestedKey)) {
                    if (!Object.prototype.hasOwnProperty.call(updateSet, "appearance_settings") ||
                        typeof updateSet.appearance_settings !== "object" ||
                        updateSet.appearance_settings === null) {
                        updateSet.appearance_settings = {};
                    }
                    updateSet.appearance_settings[k] = body[nestedKey];
                }
            }
        }
        if (!("firstMessage" in updateSet) && Object.prototype.hasOwnProperty.call(body, "greeting")) {
            updateSet["firstMessage"] = body.greeting;
        }
        if (Object.keys(updateSet).length === 0) {
            return res.status(400).json({ success: false, message: "No valid fields to update" });
        }
        const domainIdToUse = (_b = (_a = domain.domainId) !== null && _a !== void 0 ? _a : String(domain._id)) !== null && _b !== void 0 ? _b : domain.domainUrl;
        if (!domainIdToUse) {
            console.error("Domain missing domainId/_id:", domain);
            return res.status(500).json({ success: false, message: "Domain identifier missing" });
        }
        let updatedBot = yield Bot_1.Bot.findOneAndUpdate({ domainId: domainIdToUse }, { $set: updateSet }, { new: true, runValidators: true }).lean();
        if (!updatedBot) {
            const createObj = {
                domainId: domainIdToUse,
                botType: (_c = updateSet.botType) !== null && _c !== void 0 ? _c : "chat",
                systemPrompt: (_d = updateSet.systemPrompt) !== null && _d !== void 0 ? _d : "",
                firstMessage: (_e = updateSet.firstMessage) !== null && _e !== void 0 ? _e : "",
                appearance_settings: (_f = updateSet.appearance_settings) !== null && _f !== void 0 ? _f : {
                    themeColor: "#000000",
                    fontSize: "14",
                    logoUrl: "",
                },
                language: (_g = updateSet.language) !== null && _g !== void 0 ? _g : "en",
                context: (_h = updateSet.context) !== null && _h !== void 0 ? _h : "",
                userId: (_j = domain.userId) !== null && _j !== void 0 ? _j : userId,
                domainUrl: (_k = domain.domainUrl) !== null && _k !== void 0 ? _k : domainUrl,
                createdAt: new Date(),
                updatedAt: new Date(),
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
exports.default = router;
//# sourceMappingURL=domain.js.map