import { Settings } from "lucide-react";
import ChatSettings from "../../components/settings/ChatSettings";
import VoiceSettings from "../../components/settings/VoiceSettings"

type SettingPanelProps = {
  mode: string;
  color: string;
  onThemeChange?: (color: string) => void;
};

export default function SettingsPanel({ mode, color, onThemeChange }: SettingPanelProps) {
  return (
    <div className="lg:w-[60%] w-full bg-white rounded-md shadow p-6">
      <div className="flex items-center gap-3 mb-4">
        <Settings className="h-4 w-4" />
        <p className="font-semibold text-gray-800">Settings ({mode})</p>
      </div>
      {
        mode == "chat" ? <ChatSettings color={color} onThemeChange={onThemeChange}/> : <VoiceSettings />
      }
    </div>
  );
}
