import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '',  // 使用相对路径
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})