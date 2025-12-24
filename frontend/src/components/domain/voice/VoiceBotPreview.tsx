import { Phone } from "lucide-react";

export default function VoiceBotPreview() {
  return (
    <div className="flex-row items-center bg-gray-900 rounded-xl shadow-lg p-4 w-80 h-[170px]">
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex items-center justify-center w-10 h-10">
          {/* Animated ringing circles */}
          <span className="absolute w-10 h-10 rounded-full bg-green-400/50 animate-ping"></span>
          <span className="absolute w-9 h-9 rounded-full bg-green-500/40 animate-pulse"></span>
          <span className="absolute w-8 h-8 rounded-full bg-green-700/30"></span>
          {/* Phone icon in the center */}
          <Phone className="relative text-white w-5 h-5" />
        </div>
        <p className="ml-4 text-white text-sm">Need Help?</p>
      </div>
      <button className="flex items-center w-full bg-gray-100 rounded-lg py-3 mt-2 hover:bg-gray-200 transition gap-4 cursor-pointer">
        <span className="text-black-900 text-base font-medium mx-auto w-full text-center flex justify-center">Ask anything</span>
      </button>
      <div className="flex justify-between items-center text-xs text-gray-400 pt-3 pl-1">
        Powered by Conversia.ai
      </div>
    </div>
  );
}