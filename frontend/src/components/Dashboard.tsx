"use client";
import { useState } from 'react'
import {BarChart3} from 'lucide-react'
import { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from '../lib/utils';

interface DashboardDetails{
  totalcalls: number,
  totalConversations: number,
  totalDurations: number,
  totalMessages: number,
}

export function Dashboard() {
  const navigate = useNavigate();
  const [details, setDetails] = useState<DashboardDetails>({totalcalls: 0, totalDurations: 0, totalConversations: 0, totalMessages: 0})

  const dashboardDetails = async () => {
    try{
      const response = await fetch(`${BACKEND_URL}/dashboard`, {
        method: "GET",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
      const data = await response.json();
      setDetails({...details, totalConversations: data.totalConversations, totalMessages: data.totalMessages})
      
    } catch(e){
      console.log(e)
    }
  }

  useEffect(() => {
    dashboardDetails()
  }, [])

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
          { label: "Total Messages", value:  `${details.totalMessages}`, unit: "" },
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
      
      {/* Metrice Box */}
      <div className='flex felx-col gap-3 '>
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
          <div className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black shadow cursor-pointer hover:bg-gray-200"
            onClick={() => {
              navigate("/agents", { state: { showWizard: true } });
            }}
          >
            Add Metrics
          </div>
        </div>
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
          <div className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black shadow cursor-pointer hover:bg-gray-200"
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
