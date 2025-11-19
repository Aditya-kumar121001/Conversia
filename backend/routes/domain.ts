import Router from 'express'
const router = Router();
import {v4 as uuid4} from 'uuid'
import { Domain } from '../models/Domain';
import { authMiddleware } from '../middlewares/authMiddleware';

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

export default router;