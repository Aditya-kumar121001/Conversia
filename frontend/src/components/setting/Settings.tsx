import { useEffect, useState, type ChangeEvent } from "react";
import { useTenant } from "../../context/Context";
import { Avatar, AvatarFallback } from "../ui/avatar";

type PaymentMethod = {
  nameOnCard: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
};

type SavedCard = {
  id: number;
  nameOnCard: string;
  cardNumber: string;
  expiry: string;
  isDefault: boolean;
};

type BillingStatus = "Pending" | "Cancelled" | "Refund";

type BillingHistoryRow = {
  id: number;
  name: string;
  date: string;
  amount: string;
  status: BillingStatus;
};

type ProfileData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  title: string;
  location: string;
  country: string;
  cityState: string;
  postalCode: string;
  taxId: string;
};

type EmailOption = "existing" | "new";

export default function Settings() {
  const { user } = useTenant();
  const [activeTab, setActiveTab] = useState("Profile");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>({
    nameOnCard: "Mayad Ahmed",
    cardNumber: "8269 9602 9292 2538",
    expiry: "02 / 2028",
    cvv: "123",
  });
  const [emailOption, setEmailOption] = useState<EmailOption>("existing");
  const [newEmail, setNewEmail] = useState("");
  const [savedCards, setSavedCards] = useState<SavedCard[]>([
    {
      id: 1,
      nameOnCard: "Mayad Ahmed",
      cardNumber: "8269 9602 9292 2538",
      expiry: "02 / 2028",
      isDefault: true,
    },
  ]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [billingHistory] = useState<BillingHistoryRow[]>([
    {
      id: 1,
      name: "Account Sale",
      date: "Apr 14, 2024",
      amount: "$3,050",
      status: "Pending",
    },
    {
      id: 2,
      name: "Account Sale",
      date: "Jun 24, 2023",
      amount: "$1,050",
      status: "Cancelled",
    },
    {
      id: 3,
      name: "Netflix Subscription",
      date: "Feb 28, 2024",
      amount: "$800",
      status: "Refund",
    },
  ]);

  // Profile state
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "Michael",
    lastName: "Rodriguez",
    email: "Rodriguez@gmail.com",
    phone: "(213) 555-1234",
    bio: "Product Designer",
    title: "Product Designer",
    location: "Los Angeles, California, USA",
    country: "United States of America",
    cityState: "California, USA",
    postalCode: "ERT 62574",
    taxId: "AS56417896",
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  useEffect(() => {
    if (!user) return;

    const [firstName = "", ...lastNameParts] = user.name.trim().split(/\s+/);
    const lastName = lastNameParts.join(" ");

    setProfileData((prev) => ({
      ...prev,
      firstName: firstName || prev.firstName,
      lastName: lastName || prev.lastName,
      email: user.email || prev.email,
    }));

    setPaymentMethod((prev) => ({
      ...prev,
      nameOnCard: user.name || prev.nameOnCard,
    }));

    setSavedCards((prev) =>
      prev.map((card, index) =>
        index === 0 ? { ...card, nameOnCard: user.name || card.nameOnCard } : card
      )
    );
  }, [user]);

  const tabs = [
    "Profile",
    "Security",
    "Team",
    "Billings",
    "Plan",
    "Notifications",
  ];

  const handleInputChange = (field: keyof PaymentMethod, value: string) => {
    setPaymentMethod((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(" ") : cleaned;
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)} / ${cleaned.slice(2, 6)}`;
    }
    return cleaned;
  };

  const handleCardNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, "");
    if (value.length <= 16 && /^\d*$/.test(value)) {
      handleInputChange("cardNumber", formatCardNumber(value));
    }
  };

  const handleExpiryChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 6) {
      handleInputChange("expiry", formatExpiry(value));
    }
  };

  const handleCvvChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 3 && /^\d*$/.test(value)) {
      handleInputChange("cvv", value);
    }
  };

  const handleAddCard = () => {
    if (
      !paymentMethod.nameOnCard ||
      !paymentMethod.cardNumber ||
      !paymentMethod.expiry
    ) {
      alert("Please fill in all card details");
      return;
    }

    const newCard = {
      id: savedCards.length + 1,
      nameOnCard: paymentMethod.nameOnCard,
      cardNumber: paymentMethod.cardNumber,
      expiry: paymentMethod.expiry,
      isDefault: false,
    };

    setSavedCards([...savedCards, newCard]);
    setShowAddCard(false);
    setPaymentMethod({
      nameOnCard: "",
      cardNumber: "",
      expiry: "",
      cvv: "",
    });
    alert("Card added successfully!");
  };

  const handleRemoveCard = (cardId: number) => {
    if (savedCards.length === 1) {
      alert("You must have at least one payment method");
      return;
    }
    setSavedCards(savedCards.filter((card) => card.id !== cardId));
  };

  const handleSetDefaultCard = (cardId: number) => {
    setSavedCards(
      savedCards.map((card) => ({
        ...card,
        isDefault: card.id === cardId,
      }))
    );
  };

  const handleEmailOptionChange = (option: EmailOption) => {
    setEmailOption(option);
  };

  const handleSaveEmailPreference = () => {
    if (emailOption === "new" && !newEmail) {
      alert("Please enter an email address");
      return;
    }
    if (emailOption === "new" && !/\S+@\S+\.\S+/.test(newEmail)) {
      alert("Please enter a valid email address");
      return;
    }
    alert("Email preference saved successfully!");
  };

  const handleViewInvoice = (invoice: BillingHistoryRow) => {
    alert(`Viewing invoice: ${invoice.name} - ${invoice.amount}`);
  };

  const handleDownloadInvoice = (invoice: BillingHistoryRow) => {
    alert(`Downloading invoice: ${invoice.name}`);
  };

  const handleProfileChange = (field: keyof ProfileData, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = () => {
    setIsEditingProfile(false);
    alert("Profile updated successfully!");
  };

  const handleSavePersonalInfo = () => {
    setIsEditingPersonalInfo(false);
    alert("Personal information updated successfully!");
  };

  const handleSaveAddress = () => {
    setIsEditingAddress(false);
    alert("Address updated successfully!");
  };

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
        {activeTab === "Profile" && (
          <div className="space-y-6">
            {/* Profile Header */}
            <section className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center text-white text-4xl font-semibold overflow-hidden">
                    <Avatar className="">
                      <AvatarFallback className="text-white font-semibold flex items-center justify-center">
                        {user.name?.slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {`${profileData.firstName?.slice(0, 1).toUpperCase() + profileData.firstName?.slice(1,)}`} {profileData.lastName}
                    </h2>
                    <p className="text-gray-600">{profileData.title}</p>
                    <p className="text-sm text-gray-500">
                      {profileData.location}
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
                        value={profileData.title}
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
                        value={profileData.location}
                        onChange={(e) =>
                          handleProfileChange("location", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveProfile}
                      className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditingProfile(false)}
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
                      value={profileData.firstName}
                      onChange={(e) =>
                        handleProfileChange("firstName", e.target.value)
                      }
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">
                      {profileData.firstName}
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
                      value={profileData.lastName}
                      onChange={(e) =>
                        handleProfileChange("lastName", e.target.value)
                      }
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">
                      {profileData.lastName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Email address
                  </label>
                  {isEditingPersonalInfo ? (
                    <input
                      type="email"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={profileData.email}
                      onChange={(e) =>
                        handleProfileChange("email", e.target.value)
                      }
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">
                      {profileData.email}
                    </p>
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
                      value={profileData.phone}
                      onChange={(e) =>
                        handleProfileChange("phone", e.target.value)
                      }
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">
                      {profileData.phone}
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
                      value={profileData.bio}
                      onChange={(e) =>
                        handleProfileChange("bio", e.target.value)
                      }
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">
                      {profileData.bio}
                    </p>
                  )}
                </div>
              </div>

              {isEditingPersonalInfo && (
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleSavePersonalInfo}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditingPersonalInfo(false)}
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
                      value={profileData.country}
                      onChange={(e) =>
                        handleProfileChange("country", e.target.value)
                      }
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">
                      {profileData.country}
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
                      value={profileData.cityState}
                      onChange={(e) =>
                        handleProfileChange("cityState", e.target.value)
                      }
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">
                      {profileData.cityState}
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
                      value={profileData.postalCode}
                      onChange={(e) =>
                        handleProfileChange("postalCode", e.target.value)
                      }
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">
                      {profileData.postalCode}
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
                      value={profileData.taxId}
                      onChange={(e) =>
                        handleProfileChange("taxId", e.target.value)
                      }
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">
                      {profileData.taxId}
                    </p>
                  )}
                </div>
              </div>

              {isEditingAddress && (
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleSaveAddress}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditingAddress(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </section>
          </div>
        )}

        {/* Billing Content */}
        {activeTab === "Billings" && (
          <div className="space-y-10">
            {/* Saved Cards */}
            <section className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-1">Saved Payment Methods</h3>
              <p className="text-sm text-gray-500 mb-4">
                Manage your saved cards
              </p>

              <div className="space-y-3">
                {savedCards.map((card) => (
                  <div
                    key={card.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center text-white text-xs font-bold">
                        CARD
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          •••• {card.cardNumber.slice(-4)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {card.nameOnCard} • Expires {card.expiry}
                        </p>
                      </div>
                      {card.isDefault && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {!card.isDefault && (
                        <button
                          onClick={() => handleSetDefaultCard(card.id)}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Set as default
                        </button>
                      )}
                      {savedCards.length > 1 && (
                        <button
                          onClick={() => handleRemoveCard(card.id)}
                          className="text-sm text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowAddCard(!showAddCard)}
                className="mt-4 text-sm text-gray-600 hover:underline"
              >
                {showAddCard ? "- Cancel" : "+ Add another card"}
              </button>
            </section>

            {/* Add Card Form */}
            {showAddCard && (
              <section className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold mb-1">Add New Card</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Enter your new card details
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block text-gray-600 mb-1">
                      Name on card
                    </label>
                    <input
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="John Doe"
                      value={paymentMethod.nameOnCard}
                      onChange={(e) =>
                        handleInputChange("nameOnCard", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-gray-600 mb-1">Expiry</label>
                    <input
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="MM / YYYY"
                      value={paymentMethod.expiry}
                      onChange={handleExpiryChange}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-gray-600 mb-1">
                      Card number
                    </label>
                    <input
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1234 5678 9012 3456"
                      value={paymentMethod.cardNumber}
                      onChange={handleCardNumberChange}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-600 mb-1">CVV</label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="123"
                      value={paymentMethod.cvv}
                      onChange={handleCvvChange}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleAddCard}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
                  >
                    Add Card
                  </button>
                  <button
                    onClick={() => setShowAddCard(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </section>
            )}

            {/* Contact Email */}
            <section className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-1">Contact email</h3>
              <p className="text-sm text-gray-500 mb-4">
                Where should invoices be sent?
              </p>

              <div className="space-y-3 text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="emailOption"
                    checked={emailOption === "existing"}
                    onChange={() => handleEmailOptionChange("existing")}
                    className="cursor-pointer"
                  />
                  Send to the existing email
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="emailOption"
                    checked={emailOption === "new"}
                    onChange={() => handleEmailOptionChange("new")}
                    className="cursor-pointer"
                  />
                  Add another email address
                </label>

                {emailOption === "new" && (
                  <div className="ml-6 mt-2">
                    <input
                      type="email"
                      className="w-full max-w-md px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="billing@example.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <button
                onClick={handleSaveEmailPreference}
                className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
              >
                Save Email Preference
              </button>
            </section>

            {/* Billing History */}
            <section className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-4">Billing History</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-gray-500 border-b">
                    <tr>
                      <th className="text-left py-2 px-2">Invoice</th>
                      <th className="text-center py-2 px-2">Date</th>
                      <th className="text-center py-2 px-2">Amount</th>
                      <th className="text-center py-2 px-2">Status</th>
                      <th className="text-center py-2 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billingHistory.map((row) => (
                      <tr key={row.id} className="border-b last:border-none">
                        <td className="py-3 px-2">{row.name}</td>
                        <td className="text-center px-2">{row.date}</td>
                        <td className="text-center px-2 font-medium">
                          {row.amount}
                        </td>
                        <td className="text-center px-2">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              row.status === "Pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : row.status === "Cancelled"
                                ? "bg-red-100 text-red-600"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="text-center px-2">
                          <button
                            onClick={() => handleViewInvoice(row)}
                            className="text-blue-600 hover:underline mr-3"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDownloadInvoice(row)}
                            className="text-blue-600 hover:underline"
                          >
                            Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* Placeholder for other tabs */}
        {activeTab !== "Billings" && activeTab !== "Profile" && (
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