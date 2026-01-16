import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { Bot } from "../models/Bot";
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
        console.log(e)
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

        return res.status(200).json({ success: true, bot });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
});


export default router;