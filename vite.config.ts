import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  base: '', 
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    cacheDir: false,
    rollupOptions: {
      input: resolve(__dirname, 'index.html')
    }
  },
  optimizeDeps: {
    force: true
  },
  server: {
    fs: {
      allow: ['..'],
      deny: ['licence']
    }
  }
})