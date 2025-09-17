import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config" // ✅ CAMBIO: de "vite" a "vitest/config"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // ✅ CONFIGURACIÓN PARA TESTING
  test: {
    globals: true,           // Permite usar describe, it, expect sin importarlos
    environment: 'jsdom',    // Simula el DOM del navegador para React
    setupFiles: './src/setupTests.ts', // Archivo de configuración inicial para tests
  },
})