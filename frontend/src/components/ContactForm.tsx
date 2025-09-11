/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = [
  "audio/wav",
  "audio/mpeg",
  "audio/mp3",
  "text/plain",
  "application/octet-stream",
];

const schema = z
  .object({
    category: z.enum(["personal", "business"]),
    name: z.string().min(1, "Name is required").max(100),
    email: z.email("Invalid email"),
    phone: z.string().optional(),
    useCase: z.string().min(1, "Use case is required").max(300),
    language: z.array(z.string()).min(1, "Select at least one language"),
    voiceStyle: z.string().optional(),
    sampleFile: z
      .any()
      .optional()
      .refine(
        (f) => {
          if (!f) return true;
          // f is a FileList or File
          const file = f instanceof FileList ? f[0] : f;
          return file && file.size <= MAX_FILE_SIZE && ACCEPTED_FILE_TYPES.includes(file.type);
        },
        { message: "Invalid file or file too large (max 10MB)" }
      ),
    message: z.string().min(1, "Message is required").max(2000),
    consentRecordings: z.literal(true, { errorMap: () => ({ message: "Consent required" }) }),
    // business-specific (optional overall, required when category === business)
    companyName: z.string().optional(),
    companyWebsite: z.string().optional(),
    industry: z.string().optional(),
    teamSize: z
      .preprocess((v) => (v === "" ? undefined : Number(v)), z.number().int().positive().optional()),
    estimatedCallsPerMonth: z.string().optional(),
    primaryIntents: z.array(z.string()).optional(),
    integrationType: z.string().optional(),
    hasApi: z.boolean().optional(),
    budgetRange: z.string().optional(),
    timeline: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.category === "business") {
      if (!data.companyName) ctx.addIssue({ path: ["companyName"], code: z.ZodIssueCode.custom, message: "Company name is required for business" });
      if (!data.estimatedCallsPerMonth) ctx.addIssue({ path: ["estimatedCallsPerMonth"], code: z.ZodIssueCode.custom, message: "Estimated volume is required for business" });
      if (!data.primaryIntents || data.primaryIntents.length === 0) ctx.addIssue({ path: ["primaryIntents"], code: z.ZodIssueCode.custom, message: "Select at least one primary intent" });
      if (!data.budgetRange) ctx.addIssue({ path: ["budgetRange"], code: z.ZodIssueCode.custom, message: "Budget range is required for business" });
    }
  });

type FormSchema = z.infer<typeof schema>;

export function ContactForm() {
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: "personal",
      language: ["en-US"],
      voiceStyle: "friendly",
      hasApi: false,
      primaryIntents: [],
    } as any,
  });

  const category = watch("category");
  const sampleFile = watch("sampleFile");

  useEffect(() => {
    // preview file when changed
    if (sampleFile && (sampleFile as unknown as FileList).length >= 1) {
      const f = (sampleFile as unknown as FileList)[0];
      if (f && f.type.startsWith("audio/")) {
        const url = URL.createObjectURL(f);
        setFilePreviewUrl(url);
        return () => URL.revokeObjectURL(url);
      } else {
        setFilePreviewUrl(null);
      }
    } else {
      setFilePreviewUrl(null);
    }
  }, [sampleFile]);

  const onSubmit = async (data: FormSchema) => {
    try {
      // if file present, send FormData, else JSON
      const fileList = data.sampleFile as unknown as FileList | undefined;
      if (fileList && fileList.length > 0) {
        const fd = new FormData();
        fd.append("payload", JSON.stringify({ ...data, sampleFile: undefined }));
        fd.append("sampleFile", fileList[0]);
        const res = await fetch("/api/requests", { method: "POST", body: fd });
        if (!res.ok) throw new Error("Submit failed");
      } else {
        const res = await fetch("/api/requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Submit failed");
      }
      // success UI (simple)
      alert("Request submitted — we'll reach out via email soon.");
      reset();
    } catch (err) {
      console.error(err);
      alert("Failed to submit. Please try again later.");
    }
  };

  return (
    <div className="flex items-center justify-center w-full p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl/10 p-8">
        {/* Toggle */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-full bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setValue("category", "personal")}
              className={`px-5 py-2 rounded-full focus:outline-none mr-8 ${
                category === "personal" ? "bg-black text-white" : "text-gray-400"
              }`}
            >
              Personal
            </button>
            <button
              type="button"
              onClick={() => setValue("category", "business")}
              className={`px-5 py-2 rounded-full focus:outline-none ${
                category === "business" ? "bg-black text-white" : "text-gray-400"
              }`}
            >
              Business
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Common: Name, Email, Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Agent name *</label>
            <input {...register("name")} placeholder="Agent name" className="mt-1 block w-full border-gray-700 border-b-1 p-2 focus:border-black focus:ring-black" />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email *</label>
            <input {...register("email")} placeholder="Email" className="mt-1 block w-full border-gray-700 border-b-1 p-2 focus:border-black focus:ring-black" />
            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Short description *</label>
            <input {...register("useCase")} placeholder="E.g., Order status voice agent for Shopify" className="mt-1 block w-full border-gray-700 border-b-1 p-2 focus:border-black focus:ring-black" />
            {errors.useCase && <p className="text-sm text-red-600 mt-1">{errors.useCase.message}</p>}
          </div>


          {/* Business-specific fields */}
          {category === "business" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Company name *</label>
                <input {...register("companyName")} placeholder="Company name" className="mt-1 block w-full border-gray-700 border-b-1 p-2 focus:border-black focus:ring-black" />
                {errors.companyName && <p className="text-sm text-red-600 mt-1">{errors.companyName.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Business email *</label>
                <input {...register("email")} placeholder="Business email " className="mt-1 block w-full border-gray-700 border-b-1 p-2 focus:border-black focus:ring-black" />
              </div>

              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Industry *</label>
                  <input {...register("industry")} placeholder="Industry" className="mt-1 block w-full border-gray-700 border-b-1 p-2 focus:border-black focus:ring-black" />
                </div>
              </div>
            </>
          )}

          {/* File upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sample audio / script (optional, max 10MB)</label>
            <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-6 bg-white hover:bg-gray-50 transition-colors">
              <input
                type="file"
                accept={ACCEPTED_FILE_TYPES.join(",")}
                onChange={(e) => {
                  setValue("sampleFile", e.target.files as any, { shouldValidate: true });
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <svg
                className="w-10 h-10 text-gray-400 mb-2"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" />
              </svg>
              <span className="text-gray-500 text-sm">Click or drag file to upload</span>
            </div>
            {errors.sampleFile && <p className="text-sm text-red-600 mt-1">{errors.sampleFile.message as any}</p>}
            {filePreviewUrl && (
              <div className="mt-2">
                <audio src={filePreviewUrl} controls className="w-full" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Message *</label>
            <textarea {...register("message")} placeholder="Message" rows={3} className="mt-1 block w-full border-gray-700 border-b-1 p-2 focus:border-black focus:ring-black" />
            {errors.message && <p className="text-sm text-red-600 mt-1">{errors.message.message}</p>}
          </div>

          <div className="flex items-start gap-2">
            <input type="checkbox" {...register("consentRecordings")} className="mt-1 h-4 w-4" />
            <div className="text-sm text-gray-600">
              I consent to storing call audio & transcripts for product improvement. <a href="/privacy" className="text-primary underline">Privacy policy</a>
              {errors.consentRecordings && <div className="text-sm text-red-600">{(errors as any).consentRecordings?.message}</div>}
            </div>
          </div>

          <div className="pt-4">
            <button disabled={isSubmitting} type="submit" className="w-full rounded-md bg-black px-4 py-2 text-white shadow hover:bg-gray-800">
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ContactForm;
