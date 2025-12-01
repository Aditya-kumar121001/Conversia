import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { Bot } from "../models/Bot";
const router = Router();

router.get("/meta/:domainId", authMiddleware, async (req, res) => {
    const userId = req.body;
    if(!userId) res.send(401).json({message: "Unauthorized User"})

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

export default router;