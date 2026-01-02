import { useEffect, useState } from "react";
import type { Conversation } from "../../../types";
import { BACKEND_URL } from "../../../lib/utils";
import { useParams } from "react-router-dom"
import ChatHistoryPanel from "./ChatHistoryPanel";


export default function ChatHistory() {
  const { domainName } = useParams<{ domainName: string }>();
  const [conversation, setConversations] = useState<Conversation[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)

  const allConversations = async() => {
    try{
        const response = await fetch(`${BACKEND_URL}/domain/chat-history/${domainName}`, {
            method: "GET",
            headers: {
                "Content-type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        });
        if(!response.ok) throw new Error("Failed to get the conversations")
        const data = await response.json()
        setConversations(data.history)
        console.log(data)
    } catch(e){
        console.log(e)
    }
  }
  useEffect(() => {
    allConversations()
  }, [])

  return (
    <div className="min-h-[calc(100vh-75px)] text-black p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-3xl font-semibold">Chatbot Conversations</p>
            <p className="text-gray-500 text-md mt-1">Manage all chatbot conversation history</p>
          </div>
        </div>

        {/* Header Row */}
        <div className="grid grid-cols-4 gap-4 py-3 text-sm font-medium text-gray-700 border-b border-gray-300 mt-4">
            <div>Id</div>
            <div>Email</div>
            <div>Rating</div>
            <div>Messages</div>
        </div>

        {/* Domain Rows */}
        <div className="mt-2 overflow-hidden">
            <div className="space-y-2">
              {conversation.map((a) => (
                
                <div
                  key={a._id}
                  className="grid grid-cols-4 gap-4 items-center py-1 bg-white"
                >
                  {/* ID */}
                  <div className="text-sm text-gray-500">
                    {a._id}
                  </div>

                  {/* Name + Avatar */}
                  <div className="flex items-center gap-3">
                    <div className="text-sm">
                      {a.email
                        .split(" ")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() +
                            word.slice(1).toLowerCase()
                        )
                        .join(" ")}
                    </div>
                  </div>

                  {/* Created by */}
                  <div className="text-sm text-green-500 font-semibold">
                    <span
                      className={
                        a.rating === 5
                          ? "text-green-500"
                          : a.rating >= 3
                          ? "text-blue-500"
                          : "text-red-500"
                      }
                    >
                      {a.rating}
                    </span>
                  </div>

                  {/* Messages */}
                  <div className="text-sm text-gray-500">
                    <button onClick={() => setSelectedConversationId(a._id)}
                        className="px-3 py-2 bg-black text-white rounded-md hover:brightness-80 hover:cursor-pointer"
                        >
                        <span className="text-sm">View Messages</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
      </div>

      {/* Render ChatHistoryPanel only for the selected conversation */}
      {selectedConversationId && conversation.find(c => c._id === selectedConversationId) && (
        <ChatHistoryPanel
          conversation={conversation.find(c => c._id === selectedConversationId)!} 
          domain={domainName || ""} 
          onClose={() => setSelectedConversationId(null)} 
        />
      )}
    </div>
  );
}
