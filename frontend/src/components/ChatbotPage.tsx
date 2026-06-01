"use client";

import { useState, useEffect, useRef } from "react";
import { X, Loader2 } from "lucide-react";
import { useLocation } from "react-router-dom";
import { BACKEND_URL } from "../lib/utils";

export default function ChatbotPage() {
  const [messages, setMessages] = useState<
    { id: number; from: "bot" | "user"; text: string }[]
  >([
    {
      id: 1,
      from: "bot",
      text: "👋 Hi there! I'm Conversia — how can I help you today?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [email, setEmail] = useState(() => {
    try { return localStorage.getItem("cw_email") || ""; } catch { return ""; }
  });
  const [emailPromptVisible, setEmailPromptVisible] = useState(!email);
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();

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
      if (event.data && typeof event.data === "string") {
        console.log("Received from parent:", event.data);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleEmailSubmit = () => {
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return;
    try { localStorage.setItem("cw_email", trimmed); } catch { /* ignore */ }
    setEmail(trimmed);
    setEmailPromptVisible(false);
  };

  const handleSend = async () => {
    if (!inputValue.trim() || sending) return;

    const userText = inputValue.trim();
    setInputValue("");

    const userMessage = {
      id: messages.length + 1,
      from: "user" as const,
      text: userText,
    };
    setMessages((prev) => [...prev, userMessage]);
    setSending(true);

    try {
      const res = await fetch(
        `${BACKEND_URL}/conversation/chat/${domainName}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, message: userText }),
        }
      );

      const data = await res.json();

      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      const botMessage = {
        id: messages.length + 2,
        from: "bot" as const,
        text: data.message || "Sorry, I couldn't process that. Please try again.",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: messages.length + 2,
          from: "bot" as const,
          text: "Oops! Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (emailPromptVisible) handleEmailSubmit();
      else handleSend();
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
            if (window.parent && window.parent !== window) {
              window.parent.postMessage("close-chatbot", window.location.origin);
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
        {sending && (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 h-9 w-9 rounded-full bg-black text-white flex items-center justify-center font-semibold text-sm">
              C
            </div>
            <div className="bg-white px-4 py-3 rounded-2xl text-sm text-gray-400 shadow-sm flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              Thinking…
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Email prompt */}
      {emailPromptVisible && (
        <div className="border-t bg-white px-4 py-3 flex-shrink-0">
          <p className="text-xs text-gray-500 mb-2">Enter your email to start chatting</p>
          <div className="flex items-center gap-3">
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1 text-sm px-3 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-1 focus:ring-black"
            />
            <button
              onClick={handleEmailSubmit}
              className="px-4 py-2 bg-black text-white rounded-full text-sm hover:bg-gray-800 transition"
            >
              Start
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      {!emailPromptVisible && (
        <div className="border-t bg-white px-4 py-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Type a message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={sending}
              className="flex-1 text-sm px-3 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-1 focus:ring-black disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={sending}
              className="px-4 py-2 bg-black text-white rounded-full text-sm hover:bg-gray-800 transition disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
