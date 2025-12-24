import { useState } from 'react';
import { useNavigate } from "react-router-dom";

export interface Workflow{
    type: "chat" | "voice"
}

export default function Workflow() {
  const sortDesc = true;
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useNavigate();
  
  return (
    <div
      className="min-h-screen text-black p-8"
      style={{ minHeight: "calc(100vh - 75px)" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-3xl font-semibold">Workflows</p>
            <p className="text-gray-500 mt-1">
              Create and manage your workflows
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/workflow/createWorkflow")}
              className="px-3 py-2 bg-black text-white rounded-md hover:brightness-80 hover:cursor-pointer"
            >
              <span className="text-sm">+ New workflow</span>
            </button>
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
              {/* Showing {filtered.length} agents */}
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
              
            </div>
          </div>
        </div>

        <div className="mt-8 text-slate-500 text-sm">
          Tip: Use the search bar to quickly find workflow by name, creator, or date.
        </div>
      </div>
    </div>
  );
}