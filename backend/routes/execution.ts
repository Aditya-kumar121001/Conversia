import Router from 'express';
const router = Router();
import { Conversation } from "../models/Conversation";
import { Execution } from '../models/Execution';
import { GoogleGenAI } from '@google/genai';
import { systemPrompt } from '../utils'
import { Domain } from '../models/Domain';
import { InMemoryStore } from '../inMemoryStore';

const aiClient = new GoogleGenAI({apiKey: process.env.GEMINI});

router.post("/chat/:domain", async (req, res) => {
    //parse the user input
    const {message, email, domain, domainId} = req.body;
    if(!message || !email){
        res.status(401).json({message: "Invalid input"})
        return;
    }
    
    //Create conversation
    const newConveration = await Conversation.create({
        email: email,
        createdAt: Date.now,
        updatedAt: Date.now,
        messages: [{
            role: "user",
            content: message,
            timestamp: new Date()
        }]
    })
    //create execution session for 15 mins with create an empty conversation
    const newExecution = await Execution.create({
        domain:  req.params.domain,
        domainId: domainId,
        executionType: "chat",
        executionStatus: "PENDING",
        conversationId: newConveration._id,
        startedAt: new Date(),
        completedAt: null
    });

    //Search on knowledge base => context
    //Call LLM => {message, Context}
    const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: message,
        config:{
            systemInstruction: systemPrompt,
        },
    })

    //console.log(response.text)
    //Stream response to BE
    //Update DB
    //Stream to widget
    //Close session after 15 or on completion

    res.status(200).json({
        success: true,
        message: response.text,
    })
}) 

router.post("/chat/:domain/session", async (req, res) => {
    const {visitorId, domain} = req.body();
    try{
        const metaDomain = await Domain.find({domainName: domain})
        if(!metaDomain){
            res.status(401).json({message: "Invalid Domain"})
            return;
        }
    }catch(e){
        console.log(e)
    }
    if(!visitorId){
        res.status(401).json({message: "Invalid visitor Id"})
        return;
    }
    //create a session
    const newSession = {
        visitorId: visitorId,
        domain: domain,
        expiredAt: new Date(Date.now() + 60*60*1000)
    }

    //store session in memory Store
})

export default router;