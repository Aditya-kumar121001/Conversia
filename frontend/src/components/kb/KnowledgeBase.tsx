import CreateKB from "./CreateKB";
import { useEffect, useState } from "react";
import type { KnowledgeBaseEntry } from "../../types";
import { BACKEND_URL } from "../../lib/utils";

export default function KnowledgeBase() {
  const [kbPanel, setKbPanel] = useState(false);
  const [kbEntries, setKbEntries] = useState<KnowledgeBaseEntry[]>([]);

  const files = kbEntries.flatMap((kb) => kb.fileIds ?? []);

  const handleAddKB = (entry: KnowledgeBaseEntry) => {
    setKbEntries((prev) => [entry, ...prev]);
  };

  const fetchKbs = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/kb/all-kb`, {
        method: "GET",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch KBs");

      const data = await response.json();
      console.log("API KBs:", data.KBs);
      setKbEntries(data.KBs);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchKbs();
  }, []);

  return (
    <div
      className="min-h-screen text-black p-8"
      style={{ minHeight: "calc(100vh - 75px)" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-3xl font-semibold">Knowledge Base</p>
            <p className="text-gray-500 mt-1">
              Manage knowledge bases and uploaded documents
            </p>
          </div>

          <button
            onClick={() => setKbPanel(true)}
            className="px-3 py-2 bg-black text-white rounded-md hover:brightness-80"
          >
            <span className="text-sm">+ New Knowledge Base</span>
          </button>

          {kbPanel && (
            <CreateKB onClose={() => setKbPanel(false)} onAddKB={handleAddKB} />
          )}
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-5 gap-4 py-3 text-sm font-medium text-gray-700 border-b border-gray-300">
          <div>ID</div>
          <div>File Name</div>
          <div>Type</div>
          <div>Uploaded On</div>
          <div>Status</div>
        </div>

        {/* KB Rows */}
        <div className="divide-y divide-gray-200">
          {files.length === 0 ? (
            <div className="py-6 text-center text-gray-500 text-sm">
              No files found in knowledge base.
            </div>
          ) : (
            files.map((file) => (
              <div
                key={file._id}
                className="grid grid-cols-5 gap-4 py-4 text-sm items-center hover:bg-gray-50"
              >
                {/* File ID */}
                <div className="truncate text-gray-600">
                  {file._id.slice(0, 8)}…
                </div>

                {/* File Name */}
                <div className="font-medium text-gray-900">{file.fileName}</div>

                {/* File Type */}
                <div className="text-gray-600">{file.fileType}</div>

                {/* Uploaded At */}
                <div className="text-gray-600">
                  {new Date(file.createdAt).toLocaleDateString()}
                </div>

                {/* Status */}
                <div>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      file.status === "processed"
                        ? "bg-green-100 text-green-700"
                        : file.status === "processing"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {file.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-8 text-slate-500 text-sm">
          Tip: You can reuse a knowledge base across multiple bots.
        </div>
      </div>
    </div>
  );
}
