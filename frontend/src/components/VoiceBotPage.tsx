"use client";

import { useState } from "react";
import { X, Mic, PhoneOff } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function VoiceBotPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const domainName = params.get("domain") || "customer";

  const handleStartCall = async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      setIsConnected(true);
      // TODO: Integrate with actual voice API (ElevenLabs or similar)
      console.log("Voice call started for domain:", domainName);
    } catch (error) {
      console.error("Failed to start voice call:", error);
      alert("Microphone permission is required for voice calls");
    }
  };

  const handleEndCall = () => {
    setIsRecording(false);
    setIsConnected(false);
    // TODO: End voice session
    console.log("Voice call ended");
  };

  const handleClose = () => {
    if (isConnected) {
      handleEndCall();
    }
    // Send message to parent to close iframe
    if (window.parent && window.parent !== window) {
      window.parent.postMessage("close-voicebot", "*");
    }
  };

  return (
    <div className="h-full w-full bg-transparent flex items-center justify-center p-3">
      <div className="relative w-full h-full">
        {/* Compact card */}
        <div className="absolute inset-0 rounded-xl bg-black text-white shadow-xl overflow-hidden">
          {/* Close */}
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 text-gray-400 hover:text-white cursor-pointer"
            aria-label="Close voice bot"
          >
            <X size={16} />
          </button>

          {/* Content */}
          <div className="h-full w-full flex items-center gap-3 pl-4 pr-4">
            {/* Simple spinner/avatar */}
            <div className="hidden sm:flex items-center justify-center">
              <div className={`h-10 w-10 rounded-full bg-gradient-to-br from-cyan-200 via-blue-400 to-blue-800 ${
                isRecording ? "animate-pulse" : "opacity-80"
              }`} />
            </div>

            <div className="flex-1">
              <div className="text-sm font-semibold">Need help?</div>
              <div className="text-[11px] text-gray-300">Ask anything</div>
            </div>

            {isConnected ? (
              <button
                onClick={handleEndCall}
                className="flex items-center gap-2 bg-red-600 text-white text-sm px-3 py-2 rounded-md cursor-pointer hover:bg-red-500"
              >
                <PhoneOff className="h-4 w-4" />
                End
              </button>
            ) : (
              <button
                onClick={handleStartCall}
                className="flex items-center gap-2 bg-white text-gray-900 text-sm px-3 py-2 rounded-md cursor-pointer hover:bg-gray-100"
              >
                <Mic className="h-4 w-4" />
                Ask anything
              </button>
            )}
          </div>

          {/* Footer credit */}
          <div className="absolute left-0 right-0 bottom-1 text-[10px] text-gray-400 text-center">
            Powered by ElevenLabs Agents
          </div>
        </div>
      </div>
    </div>
  );
}

