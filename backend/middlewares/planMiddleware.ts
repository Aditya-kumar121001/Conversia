import type { Request, Response, NextFunction } from "express";
import { User } from "../models/User";
import { getLimitsForUser } from "../planConfig";
import { Domain } from "../models/Domain";
import { Workflow } from "../models/Workflow";
import { KnowledgeBase, File } from "../models/KnowlodgeBase";
import { Conversation } from "../models/Conversation";

/**
 * Block the request entirely if the user is not on a premium plan.
 * Use for premium-only features like voice agents.
 */
export function requirePremium() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await User.findById(req.userId).lean();
      if (!user) return res.status(401).json({ success: false, message: "User not found" });

      const limits = getLimitsForUser(user);
      if (!limits.voiceAgentsEnabled && !user.isPremium) {
        return res.status(403).json({
          success: false,
          message: "This feature requires a Premium plan.",
          upgradeRequired: true,
        });
      }
      next();
    } catch (e) {
      console.error("requirePremium error:", e);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
}

/**
 * Enforce maximum domain count for the user's plan tier.
 */
export function enforceDomainLimit() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await User.findById(req.userId).lean();
      if (!user) return res.status(401).json({ success: false, message: "User not found" });

      const limits = getLimitsForUser(user);
      const domainCount = await Domain.countDocuments({ userId: req.userId });

      if (domainCount >= limits.maxDomains) {
        return res.status(403).json({
          success: false,
          message: `Free plan allows up to ${limits.maxDomains} domain(s). Upgrade to Premium for unlimited domains.`,
          upgradeRequired: true,
          currentCount: domainCount,
          limit: limits.maxDomains,
        });
      }
      next();
    } catch (e) {
      console.error("enforceDomainLimit error:", e);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
}

/**
 * Enforce maximum workflow count for the user's plan tier.
 */
export function enforceWorkflowLimit() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await User.findById(req.userId).lean();
      if (!user) return res.status(401).json({ success: false, message: "User not found" });

      const limits = getLimitsForUser(user);
      const workflowCount = await Workflow.countDocuments({ userId: req.userId });

      if (workflowCount >= limits.maxWorkflows) {
        return res.status(403).json({
          success: false,
          message: `Free plan allows up to ${limits.maxWorkflows} workflow(s). Upgrade to Premium for unlimited workflows.`,
          upgradeRequired: true,
          currentCount: workflowCount,
          limit: limits.maxWorkflows,
        });
      }
      next();
    } catch (e) {
      console.error("enforceWorkflowLimit error:", e);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
}

/**
 * Enforce maximum KB file upload count for the user's plan tier.
 */
export function enforceKBFileLimit() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await User.findById(req.userId).lean();
      if (!user) return res.status(401).json({ success: false, message: "User not found" });

      const limits = getLimitsForUser(user);
      const fileCount = await File.countDocuments({ userId: req.userId });

      if (fileCount >= limits.maxKBFiles) {
        return res.status(403).json({
          success: false,
          message: `Free plan allows up to ${limits.maxKBFiles} knowledge base file(s). Upgrade to Premium for unlimited uploads.`,
          upgradeRequired: true,
          currentCount: fileCount,
          limit: limits.maxKBFiles,
        });
      }
      next();
    } catch (e) {
      console.error("enforceKBFileLimit error:", e);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
}

/**
 * Enforce maximum conversations per month for the user's plan tier.
 * This is checked per-domain, resolved via the domain's userId.
 */
export async function checkConversationLimit(domainName: string): Promise<{ allowed: boolean; message?: string }> {
  try {
    const domain = await Domain.findOne({ domainName }).lean();
    if (!domain) return { allowed: true }; // let downstream handle missing domain

    const user = await User.findById(domain.userId).lean();
    if (!user) return { allowed: true };

    const limits = getLimitsForUser(user);
    if (limits.maxConversationsPerMonth === Infinity) return { allowed: true };

    // Count conversations created this month across all the user's domains
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const userDomains = await Domain.find({ userId: user._id }).lean();
    const domainNames = userDomains.map(d => d.domainName);

    const conversationCount = await Conversation.countDocuments({
      domain: { $in: domainNames },
      createdAt: { $gte: startOfMonth },
    });

    if (conversationCount >= limits.maxConversationsPerMonth) {
      return {
        allowed: false,
        message: `Monthly conversation limit reached (${limits.maxConversationsPerMonth}). Upgrade to Premium for unlimited conversations.`,
      };
    }

    return { allowed: true };
  } catch (e) {
    console.error("checkConversationLimit error:", e);
    return { allowed: true }; // fail-open to avoid blocking users
  }
}
