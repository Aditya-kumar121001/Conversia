import ChatSettings from "../../components/settings/ChatSettings";
import VoiceSettings from "../../components/settings/VoiceSettings"
import type { KnowledgeBaseEntry, Bot } from "../../types";

interface SettingPanelProps {
  mode: string;
  onThemeChange?: (color: string) => void;
  kbs: KnowledgeBaseEntry[];
  metadata: Bot;
};

export default function SettingsPanel({ mode, onThemeChange, kbs, metadata }: SettingPanelProps) {
  return (
    <div className="lg:w-[60%] w-full bg-white rounded-md shadow p-4">
      {/* <div className="flex items-center gap-3 mb-4">
        <Settings className="h-4 w-4" />
        <p className="font-semibold text-gray-800">Settings ({mode})</p>
      </div> */}
      {
        mode === "chat" ? <ChatSettings onThemeChange={onThemeChange} kbs={kbs} metadata={metadata} /> : <VoiceSettings />
      }
    </div>
  );
}
