import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // ADD THIS 'SERVER' BLOCK
  server: {
    proxy: {
      // Requests starting with '/api' will be proxied
      '/api': {
        target: 'http://localhost:8081', // Your Spring Boot backend
        changeOrigin: true, // Needed for virtual hosted sites
        secure: false,      // If you're not using HTTPS
      }
    }
  }
})