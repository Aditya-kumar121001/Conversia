"use server"

import { z } from "zod"

export async function contactFormAction(prevState: any, formData: FormData) {
  // Define validation schema
  const schema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email address"),
    message: z.string().min(5, "Message must be at least 5 characters"),
  })

  // Extract data
  const values = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    message: formData.get("message") as string,
  }

  // Validate
  const parsed = schema.safeParse(values)
  if (!parsed.success) {
    const errors: Record<string, string> = {}
    for (const [key, val] of Object.entries(parsed.error.formErrors.fieldErrors)) {
      errors[key] = val?.[0] || "Invalid field"
    }

    return {
      defaultValues: values,
      success: false,
      errors,
    }
  }

  // TODO: Send email or store in DB here
  // Example: await sendEmail(values)

  return {
    defaultValues: { name: "", email: "", message: "" },
    success: true,
    errors: null,
  }
}
