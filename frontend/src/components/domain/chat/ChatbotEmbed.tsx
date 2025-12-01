import { useEffect, useState } from "react";

export default function ChatbotEmbed() {
  const [config, setConfig] = useState(null);
  const [messages, setMessages] = useState([
    { role: "bot", content: "Hello! How can I help you today?" }
  ]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const domain = params.get("domain") || "demo-domain"; 

    const mockedConfig = {
      domain,
      name: "Conversia AI",
      logo: "/vite.svg",
      theme: "#111827",
      apiEndpoint: "https://mock-api.conversia.ai/chat",
    };

    setConfig(mockedConfig);
  }, []);

  // ---------------------------
  // SEND MESSAGE (Mocked Response)
  // ---------------------------
  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);

    setInput("");

    // STATIC BOT RESPONSE (Mock)
    setTimeout(() => {
      const botReply = {
        role: "bot",
        content: "🤖 This is a static mock reply! Backend not connected yet.",
      };
      setMessages((prev) => [...prev, botReply]);
    }, 600);
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
        padding: "20px"
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
          overflow: "hidden"
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
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
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
        </div>

        {/* Input Area */}
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
            placeholder="Type a message..."
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              outline: "none",
            }}
          />
          <button
            onClick={sendMessage}
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              background: config.theme,
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
