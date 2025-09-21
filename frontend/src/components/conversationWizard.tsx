"use client";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../lib/utils";
import { XCircle, CheckCircle2, Clock } from "lucide-react";

interface ConversationDetail {
  conversationId: string;
  agentName: string;
  callDurationSecs: number;
  callSuccessful: "success" | "failed";
  callSummaryTitle: string;
  summary: string;
  startTimeUnixSecs: number;
  creditsCall: number;
  creditsLLM: number;
  llmCost: number;
  userId: string;
  audioUrl?: string;
}

export default function ConversationWizard({
  conversationId,
  onClose,
}: {
  conversationId: string;
  onClose: () => void;
}) {
  const [details, setDetails] = useState<ConversationDetail | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await fetch(
          `${BACKEND_URL}/agent/conversation-details/${conversationId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch details");
        const data: ConversationDetail = await response.json();
        setDetails(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDetails();
  }, [conversationId]);

  if (!details) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-8">
          <p className="text-gray-500">Loading conversation...</p>
        </div>
      </div>
    );
  }

  const dateString = new Date(details.startTimeUnixSecs * 1000).toLocaleString();

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-5xl p-8 relative flex gap-6">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-black cursor-pointer"
          onClick={onClose}
        >
          ✕
        </button>

        {/* Left: Conversation */}
        <div className="flex-1 bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-2">
            Conversation with {details.agentName}
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            ID: {details.conversationId}
          </p>

          {/* Summary */}
          <h3 className="font-medium mb-2">Summary</h3>
          <p className="text-gray-700">{details.summary}</p>

          {/* Call status */}
          <div className="mt-6">
            <h3 className="font-medium mb-2">Call Status</h3>
            <div className="flex items-center gap-2">
              {details.callSuccessful === "success" ? (
                <CheckCircle2 className="text-green-600 h-5 w-5" />
              ) : (
                <XCircle className="text-red-600 h-5 w-5" />
              )}
              <span
                className={
                  details.callSuccessful === "success"
                    ? "text-green-600 font-medium"
                    : "text-red-600 font-medium"
                }
              >
                {details.callSuccessful === "success"
                  ? "Successful"
                  : "Failed"}
              </span>
            </div>
          </div>

          {/* User */}
          <div className="mt-6">
            <h3 className="font-medium mb-2">User ID</h3>
            <p className="text-gray-600">{details.userId}</p>
          </div>
        </div>

        {/* Right: Metadata */}
        <div className="w-80 bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold mb-4">Metadata</h3>

          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Date</span>
              <span>{dateString}</span>
            </div>

            <div className="flex justify-between">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-gray-500" /> Connection duration
              </span>
              <span>{details.callDurationSecs}s</span>
            </div>

            <div className="flex justify-between">
              <span>Credits (Call)</span>
              <span>{details.creditsCall}</span>
            </div>

            <div className="flex justify-between">
              <span>Credits (LLM)</span>
              <span>{details.creditsLLM}</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
