import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// 读取config.ts文件获取应用名称配置
let appConfig = { zh: '钱文忠说佛——开解人生困惑的觉悟指南', en: 'Money Talks Buddhism - Awakening to Understanding' }
try {
  const configPath = path.resolve(__dirname, 'config.ts')
  const configContent = fs.readFileSync(configPath, 'utf-8')
  
  // 提取appNames配置
  const appNamesMatch = configContent.match(/export const appNames = (\{[^\}]+\})/)
  if (appNamesMatch && appNamesMatch[1]) {
    // 安全地执行配置解析
    const appNamesStr = appNamesMatch[1].replace(/'/g, '"')
    try {
      appConfig = JSON.parse(appNamesStr)
    } catch (jsonError) {
      console.warn('Failed to parse appNames from config.ts, using default values')
    }
  }
} catch (error) {
  console.warn('Failed to read config.ts, using default app names')
}

// 设置环境变量，这样Vite的HTML插件可以正确替换HTML文件中的变量
process.env.VITE_APP_NAME_ZH = appConfig.zh || '启示路'
process.env.VITE_APP_NAME_EN = appConfig.en || 'Revelation'

export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    base: '', 
    plugins: [react()],
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      cacheDir: false 
    },
    optimizeDeps: {
      force: true // 强制重新优化依赖
    },
    server: {
      fs: {
        // 确保 Vite 可以访问 node_modules 中的文件
        allow: ['..']
      }
    },
    define: {
      // 定义构建时可用的全局变量
      'VITE_APP_NAME_ZH': JSON.stringify(appConfig.zh || '启示路'),
      'VITE_APP_NAME_EN': JSON.stringify(appConfig.en || 'Revelation')
    }
  }
})