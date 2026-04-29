"use client";
import { useState, useEffect, useMemo } from 'react'
import { BarChart3 } from 'lucide-react'
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from '../lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface DashboardDetails {
  totalcalls: number,
  totalConversations: number,
  totalDurations: number,
  totalMessages: number,
}

interface MessageMonthData {
  month: string;
  count: number;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Custom tooltip for the chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-gray-700 bg-[#1a1a2e] px-2 py-1 shadow-xl">
        <p className="text-xs text-gray-400 mb-1">{label}</p>
        <p className="text-lg font-bold text-white">
          {payload[0].value}{' '}
          <span className="text-sm font-normal text-gray-400">messages</span>
        </p>
      </div>
    );
  }
  return null;
};

export function Dashboard() {
  const navigate = useNavigate();
  const [details, setDetails] = useState<DashboardDetails>({
    totalcalls: 0,
    totalDurations: 0,
    totalConversations: 0,
    totalMessages: 0,
  });
  const [messagesPerMonth, setMessagesPerMonth] = useState<MessageMonthData[]>([]);
  const [chartLoading, setChartLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  const dashboardDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        handleLogout();
        return;
      }

      const response = await fetch(`${BACKEND_URL}/dashboard`, {
        method: "GET",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        handleLogout();
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard details");
      }

      const data = await response.json();
      setDetails((prev) => ({
        ...prev,
        totalConversations: Number(data.totalConversations ?? 0),
        totalMessages: Number(data.totalMessages ?? 0),
      }));
    } catch (e) {
      console.log(e);
    }
  };

  const fetchMessagesPerMonth = async () => {
    try {
      setChartLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${BACKEND_URL}/dashboard/messages-per-month`, {
        method: "GET",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch messages per month");

      const data = await response.json();
      setMessagesPerMonth(data.messagesPerMonth ?? []);
    } catch (e) {
      console.log(e);
    } finally {
      setChartLoading(false);
    }
  };

  useEffect(() => {
    dashboardDetails();
    fetchMessagesPerMonth();
  }, []);

  // Build last 12 months chart data (fills missing months with 0)
  const chartData = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Map fetched data by month string (YYYY-MM)
    const dataMap = new Map<string, number>();
    messagesPerMonth.forEach((d) => dataMap.set(d.month, d.count));

    const result = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear() !== currentYear ? d.getFullYear().toString().slice(-2) : ''}`;
      result.push({
        month: monthStr,
        count: dataMap.get(monthStr) || 0,
        label: label.trim(),
        isFuture: false,
      });
    }
    return result;
  }, [messagesPerMonth]);

  const currentYearLabel = new Date().getFullYear();

  const totalAllMonths = chartData.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="max-w-8xl mx-auto bg-white text-black px-8 rounded-lg">

      {/* Greeting */}
      <div className="mt-1">
        <p className="text-sm text-gray-800">My Workspace</p>
        <h1 className="text-xl font-bold">Good afternoon, Aditya</h1>
      </div>

      {/* Stats Row */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Number of calls", value: "25", unit: "" },
          { label: "Number of Converstaions", value: `${details.totalConversations}`, unit: "" },
          { label: "Total duration", value: "08:15", unit: "Min" },
          { label: "Total Messages", value: `${details.totalMessages}`, unit: "" },
          { label: "Total cost", value: "2.88K", unit: "credits" },
          { label: "Average Message Cost", value: "$1.05", unit: "/100 Message" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-black p-4 rounded-lg shadow flex flex-col"
          >
            <span className="text-xs text-gray-200 text-bold">
              {stat.label}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl text-gray-400 font-semibold">
                {stat.value}
              </span>
              {stat.unit && (
                <span className="text-sm font-medium text-gray-200">
                  {stat.unit}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Metrics Box */}
      <div className='flex flex-col lg:flex-row gap-4'>

        {/* Messages Per Month Chart */}
        <div className="mt-6 w-full lg:w-2/3 rounded-xl border border-gray-700 bg-[#111] p-6 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-base font-semibold text-white">Messages By Month</h2>
                <p className="text-xs text-gray-500">Last 12 months — {currentYearLabel}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{totalAllMonths}</p>
              <p className="text-xs text-gray-500">Total Messages</p>
            </div>
          </div>

          {/* Chart */}
          {chartLoading ? (
            <div className="flex-1 flex items-center justify-center min-h-[240px]">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-600 border-t-violet-500"></div>
                <p className="text-sm text-gray-500">Loading chart…</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 min-h-[240px]">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={chartData}
                  margin={{ top: 8, right: 4, left: -20, bottom: 0 }}
                  barCategoryGap="20%"
                >
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#d1d5db" stopOpacity={1} />
                      <stop offset="100%" stopColor="#9ca3af" stopOpacity={0.8} />
                    </linearGradient>
                    <linearGradient id="barGradientFuture" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#374151" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#1f2937" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#1f2937"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    axisLine={{ stroke: '#374151' }}
                    tickLine={false}
                    interval={0}
                  />
                  <YAxis
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  />
                  <Bar
                    dataKey="count"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={24}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isFuture ? 'url(#barGradientFuture)' : 'url(#barGradient)'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Placeholder metrics box */}
        <div className="mt-6 w-full lg:w-1/3 rounded-xl border border-gray-700 bg-[#111] p-12 flex flex-col items-center justify-center text-center">
          {/* Icon */}
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-black">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>

          {/* Title */}
          <h2 className="text-lg font-semibold text-white mb-1">No metrics</h2>

          {/* Subtitle */}
          <p className="text-gray-400 mb-6">
            Once you create an agent, you will be able to track metrics here.
          </p>

          {/* Button-like code */}
          <div
            className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black shadow cursor-pointer hover:bg-gray-200"
            onClick={() => {
              navigate("/agents", { state: { showWizard: true } });
            }}
          >
            Add Metrics
          </div>
        </div>

      </div>
    </div>
  );
}
