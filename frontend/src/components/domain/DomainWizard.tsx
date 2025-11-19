"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../../lib/utils";

export default function DomainWizard({ onClose, onSuccess }: { onClose: () => void; onSuccess?: () => void }) {
  const [domainName, setDomainName] = useState<string>("");
  const [domainUrl, setDomainUrl] = useState<string>("");
  const [logoFile, setLogoFile] = useState<string>("/domainLogo.svg")

  const navigate = useNavigate();

  const addDomain = async () => {
    const body = {
      domainName: domainName,
      domainUrl: domainUrl,
      domainImageUrl: logoFile
    }
    const response = await fetch(`${BACKEND_URL}/domain/new-domain` ,{
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data;
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
              Add your business domain
            </p>
            <p className="text-sm text-gray-600 mb-6 text-center">
              Add your business domain url to integrate bots
            </p>
          </div>

          <div className="flex flex-col gap-1 w-full">
            <div>
              <p className="mb-1 text-center md:text-left">Domain Name:</p>
              <input
                type="text"
                placeholder="Domain name"
                value={domainName}
                onChange={(e) => {
                  setDomainName(e.target.value);
                }}
                className="w-full border px-4 py-2 rounded-lg mb-4"
              />
            </div>
            <div>
              <p className="mb-1 text-center md:text-left">Domain Url:</p>
              <input
                type="text"
                placeholder="Domain Url"
                value={domainUrl}
                onChange={(e) => {
                  setDomainUrl(e.target.value);
                }}
                className="w-full border px-4 py-2 rounded-lg mb-4"
              />
            </div>
            <div>
              <p className="mb-1 text-center md:text-left">Domain Logo:</p>
              <input
                type="file"
                className="block w-full text-sm border border-gray-300 rounded-md py-2 px-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors duration-200 file:rounded-md file:border-0 file:py-1 file:px-4 file:bg-gray-700 file:text-white file:font-semibold file:cursor-pointer"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      setLogoFile(event.target?.result as string);
                    };
                    reader.readAsDataURL(e.target.files[0]);
                  }
                }}
              />
              {logoFile && (
                <img
                  src={logoFile}
                  alt="Logo preview"
                  className="max-h-64 mt-2 max-w-full rounded shadow border"
                />
              )}
              <p className="text-xs text-gray-500 mt-3 italic">
                Upload your brand logo or avatar&nbsp;
                <span className="text-gray-400">(PNG, JPG, SVG)</span>
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-center w-full">
            <button 
             onClick={
                async () => {
                  const domainData = await addDomain();
                  if(!domainData) return;

                  if (onSuccess) {
                    onSuccess();
                  }

                  navigate(`/domain/${domainUrl}`, {
                    state: {
                      domainName: domainName,
                      domainUrl: domainUrl,
                      domainImageUrl: logoFile,
                    }
                  })
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
