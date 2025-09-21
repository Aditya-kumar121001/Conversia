import { useEffect, useMemo, useState } from "react";
import NewAgentWizard from "./NewAgentWizard";
import { BACKEND_URL } from "../lib/utils";
import { useNavigate } from "react-router-dom";

export default function Agent() {
  //states
  const sortDesc = true;
  const [agents, setAgents] = useState([]);
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = agents.filter((a) => {
      if (!q) return true;
      return (
        a.agentType.toLowerCase().includes(q) ||
        a.createdBy.toLowerCase().includes(q) ||
        a.createdAt.toLocaleString().toLowerCase().includes(q)
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
    setAgents((s) => s.filter((a) => a.agentId !== id));
  }

  //call all-agent route
  useEffect(() => {
    const allAgents = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/agent/all-agents`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          },
        });
        const agents = await response.json();
        setAgents(agents);
      } catch (err) {
        console.error("Failed to fetch agents", err);
      }
    };
    allAgents();
  }, []);

  return (
    <div className="min-h-screen text-black p-8" style={{ minHeight: "calc(100vh - 75px)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-3xl font-semibold">Agents</p>
            <p className="text-gray-500 mt-1">
              Create and manage your AI agents
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowWizard(true)}
              className="px-3 py-2 bg-black text-white rounded-md hover:brightness-80 hover:cursor-pointer"
            >
              <span className="text-sm">+ New agent</span>
            </button>

            {showWizard && (
              <NewAgentWizard onClose={() => setShowWizard(false)} />
            )}
            
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
            <div>Created by</div>
            <div>Created on</div>
          </div>

          {/* Agent Rows */}
          <div className="mt-2 overflow-hidden">
            <div className="space-y-2">
              {filtered.map((a) => (
                <div
                  key={a.agentId}
                  className="grid grid-cols-3 items-center p-4 bg-white rounded-md hover:bg-gray-200 cursor-pointer"
                  onClick={() => navigate(`/call-agent/${a.agentId}`, { state: { agentId: a.agentId } })}
                >
                  {/* Name + Avatar */}
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-gray-900 flex items-center justify-center text-white font-semibold">
                      {a.agentSubtype
                        ? a.agentSubtype
                            .split(" ")
                            .slice(0, 2)
                            .map((p: string) => p[0])
                            .join("")
                        : "AG"}
                    </div>
                    <div>
                      <div className="font-medium">{a.agentSubtype || a.agentType || "Agent"}</div>
                    </div>
                  </div>

                  {/* Created by */}
                  <div className="text-sm text-gray-500">{`${localStorage.getItem("name")?.slice(0,1).toUpperCase()}${localStorage.getItem("name")?.slice(1)}`}</div>

                  {/* Created on + 3 dots */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div>{a.createdAt.toLocaleString()}</div>
                    <span
                      className="text-gray-600 text-xl cursor-pointer hover:text-black"
                      onClick={() => deleteAgent(a.agentId)}
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
  );
}