import Router from 'express';
const router = Router();
import { Conversation } from "../models/Conversation";
import { GoogleGenAI } from '@google/genai';
import { systemPrompt } from '../utils'
import { InMemoryStore } from '../inMemoryStore';
import { Message } from '../models/Message';
import { Domain } from '../models/Domain';
//import {v4 as uuid4} from 'uuid'
import { Session } from '../models/Session';

const aiClient = new GoogleGenAI({apiKey: process.env.GEMINI});
const memory = InMemoryStore.getInstance()

//Create session for the conversation
router.post("/chat/:domain/session", async (req, res) => {
    const domain = req.params.domain
    const {visitorId} = req.body;
    console.log(visitorId)
    try{
        const metaDomain = await Domain.findOne({domainName: domain})
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
        createdAt: Date.now(),
        expiredAt: new Date(Date.now() + 60*60*1000)
    }
    let createdSession;
    try{
        createdSession = await Session.create(newSession);
        console.log(createdSession)
    }catch(e){
        console.log(e)
    }

    //store session in memory Store
    try{
        memory.set(createdSession._id, createdSession);
        console.log("Session is created")
    } catch(e){
        console.log(e)
    }
    const origin = 'http://127.0.0.1:5501'
    res.setHeader('Access-Control-Allow-Origin', origin);

    return res.status(201).json({
        sessionId: createdSession._id,
        visitorId,
        expiresAt: createdSession.expiresAt,
    });
});


router.post("/chat/:domain", async (req, res) => {
    const domain = req.params.domain
    const {message, email} = req.body;
    if(!message || !email){
        res.status(401).json({message: "Invalid input"})
        return;
    }
    
    //Create conversation
    try{
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
        await newConveration.save()
        console.log("Conversaion created")
    } catch(e){
        console.log(e)
    }

    //Search on knowledge base => context
    //Call LLM => {message, Context}
    const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: message,
        config:{
            systemInstruction: systemPrompt,
        },
    })

    //Update DB
    try {
        const conversation = await Conversation.findOne({ email: email }).sort({ createdAt: -1 });

        if (conversation) {
            // Create new message doc
            const newMessage = {
                conversationId: conversation._id,
                role: "assistant",
                content: response.text,
                timestamp: new Date(),
            };
            // Add to conversation's messages array

            const messageDoc = await Message.create(newMessage);
            if (messageDoc && messageDoc._id) {
                // @ts-ignore
                conversation.messages.push(messageDoc._id);
            } else {
                console.warn('Message creation failed or _id missing', messageDoc);
            }
            conversation.updatedAt = new Date();
            await conversation.save();
        } else {
            console.log(`Conversation not found for email: ${email}`);
        }
    } catch (e) {
        console.log(e);
    }

    
    //Close session after 15 or on completion
    const origin = 'http://127.0.0.1:5501'
    res.setHeader('Access-Control-Allow-Origin', origin);

    //Stream to widget
    res.status(200).json({
        success: true,
        message: response.text,
    })
}) 


export default router;