"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../../lib/utils";

export default function CreateKB({ onClose }: { onClose: () => void; }) {
  const [domainName, setDomainName] = useState<string>("");
  const [domainUrl, setDomainUrl] = useState<string>("");

  const navigate = useNavigate();

  const addKB = async () => {
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl p-8 relative">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-black cursor-pointer"
          onClick={onClose}
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
                className={`w-full px-4 py-2 rounded-md font-medium border ${domainUrl === "" ? "bg-black text-white" : "bg-white text-black border-gray-300"} hover:bg-gray-100 transition-colors`}
                onClick={() => setDomainUrl("")}
              >
                Upload PDF
              </button>
              <button
                type="button"
                className={`w-full px-4 py-2 rounded-md font-medium border ${domainUrl !== "" ? "bg-black text-white" : "bg-white text-black border-gray-300"} hover:bg-gray-100 transition-colors`}
                onClick={() => setDomainUrl(" ")}
              >
                Add By URL
              </button>
            </div>
            
            {domainUrl === "" ? (
              <div className="w-full">
                <p className="mb-1 text-center md:text-left">Upload PDF:</p>
                <input
                  type="file"
                  accept=".pdf"
                  className="block w-full text-sm border border-gray-300 rounded-md py-2 px-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors duration-200 file:rounded-md file:border-0 file:py-1 file:px-4 file:bg-gray-700 file:text-white file:font-semibold file:cursor-pointer"
                  // onChange handling as needed
                />
                <p className="text-xs text-gray-500 mt-1 italic">
                  Upload a PDF document to add to the knowledge base
                </p>
              </div>
            ) : (
              <div className="w-full">
                <p className="mb-1 text-center md:text-left">Knowledge Base URL:</p>
                <input
                  type="text"
                  placeholder="https://example.com/resource"
                  value={domainName}
                  onChange={(e) => setDomainName(e.target.value)}
                  className="w-full border px-4 py-2 rounded-lg mb-2"
                />
                <p className="text-xs text-gray-500 mt-1 italic">
                  Provide a URL to add to the knowledge base
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-center w-full">
            <button 
             onClick={
                async () => {
                  const createKB = await addKB();
                  console.log(createKB)
                  onClose();
                }
             }
             disabled={!domainName || !domainUrl}
             className="bg-black text-white px-6 py-2 rounded-lg disabled:opacity-50 cursor-pointer">
              Add Domain
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
