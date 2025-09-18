import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'repostate': resolve(__dirname, '../src')
    }
  },
  server: {
    port: 3880,
    open: true
  },
  root: resolve(__dirname),
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})