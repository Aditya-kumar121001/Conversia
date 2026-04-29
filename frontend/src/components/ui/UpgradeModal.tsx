import { useNavigate } from "react-router-dom";
import { X, Sparkles } from "lucide-react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
  message?: string;
}

export default function UpgradeModal({ isOpen, onClose, feature, message }: UpgradeModalProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Gradient Header */}
        <div className="relative px-6 pt-8 pb-6 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white text-center">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5 text-gray-300" />
          </button>

          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 mb-4 shadow-lg shadow-amber-500/20">
            <Sparkles className="w-7 h-7 text-white" />
          </div>

          <h2 className="text-xl font-bold">Upgrade to Premium</h2>
          <p className="text-sm text-gray-300 mt-1">
            {feature
              ? `Unlock ${feature} with a Premium plan`
              : "Unlock the full power of Conversia"}
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {message && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
              {message}
            </div>
          )}

          <ul className="space-y-3 text-sm text-gray-700">
            {[
              "Unlimited domains",
              "Unlimited conversations per month",
              "Unlimited knowledge base uploads",
              "Unlimited workflows",
              "Voice AI agents",
              "Email automation in workflows",
              "Unlimited chat history retention",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            Maybe later
          </button>
          <button
            onClick={() => {
              onClose();
              navigate("/billing");
            }}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition shadow-lg"
          >
            View Plans
          </button>
        </div>
      </div>
    </div>
  );
}
