"use client";

import { useConversation } from "@elevenlabs/react";
import { useCallback } from "react";
import { Mic, PhoneOff } from "lucide-react";
import { useLocation } from "react-router-dom";


export default function CallAgent() {
   const location = useLocation();
   const agentId = location.state?.agentId;

   const conversation = useConversation({
    onConnect: () => console.log("Connected"),
    onDisconnect: () => console.log("Disconnected"),
    onMessage: (message) => console.log("Message:", message),
    onError: (error) => console.error("Error:", error),
  });

  const startConversation = useCallback(async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("mic is connected");
      // Start the conversation with your agent
      await conversation.startSession({
        agentId: agentId,
        userId: localStorage.getItem("userId"), 
      });
    } catch (error) {
      console.error("Failed to start conversation:", error);
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  return (
    <div className="min-h-screen relative flex items-center justify-center" style={{ minHeight: "calc(100vh - 75px)" }}>
      <div className="w-80 h-80 rounded-full bg-gradient-to-br from-cyan-200 via-blue-400 to-blue-800 animate-pulse blur-sm"></div>

      {conversation.status === "connected" ? (
        // Stop button
        <button
          onClick={stopConversation}
          className="absolute flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-full shadow-lg cursor-pointer hover:scale-105 transition"
        >
          <PhoneOff className="h-5 w-5" />
          <span className="font-medium">End Call</span>
        </button>
      ) : (
        // Start button
        <button
          onClick={startConversation}
          className="absolute flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-lg cursor-pointer hover:scale-105 transition"
        >
          <div className="bg-black text-white p-2 rounded-full flex items-center justify-center">
            <Mic className="h-5 w-5" />
          </div>
          <span className="font-medium text-gray-800">Call AI agent</span>
        </button>
      )}      
    </div>

  );
}
