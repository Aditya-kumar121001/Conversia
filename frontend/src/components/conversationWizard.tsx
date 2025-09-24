/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../lib/utils";

interface ConversationDetail {
  userId: string;
  conversationId: string;
  agentName: string;
  callDurationSecs: number;
  analysis: {
    callSuccessful: "success" | "failed";
    callSummaryTitle: string;
    transcriptSummary: string;
  };
  metadata: {
    callDurationSecs: number;
    acceptedTimeUnixSecs: number;
    charging: {
      callCharge: number;
      llmPrice: number;
    };
  };
  transcript: []
}

export default function ConversationWizard({
  conversationId,
  onClose,
  agentName,
}: {
  conversationId: string;
  onClose: () => void;
  agentName: string;
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
        const json = await response.json();
        console.log(json.data);
        setDetails(json.data);
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

  const dateString = new Date(
    details.metadata.acceptedTimeUnixSecs * 1000
  ).toLocaleString();

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
            Conversation with <span className="underline">{agentName}</span>
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            ID: {details.conversationId}
          </p>

          {/* Summary */}
          <h3 className="font-medium mb-2">
            Summary:{" "}
            <span className="text-md text-gray-600">
              {details.analysis.callSummaryTitle}
            </span>
          </h3>
          <p className="text-gray-700">{details.analysis.transcriptSummary}</p>
          <h3 className="text-lg font-semibold mt-4">Conversation</h3>

          {/* Conversation agent - user */}
          <div className="flex flex-col bg-slate-50 overflow-y-auto mt-4 py-4 min-h-60 max-h-96" style={{ minHeight: "15rem", maxHeight: "24rem" }}>
            <div className="flex flex-col gap-3 text-sm">
              {details.transcript && details.transcript.length > 0 ? (
                details.transcript.map((msg: any, idx: number) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.role === "agent" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-sm px-4 py-2 rounded-lg shadow-sm ${
                        msg.role === "agent"
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-gray-200 text-gray-900 rounded-bl-none"
                      }`}
                    >
                      <div className="text-xs mb-1 font-medium opacity-70">
                        {msg.role === "agent" ? agentName : "User"}
                      </div>
                      <div className="whitespace-pre-line">{msg.message}</div>
                      {msg.timestamp && (
                        <div className="text-[10px] text-gray-400 mt-1 text-right">
                          {new Date(msg.timestamp * 1000).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-center py-8">
                  No messages available for this conversation.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Metadata */}
        <div className="w-80 bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold mb-4">Metadata</h3>

          <div className="space-y-3 text-sm text-gray-600">
            {/* User */}
            <div className="flex justify-between">
              <h3 className="font-medium">User ID</h3>
              <p className="text-gray-800">{details.userId}</p>
            </div>

            <div className="flex justify-between">
              <span>Date</span>
              <span>{dateString}</span>
            </div>

            {/* Call status */}
            <div className="flex items-center justify-between">
              <h3>Call Status</h3>

              <span
                className={
                  details.analysis.callSuccessful === "success"
                    ? "text-green-600 font-medium"
                    : "text-red-600 font-medium"
                }
              >
                {details.analysis.callSuccessful === "success"
                  ? "Successful"
                  : "Failed"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="flex items-center gap-1">
                Connection duration
              </span>
              <span>{details.metadata.callDurationSecs}s</span>
            </div>

            <div className="flex justify-between">
              <span>Credits (Call)</span>
              <span>{details.metadata.charging.callCharge}</span>
            </div>

            <div className="flex justify-between">
              <span>Credits (LLM)</span>
              <span>{details.metadata.charging.llmPrice}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
