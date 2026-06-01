import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { User } from "../models/User";
import { Domain } from "../models/Domain";
import { Workflow } from "../models/Workflow";
import { Conversation } from "../models/Conversation";
import { File } from "../models/KnowlodgeBase";
import { getLimitsForUser, PLAN_LIMITS } from "../planConfig";

const router = Router();

/**
 * GET /plan/status — returns the user's current plan, limits, and usage counts.
 */
router.get("/status", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const limits = getLimitsForUser(user);

    // Usage counts
    const domainCount = await Domain.countDocuments({ userId: req.userId });
    const workflowCount = await Workflow.countDocuments({ userId: req.userId });
    const kbFileCount = await File.countDocuments({ userId: req.userId });

    // Conversations this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const userDomains = await Domain.find({ userId: req.userId }).lean();
    const domainNames = userDomains.map(d => d.domainName);
    const conversationCount = await Conversation.countDocuments({
      domain: { $in: domainNames },
      createdAt: { $gte: startOfMonth },
    });

    return res.status(200).json({
      success: true,
      plan: user.plan || "free",
      isPremium: user.isPremium,
      limits: {
        maxDomains: limits.maxDomains === Infinity ? -1 : limits.maxDomains,
        maxConversationsPerMonth: limits.maxConversationsPerMonth === Infinity ? -1 : limits.maxConversationsPerMonth,
        maxKBFiles: limits.maxKBFiles === Infinity ? -1 : limits.maxKBFiles,
        maxWorkflows: limits.maxWorkflows === Infinity ? -1 : limits.maxWorkflows,
        voiceAgentsEnabled: limits.voiceAgentsEnabled,
        workflowEmailEnabled: limits.workflowEmailEnabled,
        chatHistoryDays: limits.chatHistoryDays,
      },
      usage: {
        domainCount,
        workflowCount,
        kbFileCount,
        conversationCount,
      },
    });
  } catch (e) {
    console.error("GET /plan/status error:", e);
    return res.status(500).json({ success: false, message: "Failed to fetch plan status" });
  }
});

/**
 * GET /plan/tiers — returns the tier comparison for the pricing page.
 */
router.get("/tiers", async (_req, res) => {
  const serializeLimits = (limits: typeof PLAN_LIMITS.free) => ({
    ...limits,
    maxDomains: limits.maxDomains === Infinity ? -1 : limits.maxDomains,
    maxConversationsPerMonth: limits.maxConversationsPerMonth === Infinity ? -1 : limits.maxConversationsPerMonth,
    maxKBFiles: limits.maxKBFiles === Infinity ? -1 : limits.maxKBFiles,
    maxWorkflows: limits.maxWorkflows === Infinity ? -1 : limits.maxWorkflows,
  });

  return res.status(200).json({
    success: true,
    tiers: {
      free: serializeLimits(PLAN_LIMITS.free),
      premium: serializeLimits(PLAN_LIMITS.premium),
    },
  });
});

export default router;
