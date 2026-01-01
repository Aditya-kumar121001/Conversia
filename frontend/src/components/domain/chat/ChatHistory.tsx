import {useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTenant } from "../../../context/Context";

export default function ChatHistory() {
  //const [numConversation, setNumConversation] = useState(0)
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useNavigate();

  // Use useTenant() context hook to access domains
  const { domains } = useTenant();

  return (
    <div
      className="min-h-screen text-black p-8"
      style={{ minHeight: "calc(100vh - 75px)" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-3xl font-semibold">Chat History</p>
            <p className="text-gray-500 mt-1">Manage all chat history</p>
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
                  placeholder="Search conversation..."
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
              Showing {domains.length} domains
            </div>
          </div>

          {/* Header Row */}
          <div className="grid grid-cols-3 gap-4 py-3 text-sm font-medium text-gray-700 border-b border-gray-300 mt-4">
            <div>Domain</div>
            <div>Created On</div>
            <div>Last Updated</div>
          </div>

          {/* Domain Rows */}
          <div className="mt-2 overflow-hidden">
            <div className="space-y-2">
              {domains.map((a) => (
                <div
                  key={a.domainId}
                  className="grid grid-cols-3 gap-4 py-3 items-center p-3 bg-white rounded-md hover:bg-gray-200 cursor-pointer"
                  onClick={() =>
                    navigate(`/${a.domainName}/chat-history`, {
                        state: {
                          domain: a.domainName,
                        },
                      })
                  }
                >
                  {/* Name + Avatar */}
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-gray-900 flex items-center justify-center text-white font-semibold">
                    {a.domainName
                        ? a.domainName.slice(0,2).toUpperCase()
                        : "C" }
                    </div>
                    <div className="font-medium">
                      {a.domainName
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
                  <div className="text-sm text-gray-500">
                    {a.createdAt.toString()}
                  </div>

                  {/* Updated on */}
                  <div className="text-sm text-gray-500">
                    {a.updatedAt.toString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 text-slate-500 text-sm">
          Tip: Use the search bar to quickly find conversations by name,
          creator, or date.
        </div>
      </div>
    </div>
  );
}
