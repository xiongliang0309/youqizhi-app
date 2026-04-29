/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createEdgeTtsVitePlugin } from './server/edgeTts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), createEdgeTtsVitePlugin()],
  server: {
    host: true, // Listen on all IP addresses (including IPv4 and IPv6)
    port: 5176,
    strictPort: true,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    hmr: {
      protocol: 'ws',
      host: '127.0.0.1' // 尝试使用 127.0.0.1 而不是 localhost 以防 IPv6 解析问题
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'zustand'],
          ui: ['framer-motion', 'lucide-react'],
          tts: ['microsoft-cognitiveservices-speech-sdk']
        }
      }
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true
  }
})
