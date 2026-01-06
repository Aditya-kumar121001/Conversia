"use client";

import { useState } from "react";
import { BACKEND_URL } from "../../lib/utils";
import { ACCEPTED_FILE_TYPES, ACCEPTED_FILE_EXTENSIONS } from '../../types'

import type { KnowledgeBaseEntry } from '../../types'

export default function CreateKB({ 
  onClose, 
  onAddKB 
}: { 
  onClose: () => void;
  onAddKB: (entry: KnowledgeBaseEntry) => void;
}) {
  const [mode, setMode] = useState<"file" | "url">("file");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const getFileType = (fileName: string): string => {
    const extension = fileName.substring(fileName.lastIndexOf(".")).toLowerCase();
    if (extension === ".pdf") return "pdf";
    if (extension === ".doc" || extension === ".docx") return "doc";
    if (extension === ".txt" || extension === ".md") return "text";
    if (extension === ".xls" || extension === ".xlsx") return "excel";
    return "document";
  };

  const addKB = async () => {
    setIsLoading(true);
    setError("");

    try {
      if (mode === "file") {
        if (!file) {
          setError("Please select a file");
          setIsLoading(false);
          return;
        }

        // Upload file
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", getFileType(file.name));

        const response = await fetch(`${BACKEND_URL}/kb/create-kb`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: "Failed to upload file" }));
          throw new Error(errorData.message || "Failed to upload file");
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
            Authorization: `Bearer ${localStorage.getItem("token")}`
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

  const getTypeDisplayName = (type: string): string => {
    const typeMap: { [key: string]: string } = {
      "pdf": "PDF",
      "doc": "DOC",
      "docx": "DOCX",
      "text": "Text",
      "md": "Markdown",
      "excel": "Excel",
      "xls": "Excel",
      "xlsx": "Excel",
      "url": "URL"
    };
    return typeMap[type.toLowerCase()] || type.toUpperCase();
  };

  const generateTempId = (): string => {
    return `KB${Date.now()}`;
  };

  const handleSubmit = async () => {
    // Create entry with processing status immediately
    const tempId = generateTempId();
    const today = new Date().toISOString().split('T')[0];
    
    let newEntry: KnowledgeBaseEntry;
    
    if (mode === "file" && file) {
      const fileType = getFileType(file.name);
      newEntry = {
        id: tempId,
        source: file.name,
        type: getTypeDisplayName(fileType),
        createdOn: today,
        status: "Processing",
      };
    } else if (mode === "url" && url.trim()) {
      newEntry = {
        id: tempId,
        source: url.trim(),
        type: "URL",
        createdOn: today,
        status: "Processing",
      };
    } else {
      return;
    }

    // Add to parent component immediately
    onAddKB(newEntry);
    
    // Close modal
    onClose();

    // Continue with API call in background
    const result = await addKB();
    if (!result?.success) {
      console.error("Failed to upload:", result?.error);
    }
  };

  const isFormValid = mode === "file" ? file !== null : url.trim() !== "";

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
                  mode === "file"
                    ? "bg-black text-white"
                    : "bg-white text-black border-gray-300 hover:bg-gray-100"
                } transition-colors`}
                onClick={() => {
                  setMode("file");
                  setError("");
                }}
                disabled={isLoading}
              >
                Upload File
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

            {mode === "file" ? (
              <div className="w-full">
                <p className="mb-1 text-center md:text-left">Upload File</p>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.md,.xls,.xlsx"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0];
                    if (selectedFile) {
                      // Check file type
                      const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf(".")).toLowerCase();
                      const isValidType = ACCEPTED_FILE_TYPES.includes(selectedFile.type) || 
                                         ACCEPTED_FILE_EXTENSIONS.some(ext => fileExtension === ext);
                      
                      if (!isValidType) {
                        setError(`Please select a valid document file. Supported formats: PDF, DOC, DOCX, TXT, MD, XLS, XLSX`);
                        setFile(null);
                        return;
                      }
                      
                      // Check file size (max 50MB)
                      const maxSize = 50 * 1024 * 1024; // 50MB
                      if (selectedFile.size > maxSize) {
                        setError("File size must be less than 50MB");
                        setFile(null);
                        return;
                      }
                      
                      setFile(selectedFile);
                      setError("");
                    }
                  }}
                  className="block w-full text-sm border border-gray-300 rounded-md py-2 px-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors duration-200 file:rounded-md file:border-0 file:py-1 file:px-4 file:bg-gray-700 file:text-white file:font-semibold file:cursor-pointer"
                  disabled={isLoading}
                />
                {file && (
                  <p className="text-xs text-gray-600 mt-2">
                    Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1 italic">
                  Upload a document file (PDF, DOC, DOCX, TXT, MD, XLS, XLSX) to add to the knowledge base
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
