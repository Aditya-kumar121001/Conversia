import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Copy, MessageCircle, UserPen, Settings } from "lucide-react";
import ChatSettings from "./settings/ChatSettings";

const sampleMessages = [
  {
    id: 1,
    from: "bot",
    text: "👋 Hi there! I'm Conversia — how can I help you today?",
  },
  { id: 2, from: "user", text: "Tell me more about your pricing plans." },
  {
    id: 3,
    from: "bot",
    text: "We offer flexible pricing for both free and premium users. Would you like a detailed breakdown?",
  },
  {
    id: 4,
    from: "user",
    text: "Yes, please! What's included in the free plan?",
  },
  {
    id: 5,
    from: "bot",
    text: "The free plan includes unlimited chats, basic customization, and core conversational AI features.",
  },
  { id: 6, from: "user", text: "And what do I get if I upgrade to Premium?" },
  {
    id: 7,
    from: "bot",
    text: "Premium subscribers get advanced AI models, custom branding, more integrations, and prioritized support.",
  },
];

export default function Domain() {
  const location = useLocation();
  const domainName = location.state?.domainName || "example.com";
  const [btnState, setBtnState] = useState("");
  const [mode, setMode] = useState<"chat" | "voice">("chat");
  const [apiKey, setApiKey] = useState("");
  const [webhook, setWebhook] = useState("");
  const [language, setLanguage] = useState("en");

  // Get the current application URL (or use environment variable)
  const appUrl = "http://localhost:5173";
  // Normalize URL for origin comparison (remove trailing slash and path)
  const appOrigin = new URL(appUrl).origin;

  const chatSnippet = `(function() {
  // Create iframe
  const iframe = document.createElement("iframe");
  iframe.src = "${appUrl}/chatbot?domain=${encodeURIComponent(domainName)}";
  iframe.className = "conversia-chat-iframe";
  iframe.style.position = "fixed";
  iframe.style.bottom = "40px";
  iframe.style.right = "40px";
  iframe.style.width = "420px";
  iframe.style.height = "600px";
  iframe.style.border = "none";
  iframe.style.borderRadius = "12px";
  iframe.style.boxShadow = "0 4px 20px rgba(0,0,0,0.15)";
  iframe.style.zIndex = "999999";
  iframe.style.transition = "opacity 0.3s ease, transform 0.3s ease";
  document.body.appendChild(iframe);

  // Create floating toggle button
  const toggleButton = document.createElement("button");
  toggleButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
  toggleButton.style.position = "fixed";
  toggleButton.style.bottom = "20px";
  toggleButton.style.right = "20px";
  toggleButton.style.width = "56px";
  toggleButton.style.height = "56px";
  toggleButton.style.borderRadius = "50%";
  toggleButton.style.backgroundColor = "#000000";
  toggleButton.style.color = "#ffffff";
  toggleButton.style.border = "none";
  toggleButton.style.cursor = "pointer";
  toggleButton.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
  toggleButton.style.zIndex = "999998";
  toggleButton.style.transition = "all 0.3s ease";
  toggleButton.style.alignItems = "center";
  toggleButton.style.justifyContent = "center";
  toggleButton.style.display = "none"; // Hidden initially when chatbot is visible
  toggleButton.setAttribute("aria-label", "Open chatbot");
  // Add hover effect
  toggleButton.addEventListener("mouseenter", function() {
    this.style.transform = "scale(1.1)";
    this.style.backgroundColor = "#333333";
  });
  toggleButton.addEventListener("mouseleave", function() {
    this.style.transform = "scale(1)";
    this.style.backgroundColor = "#000000";
  });
  document.body.appendChild(toggleButton);

  // Toggle function
  function toggleChatbot() {
    if (iframe.style.display === "none" || iframe.style.display === "") {
      // Show chatbot
      iframe.style.display = "block";
      iframe.style.opacity = "0";
      iframe.style.transform = "translateY(20px) scale(0.95)";
      setTimeout(() => {
        iframe.style.opacity = "1";
        iframe.style.transform = "translateY(0) scale(1)";
      }, 10);
      toggleButton.style.display = "none";
    } else {
      // Hide chatbot
      iframe.style.opacity = "0";
      iframe.style.transform = "translateY(20px) scale(0.95)";
      setTimeout(() => {
        iframe.style.display = "none";
        toggleButton.style.display = "flex";
      }, 300);
    }
  }
  
  // Initially hide the toggle button since chatbot is visible
  toggleButton.style.display = "none";

  // Toggle button click handler
  toggleButton.addEventListener("click", toggleChatbot);

  // Handle close message from iframe
  const handleMessage = (e) => {
    // Only accept messages from your chatbot domain
    const expectedOrigin = "${appOrigin}";
    
    // Handle close message - check origin for security
    if (e.data === "close-chatbot") {
      // Verify origin matches (for security) or allow in development
      if (e.origin === expectedOrigin || e.origin === window.location.origin) {
        // Hide chatbot and show toggle button
        iframe.style.opacity = "0";
        iframe.style.transform = "translateY(20px)";
        setTimeout(() => {
          iframe.style.display = "none";
          toggleButton.style.display = "flex";
        }, 300);
      } else {
        console.warn("Close message origin mismatch:", e.origin);
        // Still allow close for development
        iframe.style.opacity = "0";
        iframe.style.transform = "translateY(20px)";
        setTimeout(() => {
          iframe.style.display = "none";
          toggleButton.style.display = "flex";
        }, 300);
      }
    }
  };
  
  window.addEventListener("message", handleMessage);
})();`;

  const voiceSnippet = `(function() {
  // Create iframe for voice bot
  const iframe = document.createElement("iframe");
  iframe.src = "${appUrl}/voice-bot?domain=${encodeURIComponent(domainName)}";
  iframe.className = "conversia-voice-iframe";
  iframe.style.position = "fixed";
  iframe.style.bottom = "40px";
  iframe.style.right = "40px";
  // Compact widget like a small card
  iframe.style.width = "320px";
  iframe.style.height = "150px";
  iframe.style.border = "none";
  iframe.style.borderRadius = "12px";
  iframe.style.boxShadow = "0 4px 20px rgba(0,0,0,0.15)";
  iframe.style.zIndex = "999999";
  iframe.style.transition = "opacity 0.3s ease, transform 0.3s ease";
  document.body.appendChild(iframe);

  // Create floating toggle button
  const toggleButton = document.createElement("button");
  toggleButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>';
  toggleButton.style.position = "fixed";
  toggleButton.style.bottom = "20px";
  toggleButton.style.right = "20px";
  toggleButton.style.width = "56px";
  toggleButton.style.height = "56px";
  toggleButton.style.borderRadius = "50%";
  toggleButton.style.backgroundColor = "#000000";
  toggleButton.style.color = "#ffffff";
  toggleButton.style.border = "none";
  toggleButton.style.cursor = "pointer";
  toggleButton.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
  toggleButton.style.zIndex = "999998";
  toggleButton.style.transition = "all 0.3s ease";
  toggleButton.style.alignItems = "center";
  toggleButton.style.justifyContent = "center";
  toggleButton.style.display = "none";
  toggleButton.setAttribute("aria-label", "Open voice bot");
  // Add hover effect
  toggleButton.addEventListener("mouseenter", function() {
    this.style.transform = "scale(1.1)";
    this.style.backgroundColor = "#333333";
  });
  toggleButton.addEventListener("mouseleave", function() {
    this.style.transform = "scale(1)";
    this.style.backgroundColor = "#000000";
  });
  document.body.appendChild(toggleButton);

  // Toggle function
  function toggleVoiceBot() {
    if (iframe.style.display === "none" || iframe.style.display === "") {
      // Show voice bot
      iframe.style.display = "block";
      iframe.style.opacity = "0";
      iframe.style.transform = "translateY(20px) scale(0.95)";
      setTimeout(() => {
        iframe.style.opacity = "1";
        iframe.style.transform = "translateY(0) scale(1)";
      }, 10);
      toggleButton.style.display = "none";
    } else {
      // Hide voice bot
      iframe.style.opacity = "0";
      iframe.style.transform = "translateY(20px) scale(0.95)";
      setTimeout(() => {
        iframe.style.display = "none";
        toggleButton.style.display = "flex";
      }, 300);
    }
  }
  
  // Initially hide the toggle button since voice bot is visible
  toggleButton.style.display = "none";

  // Toggle button click handler
  toggleButton.addEventListener("click", toggleVoiceBot);

  // Handle close message from iframe
  const handleMessage = (e) => {
    const expectedOrigin = "${appOrigin}";
    
    // Handle close message
    if (e.data === "close-voicebot") {
      if (e.origin === expectedOrigin || e.origin === window.location.origin) {
        // Hide voice bot and show toggle button
        iframe.style.opacity = "0";
        iframe.style.transform = "translateY(20px)";
        setTimeout(() => {
          iframe.style.display = "none";
          toggleButton.style.display = "flex";
        }, 300);
      } else {
        console.warn("Close message origin mismatch:", e.origin);
        // Still allow close for development
        iframe.style.opacity = "0";
        iframe.style.transform = "translateY(20px)";
        setTimeout(() => {
          iframe.style.display = "none";
          toggleButton.style.display = "flex";
        }, 300);
      }
    }
  };
  
  window.addEventListener("message", handleMessage);
})();`;

  const snippet = mode === "chat" ? chatSnippet : voiceSnippet;

  return (
    <div
      className="min-h-screen p-8"
      style={{ minHeight: "calc(100vh - 75px)" }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-3xl font-semibold">{domainName}</p>
            <p className="text-gray-500 mt-1">
              Configure settings for your domain and manage associated chatbot
              and voice agent here
            </p>
          </div>

          {/* Mode toggle */}
          <div className="flex items-center space-x-3">
            <div className="text-sm font-medium text-gray-700">Bot Type:</div>
            <div className="inline-flex rounded-lg bg-gray-100 p-1 border border-gray-200">
              <button
                onClick={() => setMode("chat")}
                className={`px-5 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  mode === "chat"
                    ? "bg-white text-black shadow-sm border border-gray-200"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  Chat Bot
                </span>
              </button>
              <button
                onClick={() => setMode("voice")}
                className={`px-5 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  mode === "voice"
                    ? "bg-white text-black shadow-sm border border-gray-200"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" y1="19" x2="12" y2="23"></line>
                    <line x1="8" y1="23" x2="16" y2="23"></line>
                  </svg>
                  Voice Bot
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Middle: Snippet & copy */}
        <div className="bg-white rounded-md p-6 shadow space-y-6">
          {/* Header + Copy */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-lg font-semibold mb-1">Code Snippet</p>
              <p className="text-sm text-gray-500">
                Paste this into your website to embed the {mode} widget
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(snippet);
                  setBtnState("copied");
                  setTimeout(() => setBtnState("idle"), 1000);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition
                  ${
                    btnState === "copied"
                      ? "bg-gray-800 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                disabled={btnState === "copied"}
              >
                {btnState === "copied" ? (
                  <>Copied</>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy snippet
                  </>
                )}
              </button>
            </div>
          </div>
          {/* Code Block */}
          <div className="relative bg-gray-50 rounded-lg border border-gray-200 p-4">
            <pre className="whitespace-pre-wrap break-words text-sm text-gray-700">
              <code>{snippet}</code>
            </pre>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <p className="text-sm font-semibold text-blue-900 mb-2">
              📋 Where to add this code on your website:
            </p>
            <div className="text-sm text-blue-800 space-y-2">
              <p>
                <strong>Option 1 (Recommended):</strong> Before the closing{" "}
                <code className="bg-blue-100 px-1 rounded">&lt;/body&gt;</code>{" "}
                tag
              </p>
              <p className="text-xs text-blue-700 ml-4">
                Place the code snippet right before{" "}
                <code className="bg-blue-100 px-1 rounded">&lt;/body&gt;</code>{" "}
                in your HTML file, wrapped in{" "}
                <code className="bg-blue-100 px-1 rounded">&lt;script&gt;</code>{" "}
                tags:
              </p>
              <pre className="bg-blue-100 p-2 rounded text-xs mt-2 overflow-x-auto whitespace-pre-wrap">
                {`<script>
  // Paste the code snippet above here
</script>
</body>`}
              </pre>

              <p className="mt-3">
                <strong>Option 2:</strong> In the{" "}
                <code className="bg-blue-100 px-1 rounded">&lt;head&gt;</code>{" "}
                section
              </p>
              <p className="text-xs text-blue-700 ml-4">
                Wrap the snippet in{" "}
                <code className="bg-blue-100 px-1 rounded">&lt;script&gt;</code>{" "}
                tags within your{" "}
                <code className="bg-blue-100 px-1 rounded">&lt;head&gt;</code>{" "}
                section.
              </p>

              <p className="mt-3">
                <strong>For CMS platforms:</strong>
              </p>
              <ul className="text-xs text-blue-700 ml-4 list-disc space-y-1">
                <li>
                  <strong>WordPress:</strong> Add to{" "}
                  <code className="bg-blue-100 px-1 rounded">footer.php</code>{" "}
                  or use a plugin like "Insert Headers and Footers"
                </li>
                <li>
                  <strong>Shopify:</strong> Add to{" "}
                  <code className="bg-blue-100 px-1 rounded">theme.liquid</code>{" "}
                  in the{" "}
                  <code className="bg-blue-100 px-1 rounded">
                    &lt;/body&gt;
                  </code>{" "}
                  section
                </li>
                <li>
                  <strong>Wix/Squarespace:</strong> Use the "Embed Code" or
                  "Custom Code" widget
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Settings panel */}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Chat Settings (60%) */}
          <div className="lg:w-[60%] w-full">
            {/* Mode toggle */}
            <div className="flex items-center justify-between space-x-3">
              <div className="inline-flex rounded-lg bg-gray-100 p-1 border border-gray-200">
                <button onClick={() => setMode("chat")} 
                  className={`flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium transition-all duration-200 
                  ${mode === "chat" ? "bg-white text-black shadow-sm border border-gray-200" : "text-gray-600 hover:text-gray-900"}`}>
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
                <button
                  onClick={() => setMode("voice")}
                  className={`flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    mode === "voice"
                      ? "bg-white text-black shadow-sm border border-gray-200"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <UserPen className="h-4 w-4" />
                  Personalization
                </button>
              </div>
            </div>
            <ChatSettings />
          </div>

          <div className="lg:w-[40%] w-full shadow-xl rounded-2xl overflow-hidden border border-gray-200 bg-white flex flex-col h-[680px]">
            {/* Header */}
            <div className="flex items-center justify-between bg-black text-white px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 bg-green-400 rounded-full" />
                <div>
                  <div className="text-sm font-semibold">
                    Conversia Assistant
                  </div>
                  <div className="text-xs text-gray-300">online</div>
                </div>
              </div>
            </div>

            {/* Messages area */}
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
            </div>

            {/* Input (fixed bottom inside the panel) */}
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
          {/* Floating Chat Button */}
          <button className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-black text-white shadow-lg hover:bg-gray-800">
            <MessageCircle size={26} />
          </button>
        </div>
      </div>
    </div>
  );
}
