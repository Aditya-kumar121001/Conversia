import {Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import Redis from "ioredis";
import { User } from "../models/User";
import { Agent } from "../models/Agent";

//Redis Client
const redisClient = new Redis();

export const agentRateLimiter = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const {isPremium} = await User.findOne({userId: userId})

    if (!isPremium) {
        const agentCount = await Agent.countDocuments({ userId: userId });
        if (agentCount >= 1) {
            return res.status(429).json({ error: "Free users can only create one agent." });
        }
        next()
    }
};

