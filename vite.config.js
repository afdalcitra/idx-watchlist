import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // No proxy needed on Vercel — /api/* routes are handled by serverless functions
  // on the same domain. For local dev, run: vercel dev
})
