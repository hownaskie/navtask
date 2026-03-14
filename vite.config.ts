import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), svgr({ include: "**/*.svg" })],
  resolve: {
    dedupe: ["react", "react-dom"], // 👈 forces single copy
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // your Spring Boot port
        changeOrigin: true,
        rewrite: (path) => path,
      }
    }
  }
})
