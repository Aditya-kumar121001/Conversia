import { useState } from "react";
import { Copy } from "lucide-react";

export default function Snippet({ mode, snippet }: { mode: string; snippet: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <div className="bg-white rounded-md p-6 shadow space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-lg font-semibold mb-1">Code Snippet</p>
          <p className="text-sm text-gray-500">
            Paste this into your website to embed the {mode} widget
          </p>
        </div>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
            copied ? "bg-black text-white" : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          {copied ? "Copied" : <>
            <Copy className="h-4 w-4" /> Copy snippet
          </>}
        </button>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <pre className="text-sm text-gray-700 whitespace-pre-wrap break-words">
          <code>{snippet}</code>
        </pre>
      </div>
    </div>
  );
}
