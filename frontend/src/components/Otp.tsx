"use client";
import { useState } from "react";
import { BACKEND_URL } from "../lib/utils";

export function Otp({
  email,
  setStep,
  onSuccess,
}: {
  email: string;
  setStep: (step: "email" | "otp") => void;
  onSuccess: () => void;
}) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${BACKEND_URL}/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid OTP");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId)
      localStorage.setItem("name", data.name)
      
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center bg-white p-8 rounded-xl shadow-lg w-80 border border-gray-200">
      {/* Title */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">Enter OTP</h2>
      <p className="text-sm text-gray-500 mb-6">We sent a code to your email</p>

      {/* OTP Input */}
      <input
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="Enter OTP"
        className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-center tracking-widest text-lg"
      />

      {/* Error Message */}
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      {/* Verify Button */}
      <button
        onClick={handleVerify}
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            Verifying...
          </span>
        ) : (
          "Verify OTP"
        )}
      </button>

      {/* Change Email */}
      <button
        onClick={() => setStep("email")}
        className="text-sm text-gray-500 mt-4 hover:text-indigo-600 transition"
      >
        Change Email
      </button>
    </div>
  );
}
