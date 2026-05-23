"use client";
import { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import {
  MessageSquare,
  Phone,
  Star,
  TrendingUp,
  Globe,
  CheckCircle2,
  Layers,
  Zap,
  FileText,
  ThumbsUp,
  Activity,
} from "lucide-react";
import { BACKEND_URL } from "../lib/utils";

/* ─── Types ─────────────────────────────────────────────── */
interface DashboardData {
  // Engagement
  totalConversations: number;
  conversationsToday: number;
  conversationsThisMonth: number;
  totalMessages: number;
  // Quality
  avgRating: number;
  satisfactionRate: number;
  ratedConversationsCount: number;
  resolutionRate: number;
  finishedConversations: number;
  // Bot performance
  totalDomains: number;
  activeDomainsThisMonth: number;
  chatBotCount: number;
  voiceBotCount: number;
  avgMessagesPerConversation: number;
  // Usage / Plan
  workflowCount: number;
  workflowExecutions: number;
  kbFilesCount: number;
  plan: "free" | "premium";
  isPremium: boolean;
  limits: {
    maxDomains: number;
    maxConversationsPerMonth: number;
    maxKBFiles: number;
    maxWorkflows: number;
  };
}

interface MonthData { month: string; count: number; }
interface DayData { date: string; count: number; }

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/* ─── Mini helpers ───────────────────────────────────────── */
function limitLabel(val: number) {
  return val === -1 ? "∞" : String(val);
}
function usagePercent(used: number, max: number) {
  if (max === -1) return 0; // unlimited
  return Math.min(100, Math.round((used / max) * 100));
}

/* ─── Tooltips ───────────────────────────────────────────── */
const BarTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-700 bg-[#1a1a2e] px-3 py-2 shadow-xl text-xs">
      <p className="text-gray-400 mb-1">{label}</p>
      <p className="text-white font-bold text-sm">
        {payload[0].value}{" "}
        <span className="font-normal text-gray-400">messages</span>
      </p>
    </div>
  );
};

const LineTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-700 bg-[#1a1a2e] px-3 py-2 shadow-xl text-xs">
      <p className="text-gray-400 mb-1">{label}</p>
      <p className="text-white font-bold text-sm">
        {payload[0].value}{" "}
        <span className="font-normal text-gray-400">conversations</span>
      </p>
    </div>
  );
};

/* ─── Stat card ──────────────────────────────────────────── */
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = "white",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  accent?: string;
}) {
  return (
    <div className="bg-black rounded-xl p-4 flex flex-col gap-2 shadow-sm border border-gray-800">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-gray-400 uppercase tracking-wide">{label}</span>
        <Icon size={15} className="text-gray-500" />
      </div>
      <span
        className="text-2xl font-bold leading-none"
        style={{ color: accent === "white" ? "#fff" : accent }}
      >
        {value}
      </span>
      {sub && <span className="text-[11px] text-gray-500">{sub}</span>}
    </div>
  );
}

/* ─── Progress bar ───────────────────────────────────────── */
function UsageBar({
  label,
  used,
  max,
  icon: Icon,
}: {
  label: string;
  used: number;
  max: number;
  icon: React.ElementType;
}) {
  const pct = usagePercent(used, max);
  const unlimited = max === -1;
  const danger = pct >= 90;
  const warn = pct >= 70;
  const color = unlimited
    ? "#22c55e"
    : danger
    ? "#ef4444"
    : warn
    ? "#f59e0b"
    : "#6b7280";

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 text-gray-300">
          <Icon size={12} />
          {label}
        </span>
        <span className="text-gray-400">
          {used} / {limitLabel(max)}
        </span>
      </div>
      <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: unlimited ? "100%" : `${pct}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

/* ─── Star rating display ────────────────────────────────── */
function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={14}
          className={s <= Math.round(value) ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}
        />
      ))}
    </div>
  );
}

/* ─── Loading skeleton ───────────────────────────────────── */
function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-800 rounded-lg ${className}`} />
  );
}

/* ════════════════════════════════════════════════════════════
   Main Dashboard
════════════════════════════════════════════════════════════ */
export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [messagesPerMonth, setMessagesPerMonth] = useState<MonthData[]>([]);
  const [convsPerDay, setConvsPerDay] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);

  const token = () => localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  /* Fetch all dashboard data */
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const t = token();
        if (!t) { handleLogout(); return; }

        const [mainRes, msgRes, dayRes] = await Promise.all([
          fetch(`${BACKEND_URL}/dashboard`, {
            headers: { Authorization: `Bearer ${t}`, "Content-type": "application/json" },
          }),
          fetch(`${BACKEND_URL}/dashboard/messages-per-month`, {
            headers: { Authorization: `Bearer ${t}`, "Content-type": "application/json" },
          }),
          fetch(`${BACKEND_URL}/dashboard/conversations-per-day`, {
            headers: { Authorization: `Bearer ${t}`, "Content-type": "application/json" },
          }),
        ]);

        if (mainRes.status === 401 || mainRes.status === 403) { handleLogout(); return; }

        const [mainData, msgData, dayData] = await Promise.all([
          mainRes.json(),
          msgRes.json(),
          dayRes.json(),
        ]);

        setData(mainData);
        setMessagesPerMonth(msgData.messagesPerMonth ?? []);
        setConvsPerDay(dayData.conversationsPerDay ?? []);
      } catch (e) {
        console.error("Dashboard fetch error:", e);
      } finally {
        setLoading(false);
        setChartsLoading(false);
      }
    };
    fetchAll();
  }, []);

  /* Build 12-month bar chart data */
  const monthChartData = useMemo(() => {
    const now = new Date();
    const map = new Map<string, number>();
    messagesPerMonth.forEach(d => map.set(d.month, d.count));
    const result = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      result.push({
        label: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear() !== now.getFullYear() ? d.getFullYear().toString().slice(-2) : ""}`.trim(),
        count: map.get(key) ?? 0,
      });
    }
    return result;
  }, [messagesPerMonth]);

  /* Build 30-day area chart data */
  const dayChartData = useMemo(() => {
    const now = new Date();
    const map = new Map<string, number>();
    convsPerDay.forEach(d => map.set(d.date, d.count));
    const result = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      result.push({
        label: `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`,
        count: map.get(key) ?? 0,
      });
    }
    return result;
  }, [convsPerDay]);

  const totalMonthMessages = monthChartData.reduce((s, d) => s + d.count, 0);

  /* ── Render ── */
  return (
    <div className="max-w-8xl mx-auto bg-white text-black px-6 pb-10 rounded-lg">

      {/* Header */}
      <div className="mt-1 mb-6">
        <p className="text-sm text-gray-500">My Workspace</p>
        <h1 className="text-xl font-bold">Dashboard</h1>
      </div>

      {/* ── Section 1: Engagement ── */}
      <div className="mb-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Engagement
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {loading ? (
            [1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)
          ) : (
            <>
              <StatCard label="Total Conversations" value={data?.totalConversations ?? 0} sub="All time" icon={MessageSquare} />
              <StatCard label="Today" value={data?.conversationsToday ?? 0} sub="New conversations" icon={Activity} accent="#60a5fa" />
              <StatCard label="This Month" value={data?.conversationsThisMonth ?? 0} sub={`of ${data?.limits.maxConversationsPerMonth === -1 ? "∞" : data?.limits.maxConversationsPerMonth} limit`} icon={TrendingUp} accent="#34d399" />
              <StatCard label="Total Messages" value={data?.totalMessages ?? 0} sub={`Avg ${data?.avgMessagesPerConversation ?? 0} / conversation`} icon={MessageSquare} />
            </>
          )}
        </div>
      </div>

      {/* ── Section 2: Quality ── */}
      <div className="mb-2 mt-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Quality &amp; Satisfaction
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {loading ? (
            [1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)
          ) : (
            <>
              {/* Avg Rating */}
              <div className="bg-black rounded-xl p-4 flex flex-col gap-2 shadow-sm border border-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-gray-400 uppercase tracking-wide">Avg Rating</span>
                  <Star size={15} className="text-gray-500" />
                </div>
                <span className="text-2xl font-bold text-white">{data?.avgRating ?? "—"}</span>
                <StarRating value={data?.avgRating ?? 0} />
              </div>

              <StatCard
                label="Satisfaction Rate"
                value={`${data?.satisfactionRate ?? 0}%`}
                sub={`${data?.ratedConversationsCount ?? 0} rated conversations`}
                icon={ThumbsUp}
                accent="#f59e0b"
              />
              <StatCard
                label="Resolution Rate"
                value={`${data?.resolutionRate ?? 0}%`}
                sub={`${data?.finishedConversations ?? 0} resolved`}
                icon={CheckCircle2}
                accent="#34d399"
              />
              <StatCard
                label="Avg Messages / Conv"
                value={data?.avgMessagesPerConversation ?? 0}
                sub="Conversation depth"
                icon={MessageSquare}
              />
            </>
          )}
        </div>
      </div>

      {/* ── Section 3: Bot Performance ── */}
      <div className="mb-2 mt-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Bot Performance
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {loading ? (
            [1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)
          ) : (
            <>
              <StatCard label="Total Domains" value={data?.totalDomains ?? 0} sub="Registered sites" icon={Globe} />
              <StatCard label="Active Domains" value={data?.activeDomainsThisMonth ?? 0} sub="With convos this month" icon={Activity} accent="#60a5fa" />
              <StatCard label="Chat Bots" value={data?.chatBotCount ?? 0} sub="Deployed chatbots" icon={MessageSquare} />
              <StatCard label="Voice Bots" value={data?.voiceBotCount ?? 0} sub="Deployed voice agents" icon={Phone} accent="#a78bfa" />
            </>
          )}
        </div>
      </div>

      {/* ── Section 4: Charts row ── */}
      <div className="mt-6 flex flex-col lg:flex-row gap-4">

        {/* Messages per month bar chart */}
        <div className="w-full lg:w-1/2 rounded-xl border border-gray-700 bg-[#111] p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Messages by Month</h2>
              <p className="text-xs text-gray-500">Last 12 months</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-white">{totalMonthMessages.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
          {chartsLoading ? (
            <div className="flex-1 flex items-center justify-center min-h-[200px]">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-gray-600 border-t-gray-300" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barCategoryGap="20%">
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d1d5db" stopOpacity={1} />
                    <stop offset="100%" stopColor="#9ca3af" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={{ stroke: "#374151" }} tickLine={false} interval={0} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<BarTip />} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={22} fill="url(#barGrad)">
                  {monthChartData.map((_, i) => (
                    <Cell key={i} fill="url(#barGrad)" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Conversations per day area chart */}
        <div className="w-full lg:w-1/2 rounded-xl border border-gray-700 bg-[#111] p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Conversations — Last 30 Days</h2>
              <p className="text-xs text-gray-500">Daily new conversations</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-white">
                {dayChartData.reduce((s, d) => s + d.count, 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
          {chartsLoading ? (
            <div className="flex-1 flex items-center justify-center min-h-[200px]">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-gray-600 border-t-gray-300" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={dayChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#6b7280", fontSize: 10 }}
                  axisLine={{ stroke: "#374151" }}
                  tickLine={false}
                  interval={4}
                />
                <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<LineTip />} cursor={{ stroke: "#4f46e5", strokeWidth: 1 }} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#areaGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#6366f1" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Section 5: Plan Usage + Workflows ── */}
      <div className="mt-4 flex flex-col lg:flex-row gap-4">

        {/* Plan usage panel */}
        <div className="w-full lg:w-1/2 rounded-xl border border-gray-700 bg-[#111] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Plan Usage</h2>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${data?.isPremium ? "bg-indigo-900/50 text-indigo-300 border border-indigo-700" : "bg-gray-800 text-gray-300 border border-gray-600"}`}>
              {loading ? "…" : data?.isPremium ? "Premium" : "Free"}
            </span>
          </div>
          {loading ? (
            <div className="flex flex-col gap-4">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-6" />)}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <UsageBar
                label="Domains"
                used={data?.totalDomains ?? 0}
                max={data?.limits.maxDomains ?? 1}
                icon={Globe}
              />
              <UsageBar
                label="Conversations this month"
                used={data?.conversationsThisMonth ?? 0}
                max={data?.limits.maxConversationsPerMonth ?? 50}
                icon={MessageSquare}
              />
              <UsageBar
                label="KB Files"
                used={data?.kbFilesCount ?? 0}
                max={data?.limits.maxKBFiles ?? 2}
                icon={FileText}
              />
              <UsageBar
                label="Workflows"
                used={data?.workflowCount ?? 0}
                max={data?.limits.maxWorkflows ?? 1}
                icon={Layers}
              />
            </div>
          )}
        </div>

        {/* Workflows & Executions stats */}
        <div className="w-full lg:w-1/2 rounded-xl border border-gray-700 bg-[#111] p-5 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-white">Automation</h2>
          {loading ? (
            <div className="flex flex-col gap-3">
              {[1,2].map(i => <Skeleton key={i} className="h-20" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black rounded-xl p-4 border border-gray-800 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-gray-400 uppercase tracking-wide">Workflows</span>
                  <Layers size={14} className="text-gray-500" />
                </div>
                <span className="text-2xl font-bold text-white">{data?.workflowCount ?? 0}</span>
                <span className="text-[11px] text-gray-500">Created</span>
              </div>
              <div className="bg-black rounded-xl p-4 border border-gray-800 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-gray-400 uppercase tracking-wide">Executions</span>
                  <Zap size={14} className="text-gray-500" />
                </div>
                <span className="text-2xl font-bold text-white">{data?.workflowExecutions ?? 0}</span>
                <span className="text-[11px] text-gray-500">All time runs</span>
              </div>
              <div className="bg-black rounded-xl p-4 border border-gray-800 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-gray-400 uppercase tracking-wide">KB Files</span>
                  <FileText size={14} className="text-gray-500" />
                </div>
                <span className="text-2xl font-bold text-white">{data?.kbFilesCount ?? 0}</span>
                <span className="text-[11px] text-gray-500">Uploaded</span>
              </div>
              <div className="bg-black rounded-xl p-4 border border-gray-800 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-gray-400 uppercase tracking-wide">Active Domains</span>
                  <Activity size={14} className="text-gray-500" />
                </div>
                <span className="text-2xl font-bold text-white">{data?.activeDomainsThisMonth ?? 0}</span>
                <span className="text-[11px] text-gray-500">With traffic this month</span>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
