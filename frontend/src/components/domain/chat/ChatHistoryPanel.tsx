"use client";
import { useState, useEffect } from "react";
import type { Conversation, Message } from "../../../types";

export default function ChatHistoryPanel({
  conversation,
  onClose,
  domain,
}: {
  conversation: Conversation;
  onClose: () => void;
  domain: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  useEffect(() => {
    if (Array.isArray(conversation.messages)) {
      setMessages(conversation.messages as unknown as Message[]);
    } else {
      setMessages([]);
    }
  }, [conversation.messages]);

  if (!conversation) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-8">
          <p className="text-gray-500">Loading Conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
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
            Conversation with {domain}
          </h2>
          <p className="text-gray-500 text-xs mb-4">
            ConvID: {conversation._id}
          </p>

          

          <h3 className="text-lg font-semibold mt-4">Conversation</h3>
          {/* Conversation agent - user */}
          <div className="flex flex-col bg-slate-50 overflow-y-auto mt-2 py-2 min-h-[15rem] max-h-[24rem]">
            <div className="flex flex-col gap-4 text-sm">
              {messages && messages.length > 0 ? (
                messages.map((msg: Message, idx: number) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.role === "bot" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-sm px-4 py-2 rounded-lg shadow-sm ${
                        msg.role === "bot"
                          ? "bg-black text-white rounded-br-none"
                          : "bg-gray-200 text-gray-900 rounded-bl-none"
                      }`}
                    >
                      <div className="text-xs mb-1 font-medium opacity-70">
                        {msg.role === "bot" ? `${domain} bot` : "User"}
                      </div>
                      <div className="whitespace-pre-line">{msg.content}</div>
                      {msg.createdAt && (
                        <div className="text-[10px] text-gray-400 mt-1 text-right">
                          {new Date(msg.createdAt).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "short",
                              day: "2-digit",
                            }
                          )}
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
        <div className="">
          <div className="w-80 bg-white rounded-xl shadow p-5">
            <h3 className="font-semibold mb-4">Metadata</h3>
            <div className="space-y-3 text-sm text-gray-600">
              {/* User */}
              <div className="flex justify-between">
                <h3 className="font-medium">User ID</h3>
                <p className="text-gray-800">{conversation.email}</p>
              </div>

              <div className="flex justify-between">
                <span>Intent</span>
                <span>
                  {conversation.rating > 3 ? (
                    <span className="px-2 py-1 rounded bg-green-100 text-green-800 font-semibold text-xs inline-block">
                      Positive
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded bg-red-100 text-red-800 font-semibold text-xs inline-block">
                      Negative
                    </span>
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Message Count </span>
                <span>{messages.length}</span>
              </div>

              <div className="flex justify-between">
                <span>Token Count</span>
                <span>100</span>
              </div>

              <div className="flex justify-between">
                <span>Last Message At</span>
                <span>
                  {messages && messages.length > 0
                    ? new Date(
                        messages[messages.length - 1].createdAt
                      ).toLocaleString()
                    : "N/A"}
                </span>
              </div>

              {/* Call status */}
              {/* <div className="flex items-center justify-between">
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
                    </div> */}

              {/* <div className="flex justify-between">
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
                    </div> */}
            </div>
          </div>
          {/* Summary */}
          <div className="w-80 bg-white rounded-xl shadow px-5 py-2 mt-4">
            <h3 className="font-medium mb-2">
                Summary
            </h3>
            <p className="text-sm">{"User asked for refund"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
