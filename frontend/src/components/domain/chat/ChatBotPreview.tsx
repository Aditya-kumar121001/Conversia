const sampleMessages = [
  {
    id: 1,
    from: "bot",
    text: "Hi there! I'm Conversia — how can I help you today?",
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
 
function getContrastTextColor(hex: string) {
  hex = hex.replace('#', '');

  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }

  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#ffffff";
}

type ChatbotSettingProps = {
  domainName: string,
  domainImageUrl: string,
  themeColor: string
}

export default function ChatBotPreview({
  domainName,
  domainImageUrl,
  themeColor
}: ChatbotSettingProps) {
  return (
    <div className="lg:w-[40%] w-full shadow-xl rounded-2xl overflow-hidden border border-gray-200 bg-white flex flex-col h-[680px]">
      <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: themeColor, color: getContrastTextColor(themeColor) }}>
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse " />
          <div>
            <div className="text-sm font-semibold">{domainName} Bot</div>
            <div className="text-xs text-gray-300"  style={{ backgroundColor: themeColor, color: getContrastTextColor(themeColor) }}>online</div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-5 overflow-y-auto bg-gray-50 flex flex-col gap-4">
        {sampleMessages.map((m) =>
          m.from === "bot" ? (
            <div key={m.id} className="flex items-start gap-2">
              <div className="h-9 w-9 rounded-full text-white flex items-center justify-center font-semibold text-sm">
                <img
                  src={domainImageUrl || "/technomart.png"}
                  alt="Logo preview"
                  className="h-6 w-6 align-center"
                />
              </div>
              <div className="bg-white px-4 py-3 rounded-2xl text-sm text-gray-800 shadow-sm max-w-[78%]">
                {m.text}
              </div>
            </div>
          ) : (
            <div key={m.id} className="flex justify-end">
              <div className="text-white px-4 py-3 rounded-2xl text-sm shadow-sm max-w-[78%]" style={{ backgroundColor: themeColor, color: getContrastTextColor(themeColor) }}>
                {m.text}
              </div>
            </div>
          )
        )}
      </div>

      <div className="border-t bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 text-sm px-3 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-1 focus:ring-black"
          />
          <button className="px-4 py-2 text-white rounded-full shadow-sm text-sm hover:bg-gray-800 transition"  style={{ backgroundColor: themeColor, color: getContrastTextColor(themeColor) }}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
