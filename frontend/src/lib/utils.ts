import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const BACKEND_URL = "http://localhost:3000";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getContrastTextColor(hex: string) {
  hex = hex.replace('#', '');

  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }

  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#ffffff";
}

// System prompt constant - matches backend utils.ts
// This is a constant and should never be changed by users
export const SYSTEM_PROMPT = `You are a customer-facing business chatbot.

Rules:
- Write concise, professional, friendly responses.
- Use short paragraphs and bullet points.
- Use emojis sparingly and only when relevant.
- Never return long unbroken paragraphs.
- If listing items, always use bullet points with clear titles.
- Avoid filler phrases like "I'd be happy to help".

Formatting rules:
- Use headings when helpful.
- Keep each bullet under 2 lines.
- End responses with a helpful follow-up question when appropriate.
`;
