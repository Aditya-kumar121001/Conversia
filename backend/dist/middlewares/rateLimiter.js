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
exports.globalApiLimiter = exports.agentRateLimiter = exports.executionLimiter = exports.workflowCreateLimiter = exports.kbUploadLimiter = exports.domainUpdateLimiter = exports.domainCreateLimiter = exports.chatMessageLimiter = exports.waitlistLimiter = exports.authLimiter = exports.signinLimiter = exports.otpLimiter = void 0;
const User_1 = require("../models/User");
const Agent_1 = require("../models/Agent");
// ── In-memory sliding-window store ──────────────────────────────────────
// Key → { count, windowStart }. Entries auto-expire when the window elapses.
const rateLimitStore = new Map();
// Cleanup expired entries every 10 minutes to prevent memory leaks
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore) {
        if (now - entry.windowStart > 15 * 60 * 1000) { // remove after 15 min
            rateLimitStore.delete(key);
        }
    }
}, 10 * 60 * 1000);
// ── Generic rate-limit helper ───────────────────────────────────────────
/**
 * Creates a rate-limiting middleware using the in-memory sliding-window store.
 * @param prefix  - Unique namespace for the limiter (e.g. "auth", "chat")
 * @param maxHits - Max requests allowed within the window
 * @param windowMs - Window duration in milliseconds
 * @param keyFn   - Extracts the rate-limit key from the request (defaults to IP)
 * @param message - Custom 429 error message
 */
function createRateLimiter(prefix, maxHits, windowMs, keyFn = (req) => req.ip || "unknown", message = "Too many requests. Please try again later.") {
    return (req, res, next) => {
        const identifier = keyFn(req);
        const key = `rate_limit:${prefix}:${identifier}`;
        const now = Date.now();
        const stored = rateLimitStore.get(key);
        if (stored && now - stored.windowStart < windowMs) {
            if (stored.count >= maxHits) {
                return res.status(429).json({ error: message });
            }
            stored.count++;
            rateLimitStore.set(key, stored);
        }
        else {
            rateLimitStore.set(key, { count: 1, windowStart: now });
        }
        next();
    };
}
// ── Auth rate limiters ──────────────────────────────────────────────────
// POST /auth/initiate-signin — 5 OTP requests per IP per 5 minutes
exports.otpLimiter = createRateLimiter("otp", 5, 5 * 60 * 1000, (req) => req.ip || "unknown", "Too many OTP requests. Please wait 5 minutes before trying again.");
// POST /auth/signin — 10 sign-in attempts per IP per 15 minutes
exports.signinLimiter = createRateLimiter("signin", 10, 15 * 60 * 1000, (req) => req.ip || "unknown", "Too many sign-in attempts. Please try again later.");
// General auth route limiter — 20 requests per user per 5 minutes
exports.authLimiter = createRateLimiter("auth", 20, 5 * 60 * 1000, (req) => String(req.userId || req.ip || "unknown"));
// ── Waitlist rate limiter ───────────────────────────────────────────────
// POST /waitlist/register — 3 registrations per IP per hour
exports.waitlistLimiter = createRateLimiter("waitlist", 3, 60 * 60 * 1000, (req) => req.ip || "unknown", "Too many waitlist requests. Please try again later.");
// ── Chatbot (public) rate limiter ───────────────────────────────────────
// POST /conversation/chat/:domain — 30 messages per email per 5 minutes
exports.chatMessageLimiter = createRateLimiter("chat_msg", 30, 5 * 60 * 1000, (req) => { var _a; return ((_a = req.body) === null || _a === void 0 ? void 0 : _a.email) || req.ip || "unknown"; }, "You're sending messages too fast. Please slow down.");
// ── Domain rate limiter ─────────────────────────────────────────────────
// POST /domain/new-domain — 5 domain creations per user per hour
exports.domainCreateLimiter = createRateLimiter("domain_create", 5, 60 * 60 * 1000, (req) => String(req.userId || "unknown"), "Too many domain creation requests. Please try again later.");
// PUT /domain/:domainUrl — 30 setting updates per user per 5 minutes
exports.domainUpdateLimiter = createRateLimiter("domain_update", 30, 5 * 60 * 1000, (req) => String(req.userId || "unknown"), "Too many settings updates. Please try again later.");
// ── KB (Knowledge Base) rate limiter ────────────────────────────────────
// POST /kb/create-kb — 10 uploads per user per hour
exports.kbUploadLimiter = createRateLimiter("kb_upload", 10, 60 * 60 * 1000, (req) => String(req.userId || "unknown"), "Too many file uploads. Please try again later.");
// ── Workflow / Execution rate limiters ──────────────────────────────────
// POST /workflow/create-workflow — 10 workflow creations per user per hour
exports.workflowCreateLimiter = createRateLimiter("workflow_create", 10, 60 * 60 * 1000, (req) => String(req.userId || "unknown"), "Too many workflow creation requests. Please try again later.");
// POST /workflow/executions/:workflowId — 20 executions per user per 5 minutes
exports.executionLimiter = createRateLimiter("execution", 20, 5 * 60 * 1000, (req) => String(req.userId || "unknown"), "Too many execution requests. Please slow down.");
// ── Agent creation limiter (free-tier gate) ─────────────────────────────
// Limits free users to 1 agent total (not a sliding window — it's a hard cap)
const agentRateLimiter = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    try {
        const user = yield User_1.User.findById(userId);
        if (!user) {
            return res.status(401).json({ error: "User not found." });
        }
        if (!user.isPremium) {
            const agentCount = yield Agent_1.Agent.countDocuments({ userId: userId });
            if (agentCount >= 1) {
                return res.status(429).json({ error: "Free users can only create one agent. Upgrade to Premium for unlimited agents." });
            }
        }
        next();
    }
    catch (e) {
        console.error("agentRateLimiter error:", e);
        return res.status(500).json({ error: "Internal server error." });
    }
});
exports.agentRateLimiter = agentRateLimiter;
// ── Global API limiter (optional — apply at app level) ──────────────────
// 100 requests per IP per minute — general abuse protection
exports.globalApiLimiter = createRateLimiter("global", 100, 60 * 1000, (req) => req.ip || "unknown", "Too many requests from this IP. Please try again later.");
//# sourceMappingURL=rateLimiter.js.map