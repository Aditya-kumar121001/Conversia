import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Enable iframe embedding by removing the default X-Frame-Options (if set by Vite preview server)
// and setting appropriate headers for dev server
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    headers: {
      "X-Frame-Options": "ALLOWALL",
    },
  },
  preview: {
    headers: {
      "X-Frame-Options": "ALLOWALL",
    }
  }
})
