import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const rootDir = import.meta.dirname

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
    },
  },
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (
            id.includes('/react-dom/') ||
            id.includes('/react/') ||
            id.includes('react-router')
          ) {
            return 'vendor-react'
          }
          if (id.includes('@radix-ui')) {
            return 'vendor-radix'
          }
          if (id.includes('lucide-react')) {
            return 'vendor-icons'
          }
          if (id.includes('zod') || id.includes('@hookform') || id.includes('react-hook-form')) {
            return 'vendor-forms'
          }
          if (id.includes('axios')) {
            return 'vendor-http'
          }
        },
      },
    },
  },
})
