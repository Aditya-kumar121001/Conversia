import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { Bot } from "../models/Bot";
import { Domain } from "../models/Domain";
const router = Router();

router.get("/meta/:domainId", authMiddleware, async (req, res) => {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized User" });

    //get all bots for the domain
    try{
        const domainId = req.params.domainId
        console.log(domainId)
        const response = await Bot.find({domainId: domainId});
        if(!response) return res.status(404).json({success: false, message: "No bots found"})
        console.log(response)
        res.status(200).json({
            success: true,
            bots: response
        })
    } catch(e){
        console.error(e);
        return res.status(500).json({ success: false, message: "Failed to fetch bots" });
    }
})

router.get("/metadata/:domain/:mode", async (req, res) => {
    try {
        const domain = req.params.domain;
        const mode = req.params.mode;
        if (!domain) {
            return res.status(400).json({ success: false, message: "domain required" });
        }

        const bot = await Bot.findOne({ domainName: domain, botType: mode }).lean();
        if (!bot) {
            return res.status(404).json({ success: false, message: "Chat bot not found" });
        }

        if (!bot.isActive) {
            return res.status(403).json({ success: false, message: "This bot is currently offline.", inactive: true });
        }

        // Strip internal/sensitive fields before sending to the client
        const { kbFiles, elevenlabsAgentId, ...safeBotData } = bot;
        if (safeBotData.generalSettings) {
            const { systemPrompt, ...safeGeneral } = safeBotData.generalSettings;
            safeBotData.generalSettings = safeGeneral as typeof safeBotData.generalSettings;
        }

        return res.status(200).json({ success: true, bot: safeBotData });
    } catch (e) {
        console.error("GET /metadata error:", e);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
});


// Toggle bot active/inactive
router.patch("/toggle/:botId", authMiddleware, async (req, res) => {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    try {
        const bot = await Bot.findById(req.params.botId);
        if (!bot) {
            return res.status(404).json({ success: false, message: "Bot not found" });
        }

        // Verify ownership: check that the bot's domain belongs to this user
        const domain = await Domain.findOne({ _id: bot.domainId, userId });
        if (!domain) {
            return res.status(403).json({ success: false, message: "Forbidden" });
        }

        bot.isActive = !bot.isActive;
        await bot.save();

        return res.status(200).json({
            success: true,
            message: `Bot ${bot.isActive ? "activated" : "deactivated"} successfully`,
            isActive: bot.isActive,
        });
    } catch (e) {
        console.error("PATCH /bot/toggle error:", e);
        return res.status(500).json({ success: false, message: "Failed to toggle bot status" });
    }
});

export default router;