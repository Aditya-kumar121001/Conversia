"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X } from "lucide-react";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const sampleMessages = [
    { id: 1, from: "bot", text: "👋 Hi there! I’m Conversia — how can I help you today?" },
    { id: 2, from: "user", text: "Tell me more about your pricing plans." },
    { id: 3, from: "bot", text: "We offer flexible pricing for both free and premium users. Would you like a detailed breakdown?" },
  ];

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [open]);

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-black text-white shadow-lg hover:bg-gray-800 transition-all duration-300 ${
          open ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <MessageCircle size={26} />
      </button>

      {/* Chatbot Popup */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] sm:w-[400px] rounded-2xl shadow-2xl overflow-hidden border border-gray-200 bg-white flex flex-col animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between bg-black text-white px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 bg-green-400 rounded-full" />
              <div>
                <div className="text-sm font-semibold">Conversia Assistant</div>
                <div className="text-xs text-gray-300">online</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-white transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-5 overflow-y-auto bg-gray-50 flex flex-col gap-4">
            {sampleMessages.map((m) =>
              m.from === "bot" ? (
                <div key={m.id} className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-9 w-9 rounded-full bg-black text-white flex items-center justify-center font-semibold text-sm">
                    C
                  </div>
                  <div className="bg-white px-4 py-3 rounded-2xl text-sm text-gray-800 shadow-sm max-w-[78%]">
                    {m.text}
                  </div>
                </div>
              ) : (
                <div key={m.id} className="flex items-start justify-end">
                  <div className="bg-gray-900 text-white px-4 py-3 rounded-2xl text-sm shadow-sm max-w-[78%]">
                    {m.text}
                  </div>
                </div>
              )
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t bg-white px-4 py-3">
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 text-sm px-3 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-1 focus:ring-black"
              />
              <button className="px-4 py-2 bg-black text-white rounded-full text-sm hover:bg-gray-800 transition">
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Optional fade-in animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out forwards;
        }
      `}</style>
    </>
  );
}
