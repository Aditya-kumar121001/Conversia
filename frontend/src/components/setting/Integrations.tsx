import React, { useState, useEffect } from "react";
import { BACKEND_URL } from "../../lib/utils";
import { Eye, EyeOff, ExternalLink, Check, X, Loader2 } from "lucide-react";

interface User {
  name: string;
  email: string;
  elevenlabsApiKey?: string;
}

interface IntegrationsProps {
  user: User;
  refreshUser: () => Promise<void>;
}

const Integrations: React.FC<IntegrationsProps> = ({ user, refreshUser }) => {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const hasExistingKey = !!user.elevenlabsApiKey;

  // Clear feedback after 4 seconds
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const saveApiKey = async (keyValue: string) => {
    setIsSaving(true);
    setFeedback(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ elevenlabsApiKey: keyValue }),
      });

      if (!res.ok) {
        throw new Error("Failed to save API key");
      }

      await refreshUser();
      setApiKey("");
      setFeedback({
        type: "success",
        message: keyValue ? "API key saved successfully." : "API key removed.",
      });
    } catch (err) {
      console.error(err);
      setFeedback({
        type: "error",
        message: "Failed to save API key. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = () => {
    if (!apiKey.trim()) return;
    saveApiKey(apiKey.trim());
  };

  const handleRemove = () => {
    saveApiKey("");
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          API Integrations
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Connect external services to power your voice agents.
        </p>
      </div>

      {/* ElevenLabs Card */}
      <section className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* ElevenLabs "Logo" */}
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              EL
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h4 className="text-base font-semibold text-gray-900">
                  ElevenLabs
                </h4>
                {/* Status indicator */}
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${
                    hasExistingKey
                      ? "bg-green-50 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      hasExistingKey ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                  {hasExistingKey ? "Connected" : "Not configured"}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Required for Voice Bot agents. Add your ElevenLabs API key to
                enable voice AI features.
              </p>
            </div>
          </div>
        </div>

        {/* API Key Input */}
        <div className="mt-6 space-y-4">
          {hasExistingKey && (
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-4 py-3">
              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>
                Current key:{" "}
                <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">
                  {user.elevenlabsApiKey}
                </code>
              </span>
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-600 mb-1.5">
              {hasExistingKey ? "Replace API Key" : "API Key"}
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type={showKey ? "text" : "password"}
                  className="w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/20 text-sm font-mono"
                  placeholder="sk_..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving || !apiKey.trim()}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save API Key"
                )}
              </button>
              {hasExistingKey && (
                <button
                  onClick={handleRemove}
                  disabled={isSaving}
                  className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Feedback */}
          {feedback && (
            <div
              className={`flex items-center gap-2 text-sm px-4 py-3 rounded-lg ${
                feedback.type === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {feedback.type === "success" ? (
                <Check className="w-4 h-4 flex-shrink-0" />
              ) : (
                <X className="w-4 h-4 flex-shrink-0" />
              )}
              {feedback.message}
            </div>
          )}

          {/* Help link */}
          <a
            href="https://elevenlabs.io/app/settings/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition-colors"
          >
            Get your API key
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </section>
    </div>
  );
};

export default Integrations;
