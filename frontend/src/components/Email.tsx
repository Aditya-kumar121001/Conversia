/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useState } from "react";
import { BACKEND_URL } from "../lib/utils";
import { toast } from "sonner";

const isEmailValid = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export function Email({
  setEmail,
  setStep,
  email,
}: {
  setName: (name: string) => void
  setEmail: (email: string) => void;
  setStep: (step: "email" | "otp") => void;
  email: string;
}) {
  const [name, setName] = useState("")
  const [sendingRequest, setSendingRequest] = useState(false);

  const handleSendOTP = async () => {
    setSendingRequest(true);
    try {
      const response = await fetch(`${BACKEND_URL}/auth/initiate-signin`, {
        method: "POST",
        body: JSON.stringify({ email, name }),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        setStep("otp");
        toast.success("OTP sent to email");
      } else {
        toast.error("Failed to send OTP, try again later");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error, please retry");
    } finally {
      setSendingRequest(false);
    }
  };

  return (
    <div className="p-10 w-full max-w-md flex flex-col items-center gap-6 bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Title */}
      <p className="text-4xl font-bold text-center text-gray-800">
        Welcome to <span className="text-indigo-600">Conversia</span>
      </p>
      <p className="text-gray-500 text-center text-sm -mt-4">
        Sign in with your email to continue
      </p>

      {/* Input */}
      <Input
        value={name}
        onChange={(e: any) => setName(e.target.value)}
        placeholder="Enter your Name"
        className="w-full h-12 rounded-lg border-gray-200 focus:ring focus:ring-indigo-500 focus:ring-1"
        onKeyDown={(e: any) => {
          if (e.key === "Enter" && isEmailValid(email) && !sendingRequest) {
            handleSendOTP();
          }
        }}
      />
      <Input
        value={email}
        onChange={(e: any) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="w-full h-12 rounded-lg border-gray-200 focus:ring focus:ring-indigo-500 focus:ring-1"
        onKeyDown={(e: any) => {
          if (e.key === "Enter" && isEmailValid(email) && !sendingRequest) {
            handleSendOTP();
          }
        }}
      />

      {/* Button */}
      <Button
        disabled={!isEmailValid(email) || sendingRequest}
        onClick={handleSendOTP}
        className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition disabled:opacity-50"
      >
        {sendingRequest ? "Sending..." : "Continue with Email"}
      </Button>

      {/* Footer */}
      <p className="text-xs text-gray-400 text-center">
        By continuing, you agree to our{" "}
        <a href="#" className="text-indigo-500 hover:underline">
          Terms
        </a>{" "}
        &{" "}
        <a href="#" className="text-indigo-500 hover:underline">
          Privacy Policy
        </a>
      </p>
    </div>
  );
}
