import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import type { ProfileData } from "../../types";
import { BACKEND_URL } from "../../lib/utils";

interface User {
  name: string;
  email: string;
  profile?: ProfileData;
}

interface ProfileProps {
  user: User;
  refreshUser: () => Promise<void>;
}

const Profile: React.FC<ProfileProps> = ({ user, refreshUser }) => {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    title: "",
    location: "",
    phone: "",
    bio: "",
    country: "",
    cityState: "",
    postalCode: "",
    taxId: "",
  });

  // Initialize profile data from user prop
  useEffect(() => {
    if (user) {
      const [firstName = "", ...lastNameParts] = (user.name || "").trim().split(/\s+/);
      const lastName = lastNameParts.join(" ");

      setProfileData({
        firstName: user.profile?.firstName || firstName,
        lastName: user.profile?.lastName || lastName,
        title: user.profile?.title || "",
        location: user.profile?.location || "",
        phone: user.profile?.phone || "",
        bio: user.profile?.bio || "",
        country: user.profile?.country || "",
        cityState: user.profile?.cityState || "",
        postalCode: user.profile?.postalCode || "",
        taxId: user.profile?.taxId || "",
      });
    }
  }, [user]);

  const handleProfileChange = (field: keyof ProfileData, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveProfileToBackend = async (closeEditing: () => void) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!res.ok) {
        throw new Error("Failed to save profile");
      }
      
      await refreshUser();
      closeEditing();
    } catch (err) {
      console.error(err);
      alert("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProfile = () => saveProfileToBackend(() => setIsEditingProfile(false));
  const handleSavePersonalInfo = () => saveProfileToBackend(() => setIsEditingPersonalInfo(false));
  const handleSaveAddress = () => saveProfileToBackend(() => setIsEditingAddress(false));

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <section className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center text-white text-4xl font-semibold overflow-hidden">
              <Avatar className="w-full h-full">
                <AvatarFallback className="text-white font-semibold flex items-center justify-center text-2xl bg-black">
                  {profileData.firstName?.slice(0, 1).toUpperCase() || user.name?.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {profileData.firstName} {profileData.lastName}
              </h2>
              <p className="text-gray-600">{profileData.title || "No title set"}</p>
              <p className="text-sm text-gray-500">
                {profileData.location || "No location set"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            Edit
          </button>
        </div>

        {isEditingProfile && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={profileData.title || ""}
                  onChange={(e) =>
                    handleProfileChange("title", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={profileData.location || ""}
                  onChange={(e) =>
                    handleProfileChange("location", e.target.value)
                  }
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => setIsEditingProfile(false)}
                disabled={isSaving}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Personal Information */}
      <section className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Personal information
          </h3>
          <button
            onClick={() =>
              setIsEditingPersonalInfo(!isEditingPersonalInfo)
            }
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            Edit
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-500 mb-1">
              First Name
            </label>
            {isEditingPersonalInfo ? (
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={profileData.firstName || ""}
                onChange={(e) =>
                  handleProfileChange("firstName", e.target.value)
                }
              />
            ) : (
              <p className="text-gray-900 font-medium">
                {profileData.firstName || "—"}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-1">
              Last Name
            </label>
            {isEditingPersonalInfo ? (
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={profileData.lastName || ""}
                onChange={(e) =>
                  handleProfileChange("lastName", e.target.value)
                }
              />
            ) : (
              <p className="text-gray-900 font-medium">
                {profileData.lastName || "—"}
              </p> 
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-1">
              Email address
            </label>
            <p className="text-gray-900 font-medium">
              {user.email}
            </p>
            {isEditingPersonalInfo && (
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-1">
              Phone
            </label>
            {isEditingPersonalInfo ? (
              <input
                type="tel"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={profileData.phone || ""}
                onChange={(e) =>
                  handleProfileChange("phone", e.target.value)
                }
              />
            ) : (
              <p className="text-gray-900 font-medium">
                {profileData.phone || "—"}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-500 mb-1">
              Bio
            </label>
            {isEditingPersonalInfo ? (
              <textarea
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={profileData.bio || ""}
                onChange={(e) =>
                  handleProfileChange("bio", e.target.value)
                }
              />
            ) : (
              <p className="text-gray-900 font-medium">
                {profileData.bio || "—"}
              </p>
            )}
          </div>
        </div>

        {isEditingPersonalInfo && (
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSavePersonalInfo}
              disabled={isSaving}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={() => setIsEditingPersonalInfo(false)}
              disabled={isSaving}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        )}
      </section>

      {/* Address */}
      <section className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Address</h3>
          <button
            onClick={() => setIsEditingAddress(!isEditingAddress)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            Edit
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-500 mb-1">
              Country
            </label>
            {isEditingAddress ? (
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={profileData.country || ""}
                onChange={(e) =>
                  handleProfileChange("country", e.target.value)
                }
              />
            ) : (
              <p className="text-gray-900 font-medium">
                {profileData.country || "—"}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-1">
              City / State
            </label>
            {isEditingAddress ? (
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={profileData.cityState || ""}
                onChange={(e) =>
                  handleProfileChange("cityState", e.target.value)
                }
              />
            ) : (
              <p className="text-gray-900 font-medium">
                {profileData.cityState || "—"}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-1">
              Postal Code
            </label>
            {isEditingAddress ? (
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={profileData.postalCode || ""}
                onChange={(e) =>
                  handleProfileChange("postalCode", e.target.value)
                }
              />
            ) : (
              <p className="text-gray-900 font-medium">
                {profileData.postalCode || "—"}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-1">
              TAX ID
            </label>
            {isEditingAddress ? (
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={profileData.taxId || ""}
                onChange={(e) =>
                  handleProfileChange("taxId", e.target.value)
                }
              />
            ) : (
              <p className="text-gray-900 font-medium">
                {profileData.taxId || "—"}
              </p>
            )}
          </div>
        </div>

        {isEditingAddress && (
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSaveAddress}
              disabled={isSaving}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={() => setIsEditingAddress(false)}
              disabled={isSaving}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Profile;