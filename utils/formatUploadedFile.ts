#!/usr/bin/env node
import { formatFileContent } from './fileFormatter';
import * as readline from 'readline';
import * as fs from 'fs/promises';
import * as path from 'path';




const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}


async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.stat(filePath);
    return true;
  } catch {
    return false;
  }
}


async function interactiveFormat() {
  console.log('===== 文件格式化工具 =====');
 
  console.log('此工具将帮助您格式化上传的文件（支持TXT等纯文本格式），使其符合项目要求的JSON格式。\n');
  
  try {
   
    let inputFilePath = await askQuestion('请输入要格式化的文件路径: ');
    inputFilePath = inputFilePath.trim();
    
   
    if (!await fileExists(inputFilePath)) {
      console.error(`错误: 文件 "${inputFilePath}" 不存在。`);
      rl.close();
      return;
    }
    
   
    const defaultOutputPath = path.join(
      path.dirname(inputFilePath), 
      `${path.basename(inputFilePath, path.extname(inputFilePath))}_formatted.json`
    );
    
    const outputPath = await askQuestion(`请输入输出文件路径 [${defaultOutputPath}]: `);
    const finalOutputPath = outputPath.trim() || defaultOutputPath;
    
    console.log('\n开始格式化文件...');
    const startTime = Date.now();
    
    try {
     
      const formattedData = await formatFileContent(inputFilePath, finalOutputPath);
      const endTime = Date.now();
      
      console.log(`\n✅ 格式化成功！耗时: ${endTime - startTime}ms`);
      console.log(`结果已保存到: ${finalOutputPath}`);
      
     
      console.log('\n格式化结果预览:');
      console.log(JSON.stringify(formattedData, null, 2).substring(0, 500) + '...');
      
     
      if (!process.env.GEMINI_API_KEY) {
        console.log('\n⚠️  提示: 建议设置GEMINI_API_KEY环境变量来提供API密钥，而不是使用代码中的默认值。');
        console.log('设置方法: export GEMINI_API_KEY=your-actual-api-key');
      }
      
    } catch (formatError) {
      console.error('\n❌ 格式化过程中出错:', formatError);
      console.log('\n💡 可能的解决方案:');
      console.log('1. 确保您有有效的Google Gemini API密钥');
      console.log('2. 通过环境变量设置API密钥: export GEMINI_API_KEY=your-actual-api-key');
     
      console.log('3. 检查输入文件的格式是否符合预期（支持TXT等纯文本格式）');
    }
    
  } catch (error) {
    console.error('程序执行出错:', error);
  } finally {
    rl.close();
  }
}


interactiveFormat();