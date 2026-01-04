"use client";

import { useState } from "react";
import { BACKEND_URL } from "../../lib/utils";

export default function CreateKB({ onClose }: { onClose: () => void; }) {
  const [mode, setMode] = useState<"pdf" | "url">("pdf");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const addKB = async () => {
    setIsLoading(true);
    setError("");

    try {
      if (mode === "pdf") {
        if (!pdfFile) {
          setError("Please select a PDF file");
          setIsLoading(false);
          return;
        }

        // Upload PDF file
        const formData = new FormData();
        formData.append("file", pdfFile);
        formData.append("type", "pdf");

        const response = await fetch(`${BACKEND_URL}/kb/upload`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: "Failed to upload PDF" }));
          throw new Error(errorData.message || "Failed to upload PDF");
        }

        const data = await response.json();
        return { success: true, data };
      } else {
        // Add URL
        if (!url || !url.trim()) {
          setError("Please enter a valid URL");
          setIsLoading(false);
          return;
        }

        // Validate URL format
        try {
          new URL(url);
        } catch {
          setError("Please enter a valid URL format (e.g., https://example.com)");
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${BACKEND_URL}/kb/add-url`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: url.trim(),
            type: "url",
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: "Failed to add URL" }));
          throw new Error(errorData.message || "Failed to add URL");
        }

        const data = await response.json();
        return { success: true, data };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    const result = await addKB();
    if (result?.success) {
      onClose();
      // Optionally refresh the knowledge base list
      window.location.reload();
    }
  };

  const isFormValid = mode === "pdf" ? pdfFile !== null : url.trim() !== "";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl p-8 relative">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-black cursor-pointer"
          onClick={onClose}
          disabled={isLoading}
        >
          ✕
        </button>
        <div className="flex flex-col">
          <div className="w-full flex flex-col items-center justify-center">
            <p className="text-xl font-bold text-black text-center">
              Add your knowledge base
            </p>
            <p className="text-sm text-gray-600 mb-6 text-center">
              Add documents or link to external resources to enrich your knowledge base.
            </p>
          </div>

          <div className="flex flex-col gap-1 w-full">
            <div className="flex flex-row gap-2 mb-4 w-full">
              <button
                type="button"
                className={`w-full px-4 py-2 rounded-md font-medium border ${
                  mode === "pdf"
                    ? "bg-black text-white"
                    : "bg-white text-black border-gray-300 hover:bg-gray-100"
                } transition-colors`}
                onClick={() => {
                  setMode("pdf");
                  setError("");
                }}
                disabled={isLoading}
              >
                Upload PDF
              </button>
              <button
                type="button"
                className={`w-full px-4 py-2 rounded-md font-medium border ${
                  mode === "url"
                    ? "bg-black text-white"
                    : "bg-white text-black border-gray-300 hover:bg-gray-100"
                } transition-colors`}
                onClick={() => {
                  setMode("url");
                  setError("");
                }}
                disabled={isLoading}
              >
                Add By URL
              </button>
            </div>

            {mode === "pdf" ? (
              <div className="w-full">
                <p className="mb-1 text-center md:text-left">Upload PDF</p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.type !== "application/pdf") {
                        setError("Please select a valid PDF file");
                        return;
                      }
                      setPdfFile(file);
                      setError("");
                    }
                  }}
                  className="block w-full text-sm border border-gray-300 rounded-md py-2 px-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors duration-200 file:rounded-md file:border-0 file:py-1 file:px-4 file:bg-gray-700 file:text-white file:font-semibold file:cursor-pointer"
                  disabled={isLoading}
                />
                {pdfFile && (
                  <p className="text-xs text-gray-600 mt-2">
                    Selected: {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1 italic">
                  Upload a PDF document to add to the knowledge base
                </p>
              </div>
            ) : (
              <div className="w-full">
                <p className="mb-1 text-center md:text-left">Add URL</p>
                <input
                  type="text"
                  placeholder="https://example.com/resource"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setError("");
                  }}
                  className="w-full border px-4 py-2 rounded-lg mb-2"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1 italic">
                  Provide a URL to add to the knowledge base
                </p>
              </div>
            )}

            {error && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-center w-full">
            <button
              onClick={handleSubmit}
              disabled={!isFormValid || isLoading}
              className="bg-black text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-gray-800 transition-colors"
            >
              {isLoading ? "Creating..." : "Create Knowledge Base"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
