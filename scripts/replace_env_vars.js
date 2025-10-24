#!/usr/bin/env node
// 构建后脚本，用于替换public目录下HTML文件中的环境变量

import fs from 'fs';
import path from 'path';

// 读取config.ts文件获取应用名称配置
function getAppConfig() {
  try {
    const configPath = path.resolve(process.cwd(), 'config.ts');
    const configContent = fs.readFileSync(configPath, 'utf-8');
    
    // 提取appNames配置
    const appNamesMatch = configContent.match(/export const appNames = (\{[^\}]+\})/);
    if (appNamesMatch && appNamesMatch[1]) {
      const appNamesStr = appNamesMatch[1].replace(/'/g, '"');
      return JSON.parse(appNamesStr);
    }
  } catch (error) {
    console.warn('Failed to read config.ts, using default app names');
  }
  
  return { zh: '启示路', en: 'Revelation' };
}

// 替换文件中的环境变量
function replaceEnvVars(filePath, appConfig) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // 替换环境变量
    content = content.replace(/%VITE_APP_NAME_ZH%/g, appConfig.zh || '启示路');
    content = content.replace(/%VITE_APP_NAME_EN%/g, appConfig.en || 'Revelation');
    
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Successfully replaced env vars in ${filePath}`);
  } catch (error) {
    console.error(`Failed to replace env vars in ${filePath}:`, error);
  }
}

// 主函数
function main() {
  const appConfig = getAppConfig();
  const distDir = path.resolve(process.cwd(), 'dist');
  
  // 需要处理的HTML文件列表
  const htmlFiles = ['download.html', 'privacy.html', 'contact.html'];
  
  htmlFiles.forEach(fileName => {
    const filePath = path.join(distDir, fileName);
    if (fs.existsSync(filePath)) {
      replaceEnvVars(filePath, appConfig);
    }
  });
  
  console.log('Environment variable replacement completed.');
}

main();
