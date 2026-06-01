"use client";

import { useState, useEffect, useCallback } from "react";
import { useConversation } from "@elevenlabs/react";
import { X, Mic, PhoneOff, Loader2, AlertCircle } from "lucide-react";
import { useLocation } from "react-router-dom";
import { BACKEND_URL } from "../lib/utils";

type VoiceBotStatus = "loading" | "idle" | "connecting" | "connected" | "error";

interface VoiceBotConfig {
  elevenlabsAgentId: string;
  generalSettings?: {
    firstMessage?: string;
  };
}

export default function VoiceBotPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const domainName = params.get("domain") || "customer";

  const [status, setStatus] = useState<VoiceBotStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [botConfig, setBotConfig] = useState<VoiceBotConfig | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const conversation = useConversation({
    onConnect: () => {
      console.log("ElevenLabs voice session connected");
      setStatus("connected");
    },
    onDisconnect: () => {
      console.log("ElevenLabs voice session disconnected");
      setStatus("idle");
    },
    onMessage: (message) => {
      console.log("ElevenLabs message:", message);
    },
    onError: (error) => {
      console.error("ElevenLabs error:", error);
      setErrorMessage("Voice session error. Please try again.");
      setStatus("error");
    },
  });

  // Track agent speaking state from the conversation hook
  useEffect(() => {
    setIsSpeaking(conversation.isSpeaking);
  }, [conversation.isSpeaking]);

  // Fetch voice bot config on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const resp = await fetch(
          `${BACKEND_URL}/bot/metadata/${encodeURIComponent(domainName)}/voice`
        );
        if (!resp.ok) {
          throw new Error("Voice bot not found for this domain");
        }
        const data = await resp.json();
        if (!data.success || !data.bot) {
          throw new Error("Voice bot not configured for this domain");
        }
        const bot = data.bot;
        if (!bot.elevenlabsAgentId) {
          throw new Error(
            "Voice agent not provisioned. Please contact the site owner."
          );
        }
        setBotConfig({
          elevenlabsAgentId: bot.elevenlabsAgentId,
          generalSettings: bot.generalSettings,
        });
        setStatus("idle");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load voice bot";
        console.error("Failed to fetch voice bot config:", msg);
        setErrorMessage(msg);
        setStatus("error");
      }
    };

    fetchConfig();
  }, [domainName]);

  const handleStartCall = useCallback(async () => {
    if (!botConfig?.elevenlabsAgentId) {
      setErrorMessage("Voice agent not configured");
      setStatus("error");
      return;
    }

    try {
      setStatus("connecting");

      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start the ElevenLabs conversation session
      await conversation.startSession({
        agentId: botConfig.elevenlabsAgentId,
        connectionType: "webrtc",
      });
    } catch (err: unknown) {
      console.error("Failed to start voice call:", err);
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setErrorMessage("Microphone permission is required for voice calls");
      } else {
        const msg = err instanceof Error ? err.message : "Failed to start call";
        setErrorMessage(msg);
      }
      setStatus("error");
    }
  }, [conversation, botConfig]);

  const handleEndCall = useCallback(async () => {
    try {
      await conversation.endSession();
    } catch (err) {
      console.error("Failed to end voice call:", err);
    }
    setStatus("idle");
  }, [conversation]);

  const handleClose = () => {
    if (status === "connected" || status === "connecting") {
      handleEndCall();
    }
    // Send message to parent to close iframe
    if (window.parent && window.parent !== window) {
      window.parent.postMessage("close-voicebot", window.location.origin);
    }
  };

  const handleRetry = () => {
    setErrorMessage("");
    setStatus("loading");
    // Re-trigger config fetch
    window.location.reload();
  };

  // Determine the pulsing animation based on speaking state
  const avatarClasses = `h-10 w-10 rounded-full bg-gradient-to-br from-cyan-200 via-blue-400 to-blue-800 ${
    status === "connected"
      ? isSpeaking
        ? "animate-pulse"
        : "opacity-90"
      : status === "connecting"
      ? "animate-spin"
      : "opacity-80"
  }`;

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
            {/* Avatar / indicator */}
            <div className="hidden sm:flex items-center justify-center">
              <div className={avatarClasses} />
            </div>

            <div className="flex-1">
              {status === "loading" ? (
                <>
                  <div className="text-sm font-semibold">Loading...</div>
                  <div className="text-[11px] text-gray-300">
                    Setting up voice agent
                  </div>
                </>
              ) : status === "error" ? (
                <>
                  <div className="text-sm font-semibold text-red-400 flex items-center gap-1">
                    <AlertCircle size={14} />
                    Error
                  </div>
                  <div className="text-[11px] text-gray-300 truncate max-w-[160px]">
                    {errorMessage}
                  </div>
                </>
              ) : status === "connected" ? (
                <>
                  <div className="text-sm font-semibold">
                    {isSpeaking ? "Agent speaking..." : "Listening..."}
                  </div>
                  <div className="text-[11px] text-gray-300">
                    Voice session active
                  </div>
                </>
              ) : status === "connecting" ? (
                <>
                  <div className="text-sm font-semibold">Connecting...</div>
                  <div className="text-[11px] text-gray-300">
                    Starting voice session
                  </div>
                </>
              ) : (
                <>
                  <div className="text-sm font-semibold">Need help?</div>
                  <div className="text-[11px] text-gray-300">Ask anything</div>
                </>
              )}
            </div>

            {/* Action button */}
            {status === "loading" ? (
              <div className="flex items-center gap-2 text-gray-400 text-sm px-3 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : status === "error" ? (
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 bg-white text-gray-900 text-sm px-3 py-2 rounded-md cursor-pointer hover:bg-gray-100"
              >
                Retry
              </button>
            ) : status === "connected" || status === "connecting" ? (
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
