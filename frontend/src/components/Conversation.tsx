import { useState, useMemo, useEffect } from "react";
import { BACKEND_URL } from "../lib/utils";
import ConversationWizard from "./conversationWizard";

interface Conversation {
  agentId: string;
  agentName: string;
  conversationId: string;
  startTimeUnixSecs: number;
  callDurationSecs: number;
  messageCount: number;
  status: string;
  callSuccessful: string;
  callSummaryTitle: string;
}

export default function Conversation() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [query, setQuery] = useState("");
  const sortDesc = true;
  const [searchFocused, setSearchFocused] = useState(false);
  const [showConversationWizard, setShowConversationWizard] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);

  // Filtering + sorting
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = conversations.filter((c) => {
      if (!q) return true;
      return (
        c.agentName.toLowerCase().includes(q) ||
        c.callSummaryTitle.toLowerCase().includes(q) ||
        new Date(c.startTimeUnixSecs * 1000)
          .toLocaleString()
          .toLowerCase()
          .includes(q)
      );
    });

    list = list.sort((x, y) => {
      const xTime = new Date(x.startTimeUnixSecs * 1000).getTime();
      const yTime = new Date(y.startTimeUnixSecs * 1000).getTime();
      return sortDesc ? yTime - xTime : xTime - yTime;
    });

    return list;
  }, [conversations, query, sortDesc]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/agent/conversations`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) {
          console.error(`Failed to fetch: ${response.statusText}`);
          return;
        }
        const data = await response.json();
        console.log("Conversations:", data);
        setConversations(data.data); // backend already returns flat array
      } catch (e) {
        console.log("Unable to get conversations", e);
      }
    };
    fetchConversations();
  }, []);

  const handleOpen = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setShowConversationWizard(true);
  };

  return (
    <div
      className="min-h-screen text-black p-8"
      style={{ minHeight: "calc(100vh - 75px)" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-3xl font-semibold">Call History</p>
            <p className="text-gray-500 mt-1">
              View and search your call history with AI agents
            </p>
          </div>
        </div>

        <div className="bg-white rounded-md py-2">
          {/* Search + Counter */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Search conversations..."
                  className={`w-full rounded-md bg-white border ${
                    searchFocused
                      ? "border-black"
                      : "border-[0.5] border-slate-400"
                  } px-3 py-2 placeholder-slate-500 text-gray-700`}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-5 absolute right-3 top-3 text-slate-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.9 14.32a8 8 0 111.414-1.414l3.387 3.387a1 1 0 01-1.414 1.414l-3.387-3.387zM8 14a6 6 0 100-12 6 6 0 000 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>

            <div className="text-sm text-slate-500">
              Showing {filtered.length} conversations
            </div>
          </div>

          {/* Header Row */}
          <div className="w-full grid grid-cols-4 gap-4 px-5 py-3 text-sm font-medium text-gray-700 border-b border-gray-300 mt-4">
            <div className="flex items-center">Agent</div>
            <div className="flex items-center justify-center">Duration</div>
            <div className="flex items-center justify-center">Messages</div>
            <div className="flex items-center justify-center">Status</div>
          </div>

          {/* Conversation Rows */}
          <div className="mt-2 overflow-hidden">
            <div className="space-y-2">
              {filtered.map((c) => (
                <div
                  key={c.conversationId}
                  className="grid grid-cols-4 items-center p-4 bg-white rounded-md hover:bg-gray-200 cursor-pointer"
                  onClick={() => handleOpen(c.conversationId)}
                >
                  {/* Agent */}
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-gray-900 flex items-center justify-center text-white font-semibold">
                      {c.agentName
                        .split(" ")
                        .slice(0, 2)
                        .map((p) => p[0])
                        .join("")}
                    </div>
                    <div className="font-medium">{c.agentName}</div>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center justify-center text-sm text-gray-700">
                    {c.callDurationSecs}s
                  </div>

                  {/* Messages */}
                  <div className="flex items-center justify-center text-sm text-gray-700">
                    {c.messageCount}
                  </div>

                  {/* status */}
                  <div className="flex items-center justify-center text-sm text-gray-700">
                    <div className="py-1 px-2 rounded-md bg-gray-900 flex items-center justify-center text-white">
                      {c.status.toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}
              {showConversationWizard && selectedConversationId && (
                <ConversationWizard
                  onClose={() => setShowConversationWizard(false)}
                  conversationId={selectedConversationId}
                  agentName={conversation.agentName}
                />
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 text-slate-500 text-sm">
          Tip: Use the search bar to quickly find conversations by agent,
          summary, or date.
        </div>
      </div>
    </div>
  );
}
