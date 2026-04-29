import { useState } from "react";
import { Lock } from "lucide-react";
import { useTenant } from "../../context/Context";
import UpgradeModal from "../ui/UpgradeModal";

export default function VoiceSettings() {
  const { user } = useTenant();
  const isPremium = user?.isPremium || false;
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState("");

  return (
    <div className="bg-white rounded-xl shadow p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Voice Settings</h2>
          <p className="text-gray-500 text-sm mt-1">
            Customize how your Voice bot appears and behaves on your site.
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
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Widget position
          </label>
          <select className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:ring-black focus:border-black">
            <option>Bottom Right</option>
            <option>Bottom Left</option>
          </select>
        </div>

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

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Theme color
          </label>
          <select className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:ring-black focus:border-black">
            <option>Conversia Blue</option>
            <option>Slate Gray</option>
            <option>Purple Glow</option>
          </select>
        </div>

        <div className="flex items-center justify-between mb-2">
          {!isPremium && (
            <button
              onClick={() => { setUpgradeFeature("Voice AI Agents"); setIsUpgradeModalOpen(true); }}
              className="text-sm bg-black text-white px-3 py-1 rounded hover:bg-gray-800"
            >
              Upgrade to Premium
            </button>
          )}
        </div>

        {/* Custom Branding */}
        <div
          className={`relative p-4 border rounded-md ${
            isPremium ? "" : "opacity-50 pointer-events-none"
          }`}
        >
          {!isPremium && (
            <div 
              className="absolute inset-0 bg-white/70 flex items-center justify-center cursor-pointer hover:bg-white/80 transition-colors z-10 rounded-md"
              onClick={() => { setUpgradeFeature("Custom Branding"); setIsUpgradeModalOpen(true); }}
            >
              <div className="bg-white shadow-sm border border-gray-100 rounded-full p-2 flex items-center gap-2">
                <Lock className="text-blue-600 w-4 h-4" />
                <span className="text-xs font-medium text-blue-800 pr-1">Upgrade to unlock</span>
              </div>
            </div>
          )}
          <label className="block text-sm font-medium text-gray-700">
            Custom Branding
          </label>
          <input
            type="file"
            className="mt-2 block w-full text-sm border rounded-md p-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            Upload your brand logo or avatar
          </p>
        </div>

        {/* Tone of Voice */}
        <div
          className={`relative p-4 border rounded-md ${
            isPremium ? "" : "opacity-50 pointer-events-none"
          }`}
        >
          {!isPremium && (
            <div 
              className="absolute inset-0 bg-white/70 flex items-center justify-center cursor-pointer hover:bg-white/80 transition-colors z-10 rounded-md"
              onClick={() => { setUpgradeFeature("Tone of Voice"); setIsUpgradeModalOpen(true); }}
            >
              <div className="bg-white shadow-sm border border-gray-100 rounded-full p-2 flex items-center gap-2">
                <Lock className="text-blue-600 w-4 h-4" />
                <span className="text-xs font-medium text-blue-800 pr-1">Upgrade to unlock</span>
              </div>
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
            <div 
              className="absolute inset-0 bg-white/70 flex items-center justify-center cursor-pointer hover:bg-white/80 transition-colors z-10 rounded-md"
              onClick={() => { setUpgradeFeature("Advanced AI Models"); setIsUpgradeModalOpen(true); }}
            >
              <div className="bg-white shadow-sm border border-gray-100 rounded-full p-2 flex items-center gap-2">
                <Lock className="text-blue-600 w-4 h-4" />
                <span className="text-xs font-medium text-blue-800 pr-1">Upgrade to unlock</span>
              </div>
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

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        feature={upgradeFeature}
      />
    </div>
  );
}
