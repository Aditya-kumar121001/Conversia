"use client";
import React, { useState } from "react";

export default function NewAgentWizard({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [agentType, setAgentType] = useState<string | null>(null);
  const [config, setConfig] = useState({ name: "", description: "" });

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl p-8 relative">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-sm text-black py-1 px-2 border-1 rounded-full hover:brightness-80 hover:pointer-cursor"
          onClick={onClose}
        >
          ✕
        </button>

        {/* Step 1: Choose agent type */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold mb-2">New Agent</h2>
            <p className="text-gray-600 mb-6">
              What type of agent would you like to create?
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                className={`rounded-xl border p-6 cursor-pointer hover:shadow-lg transition ${
                  agentType === "personal" ? "border-gray-500" : "border-gray-300"
                }`}
                onClick={() => setAgentType("personal")}
              >
                <div className="bg-black text-white inline-block px-3 py-2 rounded-lg text-sm mb-4">
                  Could you see whether I have any urgent emails?
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  A personal assistant that helps manage your daily tasks.
                </p>
                <span className="font-medium">Personal Assistant</span>
              </div>

              <div
                className={`rounded-xl border p-6 cursor-pointer hover:shadow-lg transition ${
                  agentType === "business" ? "border-gray-500" : "border-gray-300"
                }`}
                onClick={() => setAgentType("business")}
              >
                <div className="bg-black text-white inline-block px-3 py-2 rounded-lg text-sm mb-4">
                  Can you tell me more about pricing?
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  A business agent that helps answer customer queries.
                </p>
                <span className="font-medium">Business Agent</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                className="px-4 py-2 bg-black text-white rounded-md hover:brightness-80 hover:cursor-pointer"
                disabled={!agentType}
                onClick={() => setStep(2)}
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Configure */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold mb-2">Configure Agent</h2>
            <p className="text-gray-600 mb-6">
              Give your agent a name and description.
            </p>

            <input
              type="text"
              placeholder="Agent name"
              value={config.name}
              onChange={(e) => setConfig({ ...config, name: e.target.value })}
              className="w-full border px-4 py-2 rounded-lg mb-4"
            />
            <textarea
              placeholder="Agent description"
              value={config.description}
              onChange={(e) =>
                setConfig({ ...config, description: e.target.value })
              }
              className="w-full border px-4 py-2 rounded-lg mb-4"
            />

            <div className="flex justify-between">
              <button
                className="px-4 py-2 bg-black text-white rounded-md hover:brightness-80 hover:cursor-pointer"
                onClick={() => setStep(1)}
              >
                ← Back
              </button>
              <button
                className="px-4 py-2 bg-black text-white rounded-md hover:brightness-80 hover:cursor-pointer"
                disabled={!config.name}
                onClick={() => setStep(3)}
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Confirm</h2>
            <p className="mb-4">Please review your agent details:</p>
            <ul className="mb-6 text-sm text-gray-700">
              <li>
                <strong>Type:</strong> {agentType}
              </li>
              <li>
                <strong>Name:</strong> {config.name}
              </li>
              <li>
                <strong>Description:</strong> {config.description}
              </li>
            </ul>

            <div className="flex justify-between">
              <button
                className="px-4 py-2 bg-black text-white rounded-md hover:brightness-80 hover:cursor-pointer"
                onClick={() => setStep(2)}
              >
                ← Back
              </button>
              <button
                className="px-4 py-2 bg-black text-white rounded-md hover:brightness-80 hover:cursor-pointer"
                onClick={() => {
                  onClose();
                }}
              >
                Create Agent
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}