import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import SettingsPanel from "./SettingPanel";
import ChatSnippet from "./chat/ChatSnippet";
import VoiceSnippet from "./voice/VoiceSnippet";
import ChatBotPreview from "./chat/ChatBotPreview";
import VoiceBotPreview from "./voice/VoiceBotPreview";
import { BACKEND_URL, getContrastTextColor } from "../../lib/utils";

export interface Chatbot{
  domainId: string,
  botType: 'voice' | 'chat',
  systemPrompt: string,
  firstMessage: string,
  appearance_settings: {
    themeColor: string,
    fontSize: string,
    logoUrl: string,
  },
  language: string,
  createdAt: Date,
  updatedAt: Date,
}

export default function Domain() {
  const location = useLocation();
  const domainName = location.state?.domainName || "example.com";
  const domainId = location.state?.domainId;
  const domainImageUrl = location.state?.domainImageUrl;

  const [mode, setMode] = useState<"chat" | "voice">("chat");
  const [expanded, setExpanded] = useState(false);
  const snippetRef = useRef<HTMLDivElement>(null);
  const [chatBot, setChatBot] = useState<Chatbot | null>(null);

  const themeColor: string = chatBot?.appearance_settings?.themeColor || "#000000";

  const [themeChatColor, setChatThemeColor] = useState<string>(themeColor);

  useEffect(() => {
    setChatThemeColor(chatBot?.appearance_settings?.themeColor || "#000000");
  }, [chatBot?.appearance_settings?.themeColor]);

  useEffect(() => {
    const metaData = async() => {
      const response = await fetch(`${BACKEND_URL}/bot/meta/${domainId}`, {
        method: "GET",
        headers:{
          "Content-type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
      const data = await response.json();
      console.log(data)
      const chatBot = Array.isArray(data)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? data.find((bot: any) => bot.botType === "chat")
        : null;
      if (!chatBot) {
        if (data && Array.isArray(data.bots)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const foundChatBot = data.bots.find((bot: any) => bot.botType === "chat");
          if (!foundChatBot) {
            console.log("No chatBot found in bots array. Data received from API:", data);
          }
          setChatBot(foundChatBot || null);
        } else {
          console.log("chatBot is null. Data received from API:", data);
          setChatBot(null);
        }
      } else {
        setChatBot(chatBot);
      }
    }
    metaData()
  }, [domainId]);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">
              {domainName.charAt(0).toUpperCase() + domainName.slice(1)}
            </h1>
            <p className="text-gray-500 mt-1">
              Configure your chatbot and voice assistant for this domain.
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="inline-flex bg-gray-100 border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => setMode("chat")}
              className={`px-5 py-2 rounded-md text-sm font-medium ${
                mode === "chat"
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-600"
              }`}
            >
              Chat Bot
            </button>
            
            <button
              onClick={() => setMode("voice")}
              className={`px-5 py-2 rounded-md text-sm font-medium ${
                mode === "voice"
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-600"
              }`}
            >
              Voice Bot
            </button>
          </div>
        </div>

        {/* Code snippet */}
        <div className="relative bg-gray-50 rounded-lg border border-gray-200 p-0 overflow-hidden">
          <div
            ref={snippetRef}
            className="transition-all duration-500"
            style={{
              maxHeight: expanded ? 3050 : 400,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <pre className="whitespace-pre-wrap break-words text-sm text-gray-700 m-0 p-4">
              <code>
                {mode === "chat" ? (
                  <ChatSnippet domainName={domainName} />
                ) : (
                  <VoiceSnippet domainName={domainName} />
                )}
              </code>
            </pre>
            {!expanded && (
              <div
                className="absolute left-0 right-0 bottom-0 h-24 bg-gradient-to-t from-gray-50/95 via-gray-50/60 to-transparent pointer-events-none transition-all duration-300"
                style={{ zIndex: 3 }}
              />
            )}
          </div>
          <button
            className="flex items-center gap-2 text-gray-600 absolute right-3 bottom-2 bg-white px-3 py-1 rounded shadow hover:bg-gray-100 transition z-10"
            onClick={() => setExpanded((e) => !e)}
            aria-label={expanded ? "Show less" : "Show more"}
            style={{ marginTop: expanded ? 0 : -40, position: "absolute" }}
          >
            {expanded ? ( 
              <>
                <ChevronUp className="w-4 h-4" /> Show less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" /> Reveal full code
              </>
            )}
          </button>
        </div>

        {/* Settings + Preview */}
        <div className="flex flex-col lg:flex-row gap-6">
          <SettingsPanel 
            domainName={domainName}
            mode={mode}
            color={themeChatColor}
            onThemeChange={setChatThemeColor}
          />
          {mode === "chat" 
            ? (
              <ChatBotPreview 
                domainName={domainName} 
                domainImageUrl={domainImageUrl} 
                themeChatColor={themeChatColor} 
              />
            ) 
            : <VoiceBotPreview />
          }
        </div>

        {/* Floating Button */}
        {mode === "chat" ? (
          <button 
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg hover:bg-gray-800" 
            style={{
              backgroundColor: themeChatColor, 
              color: getContrastTextColor(themeChatColor)
            }}
          >
            <MessageCircle size={26} />
          </button>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
