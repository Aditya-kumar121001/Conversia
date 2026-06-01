import { useEffect, useState, useRef } from "react";
import { BACKEND_URL } from "../../../lib/utils";

interface BotConfig {
  domain: string;
  name: string;
  logo: string;
  theme: string;
}

export default function ChatbotEmbed() {
  const [config, setConfig] = useState<BotConfig | null>(null);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: "bot", content: "Hello! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  const domain =
    new URLSearchParams(window.location.search).get("domain") || "demo-domain";

  // Fetch bot config from real API
  useEffect(() => {
    async function loadConfig() {
      try {
        const metaRes = await fetch(`${BACKEND_URL}/domain/meta/${domain}`);
        const metaData = await metaRes.json();

        if (metaData.success && metaData.metadata) {
          const meta = metaData.metadata;
          setConfig({
            domain,
            name: meta.domainName || "Conversia AI",
            logo: meta.domainImageUrl || "/vite.svg",
            theme: "#111827",
          });
        } else {
          setConfig({
            domain,
            name: "Conversia AI",
            logo: "/vite.svg",
            theme: "#111827",
          });
        }
      } catch {
        setConfig({
          domain,
          name: "Conversia AI",
          logo: "/vite.svg",
          theme: "#111827",
        });
      }
    }
    loadConfig();
  }, [domain]);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, sending]);

  const handleEmailSubmit = () => {
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return;
    setEmailSubmitted(true);
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;

    const userText = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch(
        `${BACKEND_URL}/conversation/chat/${domain}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, message: userText }),
        }
      );
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: data.message || "Sorry, I couldn't process that.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "Oops! Something went wrong." },
      ]);
    } finally {
      setSending(false);
    }
  };

  if (!config) return <div>Loading chatbot…</div>;

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        background: "#f5f5f5",
        fontFamily: "Inter, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "420px",
          height: "650px",
          borderRadius: "12px",
          background: "#fff",
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "14px 18px",
            background: config.theme,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <img
            src={config.logo}
            alt="logo"
            style={{ width: "34px", height: "34px", borderRadius: "50%" }}
          />
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>
            {config.name}
          </h3>
        </div>

        {/* Messages */}
        <div
          ref={bodyRef}
          style={{
            flex: 1,
            padding: "16px",
            overflowY: "auto",
            background: "#f9fafb",
          }}
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                marginBottom: "12px",
                display: "flex",
                justifyContent:
                  msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "12px",
                  maxWidth: "75%",
                  background:
                    msg.role === "user" ? config.theme : "#e5e7eb",
                  color: msg.role === "user" ? "#fff" : "#111",
                  fontSize: "14px",
                  lineHeight: "1.4",
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {sending && (
            <div
              style={{
                marginBottom: "12px",
                display: "flex",
                justifyContent: "flex-start",
              }}
            >
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "12px",
                  background: "#e5e7eb",
                  color: "#6b7280",
                  fontSize: "14px",
                }}
              >
                Thinking…
              </div>
            </div>
          )}
        </div>

        {/* Email prompt or Input Area */}
        {!emailSubmitted ? (
          <div
            style={{
              padding: "12px",
              borderTop: "1px solid #e5e7eb",
              background: "#fff",
            }}
          >
            <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 8px" }}>
              Enter your email to start chatting
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()}
                placeholder="you@example.com"
                type="email"
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  outline: "none",
                }}
              />
              <button
                onClick={handleEmailSubmit}
                style={{
                  padding: "10px 16px",
                  borderRadius: "8px",
                  background: config.theme,
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Start
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: "12px",
              display: "flex",
              gap: "8px",
              borderTop: "1px solid #e5e7eb",
              background: "#fff",
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              disabled={sending}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                outline: "none",
                opacity: sending ? 0.5 : 1,
              }}
            />
            <button
              onClick={sendMessage}
              disabled={sending}
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                background: config.theme,
                color: "#fff",
                border: "none",
                cursor: sending ? "not-allowed" : "pointer",
                opacity: sending ? 0.5 : 1,
              }}
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
