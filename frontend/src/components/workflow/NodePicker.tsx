/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { CONVERSIA_NODES } from "./nodes/node-registry";

export function NodePicker({ onSelect }: { onSelect: (type: string) => void }) {
    const [query, setQuery] = useState("");
  
    const grouped = Object.values(CONVERSIA_NODES).reduce(
      (acc: any, node: any) => {
        const group = node.description.group;
        if (!acc[group]) acc[group] = [];
        acc[group].push(node);
        return acc;
      },
      {}
    );
  
    return (
      <div className="w-[320px] flex-1 bg-white h-full p-4 overflow-y-auto">
        <input
          placeholder="Search nodes..."
          className="w-full mb-4 px-3 py-2 border rounded-md text-sm"
          onChange={(e) => setQuery(e.target.value.toLowerCase())}
        />
  
        {Object.entries(grouped).map(([group, nodes]: any) => (
          <div key={group} className="mb-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
              {group}
            </h4>
  
            {nodes
              .filter((n: any) =>
                n.description.displayName.toLowerCase().includes(query)
              )
              .map((n: any) => (
                <button
                  key={n.description.type}
                  onClick={() => onSelect(n.description.type)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100"
                >
                  <div className="text-sm font-medium">
                    {n.description.displayName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {n.description.description}
                  </div>
                </button>
              ))}
          </div>
        ))}
      </div>
    );
  }
  