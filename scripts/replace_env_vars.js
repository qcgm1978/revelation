#!/usr/bin/env node
// 构建后脚本，用于替换public目录下HTML文件中的环境变量

import fs from 'fs';
import path from 'path';

// 读取config.ts文件获取应用名称配置
function getAppConfig() {
  try {
    const configPath = path.resolve(process.cwd(), 'config.ts');
    const configContent = fs.readFileSync(configPath, 'utf-8');
    
    // 更直接的方法：使用简单的正则表达式直接提取zh和en的值
    // 这个正则表达式会匹配zh:后面的字符串，考虑了可能的空格和引号
    const zhRegex = /zh:\s*["']([^"']+)['"]/;
    const enRegex = /en:\s*["']([^"']+)['"]/;
    
    const zhMatch = configContent.match(zhRegex);
    const enMatch = configContent.match(enRegex);
    
    if (zhMatch && enMatch) {
      const config = {
        zh: zhMatch[1],
        en: enMatch[1]
      };
      console.log('Successfully parsed appNames from config.ts:', config);
      return config;
    } else if (zhMatch) {
      console.log('Found zh value in config.ts, using default for en');
      return { zh: zhMatch[1], en: 'Revelation' };
    } else if (enMatch) {
      console.log('Found en value in config.ts, using default for zh');
      return { zh: '启示路', en: enMatch[1] };
    } else {
      console.warn('Could not find zh or en values in config.ts');
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
