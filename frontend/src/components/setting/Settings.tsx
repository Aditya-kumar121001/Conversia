import { useState } from "react";
import { useTenant } from "../../context/Context";
import Profile from "./Profile";

export default function Settings() {
  const { user, refreshUser } = useTenant();
  const [activeTab, setActiveTab] = useState("Profile");

  // Removed redundant mock tabs (Billings, Plan, etc.) since we have a dedicated /billing page.
  const tabs = [
    "Profile",
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-2 py-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h1 className="text-4xl font-semibold">Settings</h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          Manage your account settings and preferences.
        </p>

        {/* Tabs */}
        <div className="flex gap-6 border-b mb-8 text-sm overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 whitespace-nowrap transition-colors ${
                tab === activeTab
                  ? "border-b-2 border-black font-medium text-black"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Profile Content */}
        {activeTab === "Profile" && user && (
          <Profile 
            user={user}
            refreshUser={refreshUser}
          />
        )}

        {/* Placeholder for other tabs if added in future */}
        {activeTab !== "Profile" && (
          <div className="bg-white rounded-lg p-8 shadow-sm text-center">
            <h2 className="text-2xl font-semibold mb-2">{activeTab}</h2>
            <p className="text-gray-500">
              This section is under construction. Content for "{activeTab}" will
              be added here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}