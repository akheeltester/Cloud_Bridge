import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages deployment: set base to repo name
// Update this to match your GitHub repository name
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/Cloud_Bridge/',
})
