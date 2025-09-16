"use client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../lib/utils";
import { personalAgents } from "../lib/personalAgents";

export default function NewAgentWizard({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);

  // Main category
  const [agentType, setAgentType] = useState<"personal" | "business" | null>(
    null
  );
  // Personal subtypes
  const [agentSubtype, setAgentSubtype] = useState<string | null>(null);

  // Config
  const [config, setConfig] = useState({ name: "", description: "" });
  const [agentReq, setAgentReq] = useState(false)
  const navigate = useNavigate();

  const createAgent = async() =>{
    setAgentReq(true);
    try {
      const response = await fetch(`${BACKEND_URL}/agent/new-agent`, {
        method: "POST",
        body: JSON.stringify(
          {
            name: config.name,
            agentType: agentType,
            agentSubtype: agentSubtype,
          }),
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
        
      });

      const data = await response.json();
      return data.agendId?.agentId || data.agentId;

    } catch (err) {
      console.error(err);
    } finally {
      setAgentReq(false);
    }
  }

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

        {/* Step 1: Choose main type */}
        {step === 1 && (
          <div>
            <p className="text-gray-600 mb-6">
              What type of agent would you like to create?
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal */}
              <div
                className={`rounded-xl border p-6 cursor-pointer hover:shadow-lg transition ${
                  agentType === "personal" ? "border-black" : "border-gray-300"
                }`}
                onClick={() => {
                  setAgentType("personal");
                  setAgentSubtype(null);
                  setConfig({ name: "", description: "" });
                }}
              >
                <div className="bg-black text-white inline-block px-3 py-2 rounded-lg text-sm mb-4">
                  Could you see whether I have any urgent emails?
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  A personal assistant that helps manage your daily tasks.
                </p>
                <span className="font-medium">Personal Assistant</span>
              </div>

              {/* Business */}
              <div
                className={`rounded-xl border p-6 cursor-pointer hover:shadow-lg transition ${
                  agentType === "business" ? "border-black" : "border-gray-300"
                }`}
                onClick={() => {
                  setAgentType("business");
                  setAgentSubtype(null);
                  setConfig({ name: "", description: "" });
                }}
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
                className="bg-black text-white px-6 py-2 rounded-lg disabled:opacity-50 cursor-pointer"
                disabled={!agentType}
                onClick={() => setStep(2)}
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Subtype or config */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold mb-2">Configure Agent</h2>
            <p className="text-gray-600 mb-6">
              {agentType === "personal"
                ? "Choose the type of personal agent you'd like to create."
                : "Give your business agent a name and description."}
            </p>

            {agentType === "personal" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {personalAgents.map((card) => (
                  <div
                    key={card.key}
                    className={`rounded-xl border p-6 cursor-pointer hover:shadow-lg transition ${
                      agentSubtype === card.title
                        ? "border-black"
                        : "border-gray-300"
                    }`}
                    onClick={() => {
                      setAgentSubtype(card.title);
                      setConfig({
                        name: card.title,
                        description: card.desc,
                      });
                    }}
                  >
                    <p className="font-medium mb-2">{card.title}</p>
                    <p className="text-sm text-gray-600">{card.desc}</p>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Agent name"
                  value={config.name}
                  onChange={(e) =>
                    setConfig({ ...config, name: e.target.value })
                  }
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
              </>
            )}

            <div className="flex justify-between">
              <button
                className="px-6 py-2 border rounded-lg cursor-pointer"
                onClick={() => setStep(1)}
              >
                ← Back
              </button>
              <button
                className="bg-black text-white px-6 py-2 rounded-lg disabled:opacity-50 cursor-pointer"
                disabled={
                  agentType === "personal" ? !agentSubtype : !config.name
                }
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
            <ul className="mb-6 text-sm text-gray-700 space-y-1">
              <li>
                <strong>Type:</strong> {agentType}
              </li>
              {agentSubtype && (
                <li>
                  <strong>Subtype:</strong> {agentSubtype}
                </li>
              )}
              <li>
                <strong>Name:</strong> {config.name}
              </li>
              <li>
                <strong>Description:</strong> {config.description}
              </li>
            </ul>

            <div className="flex justify-between">
              <button
                className="px-6 py-2 border rounded-lg cursor-pointer"
                onClick={() => setStep(2)}
              >
                ← Back
              </button>
              <button
                className="bg-black text-white px-6 py-2 rounded-lg cursor-pointer disabled:opacity-50"
                onClick={async () => {
                  const agendId = await createAgent();
                  if (agendId === undefined) return;
                  // navigate to agent using agnetId;
                  navigate(`/call-agent/${agendId}`, { state: { agentId: agendId } });
                  onClose();
                }}
              >
                {
                    agentReq ? "Creating..." : "Create Agent"
                }
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
