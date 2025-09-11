/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { BACKEND_URL } from "../lib/utils";

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "hin", label: "Hindi"}
  // Add more as needed
];

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
    agentName: z.string().min(1, "Name is required").max(100),
    useCase: z.string().min(1, "Use case is required").max(300),
    firstMessage: z.string().min(1, "First message is required").max(300),
    sysPrompt: z.string().min(1, "System prompt is required").max(300),
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
    consentRecordings: z.literal(true, { errorMap: () => ({ message: "Consent required" }) }),
  });

type FormSchema = z.infer<typeof schema>;

export function Agent() {
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
      let res;
      // if file present, build multipart FormData
      const fileList = data.sampleFile as unknown as FileList | undefined;
      if (fileList && fileList.length > 0) {
        const fd = new FormData();
        fd.append("agent name", data.agentName);
        fd.append("useCase", data.useCase);
        fd.append("useCase", data.firstMessage);
        fd.append("useCase", data.sysPrompt);
        fd.append("consentRecordings", JSON.stringify(data.consentRecordings));
        fd.append("language", JSON.stringify(data.language));
        fd.append("voiceStyle", data.voiceStyle || "");
        fd.append("sampleFile", fileList[0]);
  
        res = await fetch(`${BACKEND_URL}/agent/new`, {
          method: "POST",
          body: fd,
        });
      } else {
        // fallback to JSON if no file
        res = await fetch(`${BACKEND_URL}/agent/new`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            sampleFile: undefined, // don’t send file field
          }),
        });
      }
  
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Submit failed");
      }
  
      const result = await res.json();
      console.log("Agent created:", result);
  
      // success toast or UI
      alert("Agent created successfully!");
      reset();
    } catch (err: any) {
      console.error(err);
      alert(`Failed to submit: ${err.message}`);
    }
  };
  

  return (
    <div className="flex items-center justify-center w-full p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl/10 p-8">

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Common: Name, Email, Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Agent name *</label>
            <input {...register("agentName")} placeholder="Agent name" className="mt-1 block w-full border-gray-700 border-b-1 p-2 focus:border-black focus:ring-black" />
            {errors.agentName && <p className="text-sm text-red-600 mt-1">{errors.agentName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Short description*</label>
            <input {...register("useCase")} placeholder="e.g. agent to answer customer queries" className="mt-1 block w-full border-gray-700 border-b-1 p-2 focus:border-black focus:ring-black" />
            {errors.useCase && <p className="text-sm text-red-600 mt-1">{errors.useCase.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">First Message*</label>
            <input {...register("firstMessage")} placeholder="e.g. Hi There, I hope you're doing well" className="mt-1 block w-full border-gray-700 border-b-1 p-2 focus:border-black focus:ring-black" />
            {errors.firstMessage && <p className="text-sm text-red-600 mt-1">{errors.firstMessage.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">System Prompt*</label>
            <input {...register("sysPrompt")} placeholder="e.g. You are a helpful assistant." className="mt-1 block w-full border-gray-700 border-b-1 p-2 focus:border-black focus:ring-black" />
            {errors.sysPrompt && <p className="text-sm text-red-600 mt-1">{errors.sysPrompt.message}</p>}
          </div>

          {/* File upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Knowledge Base</label>
            <p className="block text-xs font-medium text-gray-500 mb-2">Sample audio / script (optional, max 10MB)</p>
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

export default Agent;
