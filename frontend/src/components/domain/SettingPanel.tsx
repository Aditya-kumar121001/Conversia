import { Settings } from "lucide-react";
import ChatSettings from "../../components/settings/ChatSettings";
import VoiceSettings from "../../components/settings/VoiceSettings"

export default function SettingsPanel({ mode }: { mode: string }) {
  return (
    <div className="lg:w-[60%] w-full bg-white rounded-md shadow p-6">
      <div className="flex items-center gap-3 mb-4">
        <Settings className="h-4 w-4" />
        <p className="font-semibold text-gray-800">Settings ({mode})</p>
      </div>
      {
        mode == "chat" ? <ChatSettings /> : <VoiceSettings />
      }
    </div>
  );
}
