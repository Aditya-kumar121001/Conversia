/**
 * Plan configuration — single source of truth for Free / Premium limits.
 * Every middleware and route guard imports limits from here.
 */

export type PlanTier = "free" | "premium";

export interface PlanLimits {
  maxDomains: number;
  maxConversationsPerMonth: number;
  maxKBFiles: number;
  maxWorkflows: number;
  voiceAgentsEnabled: boolean;
  workflowEmailEnabled: boolean;
  chatHistoryDays: number; // -1 = unlimited
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free: {
    maxDomains: 1,
    maxConversationsPerMonth: 50,
    maxKBFiles: 2,
    maxWorkflows: 1,
    voiceAgentsEnabled: false,
    workflowEmailEnabled: false,
    chatHistoryDays: 7,
  },
  premium: {
    maxDomains: Infinity,
    maxConversationsPerMonth: Infinity,
    maxKBFiles: Infinity,
    maxWorkflows: Infinity,
    voiceAgentsEnabled: true,
    workflowEmailEnabled: true,
    chatHistoryDays: -1,
  },
};

/** Resolve the limits for a given user record. */
export function getLimitsForUser(user: { isPremium?: boolean; plan?: string }): PlanLimits {
  const tier: PlanTier =
    user.isPremium || user.plan === "premium" ? "premium" : "free";
  return PLAN_LIMITS[tier];
}
