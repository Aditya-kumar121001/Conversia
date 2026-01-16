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
        console.log(e);
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
        return res.status(200).json({ success: true, bot });
    }
    catch (e) {
        console.log(e);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}));
exports.default = router;
//# sourceMappingURL=bot.js.map