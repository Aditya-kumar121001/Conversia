"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Lock } from "lucide-react";
import ColorPicker from "../ui/ColorPicker";
import { BACKEND_URL, SYSTEM_PROMPT } from "../../lib/utils";
import type { KnowledgeBaseEntry, Bot } from "../../types";

type TabId = "general" | "appearance" | "behavior" | "ai" | "branding";

const TABS: { id: TabId; label: string }[] = [
  { id: "general", label: "General" },
  { id: "appearance", label: "Appearance" },
  { id: "behavior", label: "Behavior" },
  { id: "ai", label: "AI" },
  { id: "branding", label: "Branding" },
];

interface ChatSettingsProps {
  domainName?: string;
  color?: string;
  onThemeChange?: (theme: string) => void;
  kbs: KnowledgeBaseEntry[];
  metadata: Bot;
}

interface ContextData {
  tone?: string;
  aiModel?: string;
  files?: string[];
}

export default function ChatSettings({
  domainName,
  onThemeChange,
  kbs,
  metadata,
}: ChatSettingsProps) {
  const isPremium = true;
  const location = useLocation();
  const params = useParams();
  // Support refresh/deep-link: location.state is lost, so fall back to route param.
  const domainUrl = location.state?.domainUrl || params.domain;
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [saving, setSaving] = useState(false);
  const [kbEntries, setKbEntries] = useState<KnowledgeBaseEntry[]>([]);
  const [brandingFile, setBrandingFile] = useState<File | null>(null);

  const resolvedDomainName =
    metadata.domainName ||
    domainName ||
    location.state?.domainName ||
    "example.com";
  // Always prioritize metadata color, then prop color, then default
  const resolvedColor = metadata.appearance_settings?.themeColor || "#000000";

  const parseContext = (context?: string, kbFiles?: string[]): ContextData => {
    const defaultContext = {
      tone: "Friendly",
      aiModel: "Conversia Base",
      files: kbFiles || [],
    };
    if (!context) return defaultContext;
    try {
      const parsed = JSON.parse(context);
      if (kbFiles && Array.isArray(kbFiles)) {
        parsed.files = kbFiles;
      } else if (!parsed.files) {
        parsed.files = [];
      }
      return parsed;
    } catch {
      return defaultContext;
    }
  };

  const kbFilesFromMetadata = metadata.kbFiles || [];
  const initialContext = parseContext(metadata.context, kbFilesFromMetadata);

  // hydrateFromBackend: Convert backend metadata to React state
  // Always use SYSTEM_PROMPT constant, never from metadata
  const hydrateFromBackend = useCallback(
    (backendMetadata: Bot, domainName: string, fallbackColor: string): Bot => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const metadata = backendMetadata as any;

      // Ensure starters are properly extracted from backend
      // Check both generalSettings.starters and top-level starters (for backward compatibility)
      const starters =
        metadata.generalSettings?.starters || metadata.starters || [];

      // Use themeColor from metadata if available, otherwise use fallback
      const themeColor =
        backendMetadata.appearance_settings?.themeColor ||
        metadata.appearance_settings?.themeColor ||
        fallbackColor ||
        "#000000";

      return {
        chatbotName: metadata.chatbotName || "",
        domainId: backendMetadata.domainId || "",
        domainName: domainName,
        botType: backendMetadata.botType || "chat",
        generalSettings: {
          systemPrompt: SYSTEM_PROMPT, // Always use constant, never from backend
          firstMessage:
            backendMetadata.generalSettings?.firstMessage ||
            "Hi there! How can I help you?",
          fallbackMessage:
            backendMetadata.generalSettings?.fallbackMessage ||
            "Sorry, I didn't quite understand that.",
          starters: Array.isArray(starters) ? starters : [], // Ensure starters are always an array from backend
        },
        appearance_settings: {
          themeColor: themeColor,
          fontSize: backendMetadata.appearance_settings?.fontSize,
          logoUrl: backendMetadata.appearance_settings?.logoUrl,
        },
        language: backendMetadata.language || "en",
        context: backendMetadata.context,
        createdAt: backendMetadata.createdAt || new Date(),
        updatedAt: backendMetadata.updatedAt || new Date(),
      };
    },
    []
  ); // Empty deps - SYSTEM_PROMPT is a constant

  const initialSettings: Bot = hydrateFromBackend(
    metadata,
    resolvedDomainName,
    resolvedColor
  );

  const [settings, setSettings] = useState<Bot>(initialSettings);
  const [contextData, setContextData] = useState<ContextData>(initialContext);

  // Store initial state for comparison
  const initialSettingsRef = useRef<Bot>(initialSettings);
  const initialContextDataRef = useRef<ContextData>(initialContext);
  const initialBrandingFileRef = useRef<File | null>(null);

  /* ---------- Side effects ---------- */
  // Use kbEntries (fetched) if available, otherwise fall back to kbs prop
  const kbList = kbEntries.length > 0 ? kbEntries : kbs;
  const files = Array.isArray(kbList)
    ? kbList.reduce((acc, kb) => {
        if (Array.isArray(kb.fileIds)) {
          return acc.concat(kb.fileIds);
        }
        return acc;
      }, [] as KnowledgeBaseEntry["fileIds"])
    : [];

  const fetchKbs = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/kb/all-kb`, {
        method: "GET",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch KBs");

      const data = await response.json();
      console.log("API KBs:", data.KBs);
      setKbEntries(data.KBs);
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch KBs on mount
  useEffect(() => {
    fetchKbs();
  }, []);

  // Update theme color callback when color changes
  useEffect(() => {
    const currentColor =
      settings.appearance_settings.themeColor || resolvedColor;
    onThemeChange?.(currentColor);
  }, [settings.appearance_settings.themeColor, onThemeChange, resolvedColor]);

useEffect(() => {
  // Re-hydrate whenever the bot identity changes (e.g. after async fetch)
  const kbFilesFromMetadata = (metadata as any).kbFiles || [];
  const updatedContext = parseContext(metadata.context, kbFilesFromMetadata);
  const hydratedSettings = hydrateFromBackend(
    metadata,
    resolvedDomainName,
    metadata.appearance_settings?.themeColor || resolvedColor
  );

  setSettings(hydratedSettings);
  setContextData(updatedContext);
  initialSettingsRef.current = hydratedSettings;
  initialContextDataRef.current = updatedContext;
  initialBrandingFileRef.current = null;
}, [metadata.domainId, metadata.updatedAt]);


  // Check if there are any changes
  const hasChanges = () => {
    const initial = initialSettingsRef.current;
    const initialContext = initialContextDataRef.current;
    const initialFile = initialBrandingFileRef.current;

    // Check settings changes
    const settingsChanged =
      settings.chatbotName !== initial.chatbotName ||
      settings.generalSettings.firstMessage !==
        initial.generalSettings.firstMessage ||
      settings.generalSettings.fallbackMessage !==
        initial.generalSettings.fallbackMessage ||
      JSON.stringify(settings.generalSettings.starters) !==
        JSON.stringify(initial.generalSettings.starters) ||
      settings.appearance_settings.themeColor !==
        initial.appearance_settings.themeColor ||
      settings.appearance_settings.logoUrl !==
        initial.appearance_settings.logoUrl;

    // Check context data changes
    const contextChanged =
      contextData.tone !== initialContext.tone ||
      contextData.aiModel !== initialContext.aiModel ||
      JSON.stringify(contextData.files || []) !==
        JSON.stringify(initialContext.files || []);

    // Check branding file change
    const brandingChanged = brandingFile !== initialFile;

    return settingsChanged || contextChanged || brandingChanged;
  };

  const handleSave = async () => {
    if (!domainUrl) return;

    try {
      setSaving(true);

      // Convert branding file to data URL if present
      let logoUrl = settings.appearance_settings.logoUrl;
      if (brandingFile) {
        logoUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            resolve(event.target?.result as string);
          };
          reader.onerror = reject;
          reader.readAsDataURL(brandingFile);
        });
      }

      // Build payload according to backend expectations
      // Include ALL fields to prevent losing existing values
      const payload: {
        botType: string;
        greeting: string;
        generalSettings: {
          systemPrompt: string;
          firstMessage: string;
          fallbackMessage: string;
          starters: string[];
        };
        appearance_settings: {
          themeColor: string;
          fontSize?: string;
          logoUrl?: string;
        };
        language?: string;
        context: string;
        kbFiles?: string[];
      } = {
        botType: "chat", // Ensure we're updating the chat bot
        greeting: settings.generalSettings.firstMessage, // Maps to firstMessage (for backward compatibility)
        generalSettings: {
          systemPrompt: SYSTEM_PROMPT, // Always use constant, never from settings
          firstMessage: settings.generalSettings.firstMessage,
          fallbackMessage: settings.generalSettings.fallbackMessage,
          starters: settings.generalSettings.starters,
        },
        appearance_settings: {
          themeColor: settings.appearance_settings.themeColor || resolvedColor,
          fontSize:
            settings.appearance_settings.fontSize ||
            metadata.appearance_settings?.fontSize ||
            "14", // Preserve fontSize
          ...(logoUrl && { logoUrl }),
        },
        language: settings.language || metadata.language || "en", // Preserve language
        context: JSON.stringify(contextData), // Store additional settings as JSON string
        kbFiles: contextData.files || [], // Sync files from context to kbFiles field
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
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to save settings");
      }

      const result = await resp.json();
      console.log("Settings saved successfully:", result);

      // Update initial state refs after successful save
      initialSettingsRef.current = { ...settings };
      initialContextDataRef.current = { ...contextData };
      initialBrandingFileRef.current = brandingFile;

      // Update logoUrl in initial settings if branding file was uploaded
      if (logoUrl) {
        initialSettingsRef.current.appearance_settings.logoUrl = logoUrl;
      }
    } catch (err) {
      console.error("Error saving settings:", err);
      // You might want to show a toast/notification here
    } finally {
      setSaving(false);
    }
  };

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
                placeholder={`${resolvedDomainName} bot`}
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
                value={settings.generalSettings.firstMessage}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    generalSettings: {
                      ...settings.generalSettings,
                      firstMessage: e.target.value,
                    },
                  })
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
                placeholder={settings.generalSettings.fallbackMessage}
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm resize-none"
                value={settings.generalSettings.fallbackMessage}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    generalSettings: {
                      ...settings.generalSettings,
                      fallbackMessage: e.target.value,
                    },
                  })
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
                {/* Render starters from backend - ensure array exists and is not null */}
                {Array.isArray(settings.generalSettings.starters) &&
                settings.generalSettings.starters.length > 0 ? (
                  settings.generalSettings.starters.map((starter, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 border rounded-md px-3 py-2 text-sm"
                        value={starter || ""}
                        onChange={(e) => {
                          const updated = [
                            ...settings.generalSettings.starters,
                          ];
                          updated[idx] = e.target.value;
                          setSettings({
                            ...settings,
                            generalSettings: {
                              ...settings.generalSettings,
                              starters: updated,
                            },
                          });
                        }}
                        disabled={!isPremium}
                        placeholder="Enter conversation starter..."
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setSettings({
                            ...settings,
                            generalSettings: {
                              ...settings.generalSettings,
                              starters:
                                settings.generalSettings.starters.filter(
                                  (_, i) => i !== idx
                                ),
                            },
                          })
                        }
                        className="text-sm text-red-500 hover:text-red-600"
                        disabled={!isPremium}
                      >
                        Remove
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No conversation starters yet. Click "Add Starter" to add
                    one.
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  setSettings({
                    ...settings,
                    generalSettings: {
                      ...settings.generalSettings,
                      starters: [...settings.generalSettings.starters, ""],
                    },
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
              color={settings.appearance_settings.themeColor ?? "#000000"}
              onChange={(hex) =>
                setSettings((prev) => ({
                  ...prev,
                  appearance_settings: {
                    ...prev.appearance_settings,
                    themeColor: hex,
                  },
                }))
              }
            />
          </section>
        )}

        {/* BEHAVIOR */}
        {activeTab === "behavior" && (
          <section className="relative space-y-4">
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
              value={contextData.tone || "Friendly"}
              onChange={(e) =>
                setContextData({
                  ...contextData,
                  tone: e.target.value as
                    | "Friendly"
                    | "Professional"
                    | "Playful"
                    | "Formal",
                })
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
              {files.length > 0 ? (
                files.map((file) => {
                  // Check if this file is in contextData.files (synced from backend kbFiles)
                  const checked =
                    Array.isArray(contextData.files) &&
                    contextData.files.includes(file._id);

                  return (
                    <label
                      key={file._id}
                      className="inline-flex items-center gap-2"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setContextData((prev) => ({
                            ...prev,
                            files: checked
                              ? (prev.files || []).filter(
                                  (id) => id !== file._id
                                )
                              : [...(prev.files || []), file._id],
                          }));
                        }}
                        className="accent-black h-4 w-4 border-gray-300 rounded-lg transition-colors duration-150"
                      />
                      <span className="text-sm">{file.fileName}</span>
                    </label>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No knowledge base files available. Create a knowledge base
                  first.
                </p>
              )}
            </div>
          </section>
        )}

        {/* AI */}
        {activeTab === "ai" && (
          <section className="relative space-y-4">
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
              AI Model
            </label>
            <select
              className="w-full border rounded-md px-3 py-2 text-sm"
              value={contextData.aiModel || "Conversia Base"}
              onChange={(e) =>
                setContextData({
                  ...contextData,
                  aiModel: e.target.value,
                })
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
              onChange={(e) => setBrandingFile(e.target.files?.[0] || null)}
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
          disabled={saving || !hasChanges()}
          className="bg-black text-white px-5 py-2 rounded-md text-sm hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

function PremiumOverlay() {
  return (
    <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 rounded-md">
      <Lock className="w-5 h-5 text-gray-400" />
    </div>
  );
}
