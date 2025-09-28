import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '', 
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    cacheDir: false // 禁用构建缓存
  },
  optimizeDeps: {
    force: true // 强制重新优化依赖
  },
  server: {
    fs: {
      // 确保 Vite 可以访问 node_modules 中的文件
      allow: ['..']
    }
  }
})