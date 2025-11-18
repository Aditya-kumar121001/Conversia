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
exports.rateLimit = void 0;
const User_1 = require("../models/User");
const Agent_1 = require("../models/Agent");
// NO FREE USER CAN MAKE ONE AGENT WIHT 1 MINUTES OF FREE CALL
// The agentLimiter middleware should be configured to allow free users to create only one agent per minute.
// The flow is as follows:
// 1. When a user (especially a free user) tries to create a new agent, this middleware is applied to the route.
// 2. The middleware checks the user's identity (e.g., via req.userId or req.user).
// 3. It determines if the user is a free user (not premium).
// 4. If the user is free, it enforces a rate limit: only 1 agent creation request per 1 minute is allowed.
// 5. If the user exceeds this limit, the middleware responds with an error (e.g., 429 Too Many Requests).
// 6. Premium users are either not rate limited or have a much higher limit.
// 7. After passing the middleware, the agent creation logic proceeds as normal.
const rateLimit = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.body;
    const { isPremium } = yield User_1.User.findOne({ userId: userId });
    if (!isPremium) {
        const agentCount = yield Agent_1.Agent.countDocuments({ userId: userId });
        if (agentCount >= 1) {
            return res.status(429).json({ error: "Free users can only create one agent." });
        }
        next();
    }
});
exports.rateLimit = rateLimit;
//# sourceMappingURL=rateLimiter.js.map