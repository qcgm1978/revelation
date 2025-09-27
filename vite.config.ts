import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '', 
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  optimizeDeps: {
    // exclude: ['llm-service-provider'] // 排除特定包的预构建
  }
})