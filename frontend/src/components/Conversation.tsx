import { useState, useMemo, useEffect } from "react";
import { BACKEND_URL } from "../lib/utils";

interface Agent{
    id: string,
    userId: string,
    agentId: string,
    agentType: string,
    agentSubType?: string,
    createdAt: string,
    createdBy: string
}

export default function Conversation() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [query, setQuery] = useState("");
    const [sortDesc, setSortDesc] = useState(true);
    const [searchFocused, setSearchFocused] = useState(false);
  
    const filtered = useMemo(() => {
      const q = query.trim().toLowerCase();
      let list = agents.filter((a) => {
        if (!q) return true;
        return (
          a.agentType.toLowerCase().includes(q) ||
          a.createdBy.toLowerCase().includes(q) ||
          new Date(a.createdAt).toLocaleString().toLowerCase().includes(q)
        );
      });
  
      list = list.sort((x, y) => {
        const xTime = new Date(x.createdAt).getTime();
        const yTime = new Date(y.createdAt).getTime();
        if (sortDesc) return yTime - xTime;
        return xTime - yTime;
      });
  
      return list;
    }, [agents, query, sortDesc]);
  
    function deleteAgent(id: string) {
      if (!confirm("Delete this agent?")) return;
      setAgents((s) => s.filter((a) => a.id !== id));
    }

    useEffect(()=> {
        const conversation = async () => {
            try{
                const response = await fetch(`${BACKEND_URL}/agent/conversations`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                });
                if(!response.ok){
                    console.error(`Failed to fetch: ${response.statusText}`)
                    return 
                }
                const data:Agent[] = await response.json()
    
                setAgents(data)
            } catch(e){
                console.log("Unable to get conversations", e)
            }
        }
        conversation()
    }, [])

  return (
    <div className="min-h-screen text-black p-8" style={{ minHeight: "calc(100vh - 75px)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-3xl font-semibold">Call Histroy</p>
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
                  onFocus={() => setSearchFocused(false)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Search agents..."
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
              Showing {filtered.length} agents
            </div>
          </div>

          {/* Header Row */}
          <div className="grid grid-cols-3 gap-4 px-5 py-3 text-sm font-medium text-gray-700 border-b border-gray-300 mt-4">
            <div>Name</div>
            <div>Duration</div>
            <div>Messages</div>
          </div>

          {/* Agent Rows */}
          <div className="mt-2 overflow-hidden">
            <div className="space-y-2">
              {filtered.map((a) => (
                <div
                  key={a.agentId}
                  className="grid grid-cols-3 items-center p-4 bg-white rounded-md hover:bg-gray-200"
                >
                  {/* Name + Avatar */}
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-gray-900 flex items-center justify-center text-white font-semibold">
                      {a.agentSubType
                        ? a.agentSubType
                            .split(" ")
                            .slice(0, 2)
                            .map((p: string) => p[0])
                            .join("")
                        : "AG"}
                    </div>
                    <div>
                      <div className="font-medium">{a.agentSubType || "Agent"}</div>
                    </div>
                  </div>

                  {/* Created by */}
                  <div className="text-sm text-gray-500">{a.userId}</div>

                  {/* Created on + 3 dots */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div>{a.createdAt.toLocaleString()}</div>
                    <span
                      className="text-gray-600 text-xl cursor-pointer hover:text-black"
                      onClick={() => deleteAgent(a.id)}
                    >
                      ⋮
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 text-slate-500 text-sm">
          Tip: Use the search bar to quickly find agents by name, creator, or
          date.
        </div>
      </div>
    </div>
  )
}
