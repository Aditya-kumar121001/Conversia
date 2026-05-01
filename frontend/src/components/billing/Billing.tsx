"use client";

import { useState } from "react";
import { useTenant } from "../../context/Context";
import { BACKEND_URL } from "../../lib/utils";
import {
  Check,
  Globe,
  MessageSquare,
  FileText,
  Zap,
  Mic,
  Mail,
  Clock,
} from "lucide-react";

/* ---------- Plan Feature Row ---------- */
function FeatureRow({
  icon: Icon,
  label,
  free,
  premium,
}: {
  icon: React.ElementType;
  label: string;
  free: string;
  premium: string;
}) {
  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="py-3 pr-4 flex items-center gap-2 text-sm text-gray-700">
        <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
        {label}
      </td>
      <td className="py-3 px-4 text-sm text-center text-gray-600">{free}</td>
      <td className="py-3 pl-4 text-sm text-center font-medium text-gray-900">
        {premium}
      </td>
    </tr>
  );
}

/* ---------- Usage Meter ---------- */
function UsageMeter({
  label,
  current,
  limit,
  icon: Icon,
}: {
  label: string;
  current: number;
  limit: number; // -1 = unlimited
  icon: React.ElementType;
}) {
  const isUnlimited = limit === -1;
  const pct = isUnlimited ? 0 : Math.min((current / limit) * 100, 100);
  const isNearLimit = !isUnlimited && pct >= 80;

  return (
    <div className="p-4 rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Icon className="w-4 h-4 text-gray-400" />
          {label}
        </div>
        <span className="text-xs text-gray-500">
          {current} / {isUnlimited ? "∞" : limit}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isNearLimit
              ? "bg-gradient-to-r from-amber-400 to-red-500"
              : "bg-gradient-to-r from-gray-600 to-gray-900"
          }`}
          style={{ width: isUnlimited ? "0%" : `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ---------- Main Component ---------- */
export default function Billing() {
  const { user, planLimits, planUsage, refreshUser } = useTenant();
  const [upgrading, setUpgrading] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);

  const isPremium = user?.isPremium || user?.plan === "premium";

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/plan/upgrade`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setUpgradeSuccess(true);
        await refreshUser();
        setTimeout(() => setUpgradeSuccess(false), 3000);
      }
    } catch (e) {
      console.error("Upgrade failed:", e);
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Billing & Credits
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your subscription and track usage
        </p>
      </div>

      {/* Success Banner */}
      {upgradeSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-800 animate-in slide-in-from-top duration-300">
          <Check className="w-5 h-5" />
          <span className="text-sm font-medium">
            You've been upgraded to Premium! All limits have been removed.
          </span>
        </div>
      )}

      {/* Plan Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        {/* Free Plan */}
        <div
          className={`relative rounded-2xl border-2 p-6 transition ${
            !isPremium
              ? "border-gray-900 bg-white shadow-lg"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          {!isPremium && (
            <span className="absolute -top-3 left-6 bg-gray-900 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Current Plan
            </span>
          )}
          <h3 className="text-lg font-bold text-gray-900 mb-1">Free</h3>
          <p className="text-sm text-gray-500 mb-4">
            Perfect for getting started
          </p>
          <div className="flex items-baseline gap-1 mb-6">
            <span className="text-3xl font-bold text-gray-900">$0</span>
            <span className="text-sm text-gray-500">/month</span>
          </div>
          <ul className="space-y-2.5 text-sm text-gray-600">
            {[
              "1 domain",
              "50 conversations / month",
              "2 knowledge base files",
              "1 workflow",
              "7 days chat history",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-gray-400" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Premium Plan */}
        <div
          className={`relative rounded-2xl border-2 p-6 transition overflow-hidden ${
            isPremium
              ? "border-blue-400 bg-white shadow-lg"
              : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
          }`}
        >
          {isPremium && (
            <span className="absolute top-1 left-4 bg-gradient-to-r from-blue-700 to-blue-400 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
              Current Plan
            </span>
          )}

          {/* Subtle glow effect */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100/70 to-transparent rounded-bl-full pointer-events-none" />

          <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
            Premium
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            For teams that need more power
          </p>
          <div className="flex items-baseline gap-1 mb-6">
            <span className="text-3xl font-bold text-gray-900">$49</span>
            <span className="text-sm text-gray-500">/month</span>
          </div>
          <ul className="space-y-2.5 text-sm text-gray-600 mb-6">
            {[
              "Unlimited domains",
              "Unlimited conversations",
              "Unlimited KB file uploads",
              "Unlimited workflows",
              "Voice AI agents",
              "Email automation",
              "Unlimited chat history",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                {f}
              </li>
            ))}
          </ul>

          {!isPremium && (
            <button
              onClick={handleUpgrade}
              disabled={upgrading}
              className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-black rounded-lg hover:bg-gray-800 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {upgrading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Upgrading…
                </span>
              ) : (
                "Upgrade to Premium"
              )}
            </button>
          )}
        </div>
      </div>

      {/* Usage Section */}
      <div className="mb-10">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Current Usage
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <UsageMeter
            label="Domains"
            current={planUsage?.domainCount ?? 0}
            limit={planLimits?.maxDomains ?? 1}
            icon={Globe}
          />
          <UsageMeter
            label="Conversations"
            current={planUsage?.conversationCount ?? 0}
            limit={planLimits?.maxConversationsPerMonth ?? 50}
            icon={MessageSquare}
          />
          <UsageMeter
            label="KB Files"
            current={planUsage?.kbFileCount ?? 0}
            limit={planLimits?.maxKBFiles ?? 2}
            icon={FileText}
          />
          <UsageMeter
            label="Workflows"
            current={planUsage?.workflowCount ?? 0}
            limit={planLimits?.maxWorkflows ?? 1}
            icon={Zap}
          />
        </div>
      </div>

      {/* Feature Comparison Table */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">
            Plan Comparison
          </h2>
        </div>
        <div className="px-6 py-2">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 pr-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Feature
                </th>
                <th className="py-3 px-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Free
                </th>
                <th className="py-3 pl-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Premium
                </th>
              </tr>
            </thead>
            <tbody>
              <FeatureRow icon={Globe} label="Domains" free="1" premium="Unlimited" />
              <FeatureRow icon={MessageSquare} label="Conversations / month" free="50" premium="Unlimited" />
              <FeatureRow icon={FileText} label="Knowledge Base files" free="2" premium="Unlimited" />
              <FeatureRow icon={Zap} label="Workflows" free="1" premium="Unlimited" />
              <FeatureRow icon={Mic} label="Voice AI agents" free="—" premium="✓" />
              <FeatureRow icon={Mail} label="Email automation" free="—" premium="✓" />
              <FeatureRow icon={Clock} label="Chat history" free="7 days" premium="Unlimited" />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
