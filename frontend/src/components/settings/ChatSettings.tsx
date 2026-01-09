"use client";

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Lock } from "lucide-react";
import ColorPicker from "../ui/ColorPicker";
import { BACKEND_URL } from "../../lib/utils";

type TabId = "general" | "appearance" | "behavior" | "ai" | "branding";

const TABS: { id: TabId; label: string }[] = [
  { id: "general", label: "General" },
  { id: "appearance", label: "Appearance" },
  { id: "behavior", label: "Behavior" },
  { id: "ai", label: "AI" },
  { id: "branding", label: "Branding" },
];

interface ChatSettingsProps {
  domainName: string;
  color: string;
  onThemeChange?: (theme: string) => void;
}

export default function ChatSettings({
  domainName,
  color,
  onThemeChange,
}: ChatSettingsProps) {

  const isPremium = true;
  const location = useLocation();
  const domainUrl = location.state?.domainUrl;

  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    chatbotName: "",
    firstMessage: "",
    fallbackMessage: "Sorry, I didn’t quite understand that.",
    conversationStarters: ["Pricing", "Talk to support", "Product features"],
  
    theme: color,
    tone: "Friendly",
    aiModel: "Conversia Base",
    brandingFile: null as File | null,
  });
  

  /* ---------- Side effects ---------- */

  useEffect(() => {
    onThemeChange?.(settings.theme);
  }, [settings.theme, onThemeChange]);

  /* ---------- Handlers ---------- */

  const handleSave = async () => {
    if (!domainUrl) return;

    try {
      setSaving(true);

      const payload = {
        greeting: settings.firstMessage,
        theme: settings.theme,
        tone: settings.tone,
        aiModel: settings.aiModel,
      };

      const resp = await fetch(
        `${BACKEND_URL}/domain/${encodeURIComponent(domainUrl)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!resp.ok) {
        throw new Error("Failed to save settings");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  /* ---------- UI ---------- */

  return (
    <div className="bg-white rounded-xl p-2 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Chatbot Settings</h2>
          <p className="text-gray-500 text-sm mt-1">
            Customize how your chatbot appears and behaves.
          </p>
        </div>

        <span
          className={`text-sm font-semibold px-4 py-1 rounded-full ${
            isPremium
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          {isPremium ? "Premium" : "Free"}
        </span>
      </div>

      {/* Tabs */}
      <div className="border-b mb-6">
        <nav className="flex gap-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium transition ${
                activeTab === tab.id
                  ? "border-b-2 border-black text-black"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[220px]">
        {/* GENERAL */}
        {activeTab === "general" && (
          <section className="space-y-6">
            {/* Chatbot Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Chatbot Name
              </label>
              <input
                type="text"
                placeholder={`${domainName} bot`}
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                value={settings.chatbotName}
                onChange={(e) =>
                  setSettings({ ...settings, chatbotName: e.target.value })
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                Display name shown to users
              </p>
            </div>

            {/* Greeting Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Greeting Message
              </label>
              <input
                type="text"
                placeholder="Hi there! How can I help you?"
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                value={settings.firstMessage}
                onChange={(e) =>
                  setSettings({ ...settings, firstMessage: e.target.value })
                }
              />
            </div>

            {/* Fallback Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fallback Message
              </label>
              <textarea
                rows={2}
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm resize-none"
                value={settings.fallbackMessage}
                onChange={(e) =>
                  setSettings({ ...settings, fallbackMessage: e.target.value })
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                Used when the bot is unsure how to respond
              </p>
            </div>

            {/* Conversation Starters */}
            <div className="relative">
              {!isPremium && <PremiumOverlay />}
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conversation Starter Follow-ups
              </label>

              <div className="space-y-2">
                {settings.conversationStarters.map((starter, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 border rounded-md px-3 py-2 text-sm"
                      value={starter}
                      onChange={(e) => {
                        const updated = [...settings.conversationStarters];
                        updated[idx] = e.target.value;
                        setSettings({
                          ...settings,
                          conversationStarters: updated,
                        });
                      }}
                      disabled={!isPremium}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setSettings({
                          ...settings,
                          conversationStarters:
                            settings.conversationStarters.filter(
                              (_, i) => i !== idx
                            ),
                        })
                      }
                      className="text-sm text-red-500 hover:text-red-600"
                      disabled={!isPremium}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() =>
                  setSettings({
                    ...settings,
                    conversationStarters: [
                      ...settings.conversationStarters,
                      "",
                    ],
                  })
                }
                className="mt-3 text-sm text-black font-medium hover:underline"
                disabled={!isPremium}
              >
                + Add Starter
              </button>
            </div>
          </section>
        )}

        {/* APPEARANCE */}
        {activeTab === "appearance" && (
          <section className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Chatbot Theme
            </label>
            <ColorPicker
              theme={settings.theme}
              onChange={(c) => setSettings({ ...settings, theme: c! })}
            />
          </section>
        )}

        {/* BEHAVIOR */}
        {activeTab === "behavior" && (
          <section className="relative space-y-4">
            {/* PremiumOverlay only covers half the section (top 50%) */}
            {!isPremium && (
              <div
                className="absolute left-0 top-0 w-full"
                style={{
                  height: "100%",
                  zIndex: 10,
                  pointerEvents: "auto",
                }}
              >
                <PremiumOverlay />
              </div>
            )}
            <label className="block text-sm font-medium text-gray-700">
              Tone of Voice
            </label>
            <select
              className="w-full border rounded-md px-3 py-2 text-sm"
              value={settings.tone}
              onChange={(e) =>
                setSettings({ ...settings, tone: e.target.value })
              }
            >
              <option>Friendly</option>
              <option>Professional</option>
              <option>Playful</option>
              <option>Formal</option>
            </select>

            {/* KNOWLEDGE BASE SELECT */}
            <label className="block mt-2 text-sm font-medium text-gray-700">
              Add Knowledge Base
            </label>
            <div className="flex flex-col gap-2">
              {["KB1", "KB2", "KB3", "KB4"].map((kb) => (
                <label key={kb} className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="knowledge-bases"
                    value={kb}
                    checked={(settings.knowledgeBases ?? []).includes(kb)}
                    onChange={(e) => {
                      const prev = settings.knowledgeBases ?? [];
                      if (e.target.checked) {
                        setSettings({ 
                          ...settings, 
                          knowledgeBases: [...prev, kb],
                        });
                      } else {
                        setSettings({ 
                          ...settings, 
                          knowledgeBases: prev.filter((item) => item !== kb),
                        });
                      }
                    }}
                    className="accent-black h-4 w-4 border-gray-300 rounded-lg transition-colors duration-150"
                  />
                  <span className="text-sm">{kb}</span>
                </label>
              ))}
            </div>
          </section>
        )}

        {/* AI */}
        {activeTab === "ai" && (
          <section className="relative space-y-4">
            {!isPremium && <div
                className="absolute left-0 top-0 w-full"
                style={{
                  height: "100%",
                  zIndex: 10,
                  pointerEvents: "auto",
                }}
              >
                <PremiumOverlay />
              </div>}
            <label className="block text-sm font-medium text-gray-700">
              AI Model
            </label>
            <select
              className="w-full border rounded-md px-3 py-2 text-sm"
              value={settings.aiModel}
              onChange={(e) =>
                setSettings({ ...settings, aiModel: e.target.value })
              }
            >
              <option>Conversia Base</option>
              <option>Conversia Pro</option>
              <option>GPT-4 Turbo</option>
            </select>
          </section>
        )}

        {/* BRANDING */}
        {activeTab === "branding" && (
          <section className="relative space-y-4">
            {!isPremium && <PremiumOverlay />}
            <input
              type="file"
              onChange={(e) =>
                setSettings({
                  ...settings,
                  brandingFile: e.target.files?.[0] || null,
                })
              }
              className="block w-full text-sm border border-gray-300 rounded-md py-2 px-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors duration-200 file:rounded-md file:border-0 file:py-1 file:px-4 file:bg-black file:text-white file:font-semibold file:cursor-pointer file:hover:bg-gray-700"
            />
            <p className="text-xs text-gray-500 italic">
              Upload logo or avatar (PNG, JPG, SVG)
            </p>
          </section>
        )}
      </div>

      {/* Actions */}
      <div className="pt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-black text-white px-5 py-2 rounded-md text-sm hover:bg-gray-800 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

/* ---------- Helpers ---------- */

function PremiumOverlay() {
  return (
    <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 rounded-md">
      <Lock className="w-5 h-5 text-gray-400" />
    </div>
  );
}
