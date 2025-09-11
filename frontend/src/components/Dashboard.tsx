"use client";
import {BarChart3} from 'lucide-react'
export function Dashboard() {
  return (
    <div className="bg-white text-black px-2 py-1 rounded-lg">
      {/* Top Row */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm bg-gray-200 p-2 rounded-sm">
          <span className="h-2 w-2 rounded-full bg-green-500"></span>
          <span>Active calls: 0</span>
        </div>
      </div>

      {/* Greeting */}
      <div className="mt-6">
        <p className="text-sm text-gray-800">My Workspace</p>
        <h1 className="text-xl font-bold">Good afternoon, Aditya</h1>
      </div>

      {/* Stats Row */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Number of calls", value: "0", unit: "" },
          { label: "Average duration", value: "0:00", unit: "" },
          { label: "Total cost", value: "0", unit: "credits" },
          { label: "Average cost", value: "0", unit: "credits/call" },
          { label: "Total LLM cost", value: "$0.00", unit: "" },
          { label: "Average LLM cost", value: "$0.00", unit: "/min" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-black p-4 rounded-lg shadow flex flex-col"
          >
            <span className="text-xs text-gray-200 text-bold">
              {stat.label}
            </span>
            <div className="flex items-end gap-1 mt-1">
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
      
      {/* Metrice Box */}
      <div className="mt-6 w-full rounded-xl border border-gray-700 bg-[#111] p-12 flex flex-col items-center justify-center text-center">
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
        <div className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black shadow cursor-pointer">
          Create Agent
        </div>
      </div>
    </div>
  );
}
