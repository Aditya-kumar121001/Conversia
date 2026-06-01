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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const Bot_1 = require("../models/Bot");
const router = (0, express_1.Router)();
router.get("/meta/:domainId", authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    if (!userId)
        return res.status(401).json({ message: "Unauthorized User" });
    //get all bots for the domain
    try {
        const domainId = req.params.domainId;
        console.log(domainId);
        const response = yield Bot_1.Bot.find({ domainId: domainId });
        if (!response)
            return res.status(404).json({ success: false, message: "No bots found" });
        console.log(response);
        res.status(200).json({
            success: true,
            bots: response
        });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: "Failed to fetch bots" });
    }
}));
router.get("/metadata/:domain/:mode", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const domain = req.params.domain;
        const mode = req.params.mode;
        if (!domain) {
            return res.status(400).json({ success: false, message: "domain required" });
        }
        const bot = yield Bot_1.Bot.findOne({ domainName: domain, botType: mode }).lean();
        if (!bot) {
            return res.status(404).json({ success: false, message: "Chat bot not found" });
        }
        // Strip internal/sensitive fields before sending to the client
        const { kbFiles, elevenlabsAgentId } = bot, safeBotData = __rest(bot, ["kbFiles", "elevenlabsAgentId"]);
        if (safeBotData.generalSettings) {
            const _a = safeBotData.generalSettings, { systemPrompt } = _a, safeGeneral = __rest(_a, ["systemPrompt"]);
            safeBotData.generalSettings = safeGeneral;
        }
        return res.status(200).json({ success: true, bot: safeBotData });
    }
    catch (e) {
        console.error("GET /metadata error:", e);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}));
exports.default = router;
//# sourceMappingURL=bot.js.map