"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Lock } from "lucide-react";
import { useTenant } from "../../context/Context";
import UpgradeModal from "../ui/UpgradeModal";
import { BACKEND_URL, SYSTEM_PROMPT } from "../../lib/utils";
import type { KnowledgeBaseEntry, Bot } from "../../types";

type TabId = "general" | "behavior" | "ai" | "branding";

const TABS: { id: TabId; label: string }[] = [
  { id: "general", label: "General" },
  { id: "behavior", label: "Behavior" },
  { id: "ai", label: "AI" },
  { id: "branding", label: "Branding" },
];

interface VoiceSettingsProps {
  domainName?: string;
  kbs: KnowledgeBaseEntry[];
  metadata: Bot;
}

interface ContextData {
  tone?: string;
  aiModel?: string;
  files?: string[];
}

export default function VoiceSettings({
  domainName,
  kbs,
  metadata,
}: VoiceSettingsProps) {
  const { user } = useTenant();
  const isPremium = user?.isPremium || false;
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState("");
  const location = useLocation();
  const params = useParams();
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
  const hydrateFromBackend = useCallback(
    (backendMetadata: Bot, domainName: string): Bot => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const meta = backendMetadata as any;

      return {
        chatbotName: meta.chatbotName || "",
        domainId: backendMetadata.domainId || "",
        domainName: domainName,
        botType: backendMetadata.botType || "voice",
        generalSettings: {
          systemPrompt: SYSTEM_PROMPT,
          firstMessage:
            backendMetadata.generalSettings?.firstMessage ||
            "Hi there! How can I help you?",
          fallbackMessage:
            backendMetadata.generalSettings?.fallbackMessage ||
            "Sorry, I didn't quite understand that.",
          starters: Array.isArray(meta.generalSettings?.starters)
            ? meta.generalSettings.starters
            : [],
        },
        appearance_settings: {
          themeColor: backendMetadata.appearance_settings?.themeColor || "#000000",
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
  );

  const initialSettings: Bot = hydrateFromBackend(metadata, resolvedDomainName);

  const [settings, setSettings] = useState<Bot>(initialSettings);
  const [contextData, setContextData] = useState<ContextData>(initialContext);

  // Store initial state for comparison
  const initialSettingsRef = useRef<Bot>(initialSettings);
  const initialContextDataRef = useRef<ContextData>(initialContext);
  const initialBrandingFileRef = useRef<File | null>(null);

  /* ---------- Side effects ---------- */
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
      setKbEntries(data.KBs);
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch KBs on mount
  useEffect(() => {
    fetchKbs();
  }, []);

  // Re-hydrate whenever the bot identity changes
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const kbFilesFromMetadata = (metadata as any).kbFiles || [];
    const updatedContext = parseContext(metadata.context, kbFilesFromMetadata);
    const hydratedSettings = hydrateFromBackend(metadata, resolvedDomainName);

    setSettings(hydratedSettings);
    setContextData(updatedContext);
    initialSettingsRef.current = hydratedSettings;
    initialContextDataRef.current = updatedContext;
    initialBrandingFileRef.current = null;
  }, [metadata.domainId, metadata.updatedAt]);

  // Check if there are any changes
  const hasChanges = () => {
    const initial = initialSettingsRef.current;
    const initialCtx = initialContextDataRef.current;
    const initialFile = initialBrandingFileRef.current;

    const settingsChanged =
      settings.chatbotName !== initial.chatbotName ||
      settings.generalSettings.firstMessage !==
        initial.generalSettings.firstMessage ||
      settings.generalSettings.fallbackMessage !==
        initial.generalSettings.fallbackMessage ||
      settings.appearance_settings.logoUrl !==
        initial.appearance_settings.logoUrl;

    const contextChanged =
      contextData.tone !== initialCtx.tone ||
      contextData.aiModel !== initialCtx.aiModel ||
      JSON.stringify(contextData.files || []) !==
        JSON.stringify(initialCtx.files || []);

    const brandingChanged = brandingFile !== initialFile;

    return settingsChanged || contextChanged || brandingChanged;
  };

  const handleSave = async () => {
    if (!domainUrl) return;

    try {
      setSaving(true);

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

      const payload = {
        botType: "voice",
        greeting: settings.generalSettings.firstMessage,
        generalSettings: {
          systemPrompt: SYSTEM_PROMPT,
          firstMessage: settings.generalSettings.firstMessage,
          fallbackMessage: settings.generalSettings.fallbackMessage,
          starters: [],
        },
        appearance_settings: {
          themeColor: settings.appearance_settings.themeColor || "#000000",
          fontSize:
            settings.appearance_settings.fontSize ||
            metadata.appearance_settings?.fontSize ||
            "14",
          ...(logoUrl && { logoUrl }),
        },
        language: settings.language || metadata.language || "en",
        context: JSON.stringify(contextData),
        kbFiles: contextData.files || [],
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
      console.log("Voice settings saved successfully:", result);

      // Update initial state refs after successful save
      initialSettingsRef.current = { ...settings };
      initialContextDataRef.current = { ...contextData };
      initialBrandingFileRef.current = brandingFile;

      if (logoUrl) {
        initialSettingsRef.current.appearance_settings.logoUrl = logoUrl;
      }
    } catch (err) {
      console.error("Error saving voice settings:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-2 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Voice Bot Settings</h2>
          <p className="text-gray-500 text-sm mt-1">
            Customize how your voice bot appears and behaves on your site.
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
            {/* Widget Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Widget Position
              </label>
              <select className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:ring-black focus:border-black">
                <option>Bottom Right</option>
                <option>Bottom Left</option>
              </select>
            </div>

            {/* Greeting Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Greeting Message
              </label>
              <input
                type="text"
                placeholder="Hi there! How can I help you?"
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:ring-black focus:border-black"
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
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm resize-none focus:ring-black focus:border-black"
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
                <PremiumOverlay onClick={() => { setUpgradeFeature("Advanced Behavior Settings"); setIsUpgradeModalOpen(true); }} />
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
                <PremiumOverlay onClick={() => { setUpgradeFeature("Advanced AI Models"); setIsUpgradeModalOpen(true); }} />
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
            {!isPremium && <PremiumOverlay onClick={() => { setUpgradeFeature("Custom Branding"); setIsUpgradeModalOpen(true); }} />}
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

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        feature={upgradeFeature}
      />
    </div>
  );
}

function PremiumOverlay({ onClick }: { onClick?: () => void }) {
  return (
    <div 
      className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 rounded-md cursor-pointer hover:bg-white/70 transition-colors"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick?.();
      }}
    >
      <div className="bg-white shadow-sm border border-gray-100 rounded-full p-2 flex items-center gap-2">
         <Lock className="w-4 h-4 text-blue-600" />
         <span className="text-xs font-medium text-blue-800 pr-1">Upgrade to unlock</span>
      </div>
    </div>
  );
}
