"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: "bot",
      text: "👋 Hi there! I'm Conversia — how can I help you today?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  // Extract domain from URL query params
  const params = new URLSearchParams(location.search);
  const domainName = params.get("domain") || "customer";

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Listen for messages from parent window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // In production, verify event.origin matches your domain
      // For now, accept any message
      if (event.data && typeof event.data === "string") {
        // Handle domain name or other data from parent
        console.log("Received from parent:", event.data);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      from: "user" as const,
      text: inputValue,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Simulate bot response (replace with actual API call)
    setTimeout(() => {
      const botMessage = {
        id: messages.length + 2,
        from: "bot" as const,
        text: "Thanks for your message! This is a placeholder response. Connect this to your AI agent.",
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between bg-black text-white px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 bg-green-400 rounded-full" />
          <div>
            <div className="text-sm font-semibold">Conversia Assistant</div>
            <div className="text-xs text-gray-300">online</div>
          </div>
        </div>
        <button
          onClick={() => {
            // Send message to parent to close iframe
            // Use window.parent to ensure we're in an iframe context
            if (window.parent && window.parent !== window) {
              // Send message with our origin - parent will verify
              const message = "close-chatbot";
              const targetOrigin = window.location.origin;
              console.log("Sending close message to parent, origin:", targetOrigin);
              window.parent.postMessage(message, "*");
              // Also try sending with specific origin as fallback
              window.parent.postMessage(message, targetOrigin);
            } else {
              // If not in iframe, just close/hide the page (for testing)
              console.log("Not in iframe context");
            }
          }}
          className="text-gray-400 hover:text-white transition cursor-pointer"
          aria-label="Close chatbot"
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4">
        {messages.map((m) =>
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
      <div className="border-t bg-white px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Type a message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 text-sm px-3 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-1 focus:ring-black"
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-black text-white rounded-full text-sm hover:bg-gray-800 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

