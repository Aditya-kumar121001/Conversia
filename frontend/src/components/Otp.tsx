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
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow w-80">
      <h2 className="text-xl font-bold mb-4">Enter OTP</h2>
      <input
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="Enter OTP"
        className="w-full px-3 py-2 border rounded mb-3"
      />
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <button
        onClick={handleVerify}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded"
      >
        {loading ? "Verifying..." : "Verify OTP"}
      </button>

      <button
        onClick={() => setStep("email")}
        className="text-sm text-gray-500 mt-2 underline"
      >
        Change Email
      </button>
    </div>
  );
}
