import Router from 'express'
const router = Router();
import {v4 as uuid4} from 'uuid'
import { Domain } from '../models/Domain';
import { authMiddleware } from '../middlewares/authMiddleware';
import { botCongif } from '../utils';
import { Bot } from '../models/Bot';

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
        console.log(allDomains)
        res.status(200).json(allDomains)
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

export default router;