"use client";

import { useState } from "react";
import { Email } from "../components/Email";
import { Otp } from "../components/Otp";

export function SignIn({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      {step === "email" && (
        <Email email={email} setEmail={setEmail} setStep={setStep} />
      )}
      {step === "otp" && (
        <Otp email={email} setStep={setStep} onSuccess={onSuccess} />
      )}
    </div>
  );
}
