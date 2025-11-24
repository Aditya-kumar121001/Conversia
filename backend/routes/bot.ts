import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
const router = Router();

router.get("/", authMiddleware, async (req, res) => {
    const userId = req.body;
    if(!userId) res.send(401).json({message: "Unauthorized User"})

    
})  

export default router;