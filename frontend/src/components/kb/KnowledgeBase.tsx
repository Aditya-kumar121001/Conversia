import CreateKB from "./CreateKB";
import { useState } from "react";
import type { KnowledgeBaseEntry } from '../../types'

const initialKbEntries: KnowledgeBaseEntry[] = [
  {
    id: "KB001",
    source: "HR_Policy_Doc.pdf",
    type: "PDF",
    createdOn: "2024-06-20",
    status: "Processed",
  },
  {
    id: "KB002",
    source: "EmployeeHandbook.docx",
    type: "DOCX",
    createdOn: "2024-05-14",
    status: "Processing",
  },
  {
    id: "KB003",
    source: "WorkplaceGuidelines.md",
    type: "Markdown",
    createdOn: "2024-04-28",
    status: "Processed",
  },
  {
    id: "KB004",
    source: "FAQ_Sheet.xlsx",
    type: "Excel",
    createdOn: "2024-03-13",
    status: "Failed",
  },
  {
    id: "KB005",
    source: "CompanyPolicies.txt",
    type: "Text",
    createdOn: "2024-02-01",
    status: "Processed",
  },
];


export default function KnowledgeBase() {
  const [kbPanel, setKbPanel] = useState(false);
  const [kbEntries, setKbEntries] = useState<KnowledgeBaseEntry[]>(initialKbEntries);

  const handleAddKB = (entry: KnowledgeBaseEntry) => {
    setKbEntries(prev => [entry, ...prev]);
  };
  
  return (
    <div
      className="min-h-screen text-black p-8"
      style={{ minHeight: "calc(100vh - 75px)" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-3xl font-semibold">Knowledge Base</p>
            <p className="text-gray-500 mt-1">
                Manage knowledge base entries and upload documents
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => {setKbPanel(true)}}
              className="px-3 py-2 bg-black text-white rounded-md hover:brightness-80 hover:cursor-pointer"
            >
              <span className="text-sm">+ New Knowledge Base</span>
            </button>
            {kbPanel && (<CreateKB onClose={() => setKbPanel(false)} onAddKB={handleAddKB} />)}
          </div>
        </div>
        
          {/* Header Row */}
          <div className="grid grid-cols-5 gap-4 py-3 text-sm font-medium text-gray-700 border-b border-gray-300 mt-4">
            <div>Id</div>
            <div>Source</div>
            <div>Type</div>
            <div>Created on</div>
            <div>Status</div>
          </div>

          {/* kb Rows */}
          <div className="mt-2 overflow-hidden">
            <div className="space-y-2">
            {kbEntries.map((a) => (
                <div
                  key={a.id}
                  className="grid grid-cols-5 gap-4 py-2 items-center bg-white rounded-md"
                  onClick={() =>{}}
                >
                  {/* ID */}
                  <div className="text-sm text-gray-500">
                    {a.id}
                  </div>

                  {/* Name */}
                  <div className="flex items-center">
                    <div className="font-medium">
                     {a.source}
                    </div>
                  </div>

                  {/* Created by */}
                  <div className="text-sm text-gray-500">
                    {a.type}
                  </div>

                  {/* Created on */}
                  <div className="text-sm text-gray-500">{a.createdOn.toString()}</div>

                  {/* Status */}
                  <div className={`text-sm ${
                    a.status === "Processed"
                      ? "text-green-600"
                      : a.status === "Failed"
                      ? "text-red-600"
                      : "text-gray-500"
                  }`}>
                    {a.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        <div className="mt-8 text-slate-500 text-sm">
          Tip: Use the search bar to quickly find files by name, creator, or date.
        </div>
      </div>
    </div>
  );
}