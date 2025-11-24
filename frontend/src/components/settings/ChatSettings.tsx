"use client";
import { Lock } from "lucide-react";
import ColorPicker from "../ui/ColorPicker";
import { useEffect } from "react";

export default function ChatSettings({
  color,
  onThemeChange,
}: {
  color: string;
  onThemeChange?: (theme: string) => void | undefined;
}) {
  const isPremium = true;

  useEffect(() => {
    if (onThemeChange) {
      onThemeChange(color);
    }
    console.log(color);
  }, [color, onThemeChange]);

  return (
    <div className="bg-white rounded-xl shadow p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Chat Settings</h2>
          <p className="text-gray-500 text-sm mt-1">
            Customize how your chatbot appears and behaves on your site.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Plan:</span>
          <span
            className={`text-sm font-semibold px-3 py-1 rounded-full ${
              isPremium
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {isPremium ? "Premium" : "Free"}
          </span>
        </div>
      </div>

      {/* FREE SETTINGS */}
      <div className="space-y-5 ">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Greeting message
          </label>
          <input
            type="text"
            placeholder="Hi there! How can I help you?"
            className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:ring-black focus:border-black"
          />
        </div>

        <div className="flex items-center justify-between mb-2">
          {!isPremium && (
            <button
              onClick={() => alert("Redirect to pricing page")}
              className="text-sm bg-black text-white px-3 py-1 rounded hover:bg-gray-800"
            >
              Upgrade to Premium
            </button>
          )}
        </div>

        {/* Theme Picker */}
        <div
          className={`w-full mt-1 ${
            !isPremium ? "opacity-60 pointer-events-none" : ""
          }`}
        >
          <label className="mb-2 block text-sm font-medium text-gray-700">
            ChatBot Theme
          </label>
          <ColorPicker theme={color} onChange={onThemeChange!} />
        </div>
        
        {/* more personalization */}
        


        {/* Custom Branding */}
        <div
          className={`relative p-4 border rounded-md ${
            isPremium ? "" : "opacity-60 pointer-events-none"
          }`}
        >
          {!isPremium && (
            <div className="absolute inset-0 bg-white/75 flex items-center justify-center rounded-xl z-10">
              <Lock className="text-gray-400 w-5 h-5" />
            </div>
          )}
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Branding
          </label>
          <div className="flex items-center gap-4">
            <input
              type="file"
              className="block w-full text-sm border border-gray-300 rounded-md py-2 px-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors duration-200 file:rounded-md file:border-0 file:py-1 file:px-4 file:bg-gray-700 file:text-white file:font-semibold file:cursor-pointer"
            />
          </div>
          <p className="text-xs text-gray-500 mt-3 italic">
            Upload your brand logo or avatar&nbsp;
            <span className="text-gray-400">(PNG, JPG, SVG)</span>
          </p>
        </div>

        {/* Tone of Voice */}
        <div
          className={`relative p-4 border rounded-md ${
            isPremium ? "" : "opacity-50 pointer-events-none"
          }`}
        >
          {!isPremium && (
            <div className="absolute inset-0 bg-white/75 flex items-center justify-center">
              <Lock className="text-gray-400 w-5 h-5" />
            </div>
          )}
          <label className="block text-sm font-medium text-gray-700">
            Tone of Voice
          </label>
          <select className="mt-2 w-full border rounded-md px-3 py-2 text-sm">
            <option>Friendly</option>
            <option>Professional</option>
            <option>Playful</option>
            <option>Formal</option>
          </select>
        </div>

        {/* AI Model */}
        <div
          className={`relative p-4 border rounded-md ${
            isPremium ? "" : "opacity-50 pointer-events-none"
          }`}
        >
          {!isPremium && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <Lock className="text-gray-400 w-5 h-5" />
            </div>
          )}
          <label className="block text-sm font-medium text-gray-700">
            AI Model
          </label>
          <select className="mt-2 w-full border rounded-md px-3 py-2 text-sm">
            <option>Conversia Base</option>
            <option>Conversia Pro</option>
            <option>GPT-4 Turbo</option>
          </select>
        </div>

        {/* Integrations 
        <div
          className={`relative p-4 border rounded-md ${
            isPremium ? "" : "opacity-50 pointer-events-none"
          }`}
        >
          {!isPremium && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <Lock className="text-gray-400 w-5 h-5" />
            </div>
          )}
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Integrations
          </label>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <button className="border rounded p-2 hover:bg-gray-50">
              Slack
            </button>
            <button className="border rounded p-2 hover:bg-gray-50">
              Notion
            </button>
            <button className="border rounded p-2 hover:bg-gray-50">
              HubSpot
            </button>
            <button className="border rounded p-2 hover:bg-gray-50">
              Zapier
            </button>
          </div>
        </div> */}
      </div>
    </div>
  );
}
