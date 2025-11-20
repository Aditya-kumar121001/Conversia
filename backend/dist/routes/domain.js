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
        //bot creation
        //const chatBotId = uuid4();
        //const voiceBotId = uuid4();
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
        console.log(allDomains);
        res.status(200).json(allDomains);
    }
    catch (e) {
        console.log(e);
    }
}));
exports.default = router;
//# sourceMappingURL=domain.js.map