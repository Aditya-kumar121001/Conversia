"use client";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useState } from "react";
import { BACKEND_URL } from "../lib/utils";
import { toast } from "sonner";

const isEmailValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export function Email({
  setEmail,
  setStep,
  email,
}: {
  setEmail: (email: string) => void;
  setStep: (step: "email" | "otp") => void;
  email: string;
}) {
  const [sendingRequest, setSendingRequest] = useState(false);

  const handleSendOTP = async () => {
    setSendingRequest(true);
    try {
      const response = await fetch(`${BACKEND_URL}/auth/initiate-signin`, {
        method: "POST",
        body: JSON.stringify({ email }),
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
    <div className="w-full max-w-md flex flex-col items-center gap-6">
      <h1 className="text-3xl font-bold">Welcome to <span className="text-primary">Conversia</span></h1>
      <Input
        value={email}
        onChange={(e:any) => setEmail(e.target.value)}
        placeholder="Enter your email"
        onKeyDown={(e:any) => {
          if (e.key === "Enter" && isEmailValid(email) && !sendingRequest) {
            handleSendOTP();
          }
        }}
      />
      <Button
        disabled={!isEmailValid(email) || sendingRequest}
        onClick={handleSendOTP}
        className="w-full h-12"
      >
        {sendingRequest ? "Sending..." : "Continue with Email"}
      </Button>
    </div>
  );
}
