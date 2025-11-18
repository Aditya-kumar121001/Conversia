"use client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../lib/utils";
import { personalAgents } from "../lib/personalAgents";

export default function NewAgentWizard({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);

  // Main category
  const [agentType, setAgentType] = useState<"personal" | "business" | null>(null);
  const [agentSubType, setAgentSubType] = useState<string | null>(null);

  // Config
  const [config, setConfig] = useState({ name: "", description: "" });
  const [Bconfig, setBConfig] = useState({
    name: "",
    agentSubType: "",
    description: "",
    firstMessage: "",
    sysPrompt: "",
  });

  const [agentReq, setAgentReq] = useState(false);
  const navigate = useNavigate();

  const createAgent = async () => {
    setAgentReq(true);
    try {
      let route = "";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let body: any = {};

      if (agentType === "personal") {
        route = "/agent/new-agent";
        body = {
          name: config.name,
          agentType: agentType,
          agentSubType: agentSubType,
        };
      } else if (agentType === "business") {
        route = "/agent/new-business-agent";
        body = {
          name: Bconfig.name,
          agentType: agentType,
          agentSubType: Bconfig.agentSubType,
          firstMessage: Bconfig.firstMessage,
          systemPrompt: Bconfig.sysPrompt,
        };
      } else {
        throw new Error("Invalid agent type");
      }

      const response = await fetch(`${BACKEND_URL}${route}`, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      console.log("Agent creation response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to create agent");
      }

      return {
        agentId: data.agentId, // ✅ removed typo
        firstMessage: data.firstMessage,
        prompt: data.prompt,
      };
    } catch (err) {
      console.error("Error creating agent:", err);
      return undefined;
    } finally {
      setAgentReq(false);
    }
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
                  setAgentSubType(null);
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
                  setBConfig({
                    name: "",
                    agentSubType: "",
                    description: "",
                    firstMessage: "",
                    sysPrompt: "",
                  });
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
                      agentSubType === card.title
                        ? "border-black"
                        : "border-gray-300"
                    }`}
                    onClick={() => {
                      setAgentSubType(card.title);
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
                  value={Bconfig.name}
                  onChange={(e) =>
                    setBConfig({ ...Bconfig, name: e.target.value })
                  }
                  className="w-full border px-4 py-2 rounded-lg mb-4"
                />
                <input
                  placeholder="Agent type"
                  value={Bconfig.agentSubType}
                  onChange={(e) =>
                    setBConfig({ ...Bconfig, agentSubType: e.target.value })
                  }
                  className="w-full border px-4 py-2 rounded-lg mb-4"
                />
                <textarea
                  placeholder="Agent description"
                  value={Bconfig.description}
                  onChange={(e) =>
                    setBConfig({ ...Bconfig, description: e.target.value })
                  }
                  className="w-full border px-4 py-2 rounded-lg mb-4"
                />
                <textarea
                  placeholder="First Message"
                  value={Bconfig.firstMessage}
                  onChange={(e) =>
                    setBConfig({ ...Bconfig, firstMessage: e.target.value })
                  }
                  className="w-full border px-4 py-2 rounded-lg mb-4"
                />
                <textarea
                  placeholder="System Prompt"
                  value={Bconfig.sysPrompt}
                  onChange={(e) =>
                    setBConfig({ ...Bconfig, sysPrompt: e.target.value })
                  }
                  className="w-full border px-4 py-2 rounded-lg mb-4"
                />
                {/* File upload */}
                <div className="mb-4">
                  <label className="block mb-2 font-medium text-gray-700">
                    Upload File (optional)
                  </label>
                  <div className="relative flex items-center justify-center w-full">
                    <input
                      type="file"
                      id="fileUpload"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer peer"
                    />
                    <label
                      htmlFor="fileUpload"
                      className="flex items-center justify-center w-full px-4 py-3 border-1 border-dashed border-gray-300 rounded-lg bg-white text-sm text-gray-700 shadow-sm transition-all
                 peer-hover:border-gray-400 peer-hover:shadow-md peer-active:border-gray-500 peer-active:shadow-inner"
                    >
                      <svg
                        className="w-5 h-5 mr-2 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12v9m0-9l-3-3m3 3l3-3M12 3v9"
                        />
                      </svg>
                      <span className="font-medium">Choose a file</span>
                    </label>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Supported formats: PDF, DOCX, TXT
                  </p>
                </div>
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
                  agentType === "personal" ? !agentSubType : !Bconfig.name
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

              {agentType === "personal" && (
                <>
                  <li>
                    <strong>Subtype:</strong> {agentSubType}
                  </li>
                  <li>
                    <strong>Name:</strong> {config.name}
                  </li>
                  <li>
                    <strong>Description:</strong> {config.description}
                  </li>
                </>
              )}

              {agentType === "business" && (
                <>
                  <li>
                    <strong>Subtype:</strong> {Bconfig.agentSubType}
                  </li>
                  <li>
                    <strong>Name:</strong> {Bconfig.name}
                  </li>
                  <li>
                    <strong>Description:</strong> {Bconfig.description}
                  </li>
                  <li>
                    <strong>First Message:</strong> {Bconfig.firstMessage}
                  </li>
                  <li>
                    <strong>System Prompt:</strong> {Bconfig.sysPrompt}
                  </li>
                </>
              )}
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
                  const agentData = await createAgent();
                  if (!agentData) return;

                  navigate(`/call-agent/${agentData.agentId}`, {
                    state: {
                      agentId: agentData.agentId,
                      firstMessage: agentData.firstMessage,
                      prompt: agentData.prompt,
                      type: agentType,
                      subtype: agentSubType || null,
                    },
                  });
                  onClose();
                }}
              >
                {agentReq ? "Creating..." : "Create Agent"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
