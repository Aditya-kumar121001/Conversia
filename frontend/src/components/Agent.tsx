import { useEffect, useMemo, useState } from "react";
import NewAgentWizard from "./NewAgentWizard";
import { BACKEND_URL } from "../lib/utils";
import { useNavigate } from "react-router-dom";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "./ui/dropdown-menu";
interface Agent {
  agentId: string;
  agentType: string;
  agentSubtype?: string;
  createdBy: string;
  createdAt: string;
  firstMessage?: string;
  prompt?: string;
}

export default function Agent() {
  const sortDesc = true;
  const [agents, setAgents] = useState<Agent[]>([]);
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const navigate = useNavigate();

  // Filtering + sorting
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
      return sortDesc ? yTime - xTime : xTime - yTime;
    });

    return list;
  }, [agents, query, sortDesc]);

  // Delete agent locally
  async function deleteAgent(id: string) {
    if (!confirm("Delete this agent?")) return;
    try {
      const response = await fetch(`${BACKEND_URL}/agent/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to delete agent");
      }
      setAgents((s) => s.filter((a) => a.agentId !== id));
    } catch (err) {
      console.error("Failed to delete agent", err);
      alert("Failed to delete agent. Please try again.");
    }
  }

  // Fetch all agents from backend
  useEffect(() => {
    const allAgents = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/agent/all-agents`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch agents");
        }

        const agents: Agent[] = await response.json();
        console.log("Fetched agents:", agents);
        setAgents(agents);
      } catch (err) {
        console.error("Failed to fetch agents", err);
      }
    };

    allAgents();
  }, []);

  return (
    <div
      className="min-h-screen text-black p-8"
      style={{ minHeight: "calc(100vh - 75px)" }}
    >
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
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Search agents..."
                  className={`w-full rounded-md bg-white border ${
                    searchFocused ? "border-black" : "border-slate-400"
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
                  onClick={() =>
                    navigate(`/call-agent/${a.agentId}`, {
                      state: {
                        agentId: a.agentId,
                        firstMessage: a.firstMessage,
                        prompt: a.prompt,
                      },
                    })
                  }
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
                      <div className="font-medium">
                        {a.agentSubtype || a.agentType || "Agent"}
                      </div>
                    </div>
                  </div>

                  {/* Created by */}
                  <div className="text-sm text-gray-500">
                    {localStorage.getItem("name")
                      ? `${localStorage
                          .getItem("name")!
                          .slice(0, 1)
                          .toUpperCase()}${localStorage
                          .getItem("name")!
                          .slice(1)}`
                      : a.createdBy}
                  </div>

                  {/* Created on + 3 dots */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div>{new Date(a.createdAt).toLocaleString()}</div>

                    {/* three dots and dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <span
                          className="text-gray-600 text-xl cursor-pointer hover:text-black"
                          onClick={(e) => e.stopPropagation()} // prevent navigation
                        >
                          ⋮
                        </span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteAgent(a.agentId);
                          }}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
