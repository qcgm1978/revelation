#!/usr/bin/env node
import { formatFileContent } from './fileFormatter';
import * as readline from 'readline';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * 交互式命令行工具，用于格式化上传的文件
 * 提供简单的界面让用户选择上传的文件并进行格式化
 */

// 创建读取行接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * 提示用户输入
 * @param question 要问用户的问题
 * @returns 用户的回答
 */
function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

/**
 * 检查文件是否存在
 * @param filePath 文件路径
 * @returns 文件是否存在
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.stat(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * 交互式格式化上传的文件
 */
async function interactiveFormat() {
  console.log('===== 文件格式化工具 =====');
  // 修改欢迎信息以明确支持TXT格式
  console.log('此工具将帮助您格式化上传的文件（支持TXT等纯文本格式），使其符合项目要求的JSON格式。\n');
  
  try {
    // 获取用户输入的文件路径
    let inputFilePath = await askQuestion('请输入要格式化的文件路径: ');
    inputFilePath = inputFilePath.trim();
    
    // 检查文件是否存在
    if (!await fileExists(inputFilePath)) {
      console.error(`错误: 文件 "${inputFilePath}" 不存在。`);
      rl.close();
      return;
    }
    
    // 获取输出文件路径
    const defaultOutputPath = path.join(
      path.dirname(inputFilePath), 
      `${path.basename(inputFilePath, path.extname(inputFilePath))}_formatted.json`
    );
    
    const outputPath = await askQuestion(`请输入输出文件路径 [${defaultOutputPath}]: `);
    const finalOutputPath = outputPath.trim() || defaultOutputPath;
    
    console.log('\n开始格式化文件...');
    const startTime = Date.now();
    
    try {
      // 调用格式化函数
      const formattedData = await formatFileContent(inputFilePath, finalOutputPath);
      const endTime = Date.now();
      
      console.log(`\n✅ 格式化成功！耗时: ${endTime - startTime}ms`);
      console.log(`结果已保存到: ${finalOutputPath}`);
      
      // 显示结果预览
      console.log('\n格式化结果预览:');
      console.log(JSON.stringify(formattedData, null, 2).substring(0, 500) + '...');
      
      // 检查是否设置了API密钥环境变量
      if (!process.env.GEMINI_API_KEY) {
        console.log('\n⚠️  提示: 建议设置GEMINI_API_KEY环境变量来提供API密钥，而不是使用代码中的默认值。');
        console.log('设置方法: export GEMINI_API_KEY=your-actual-api-key');
      }
      
    } catch (formatError) {
      console.error('\n❌ 格式化过程中出错:', formatError);
      console.log('\n💡 可能的解决方案:');
      console.log('1. 确保您有有效的Google Gemini API密钥');
      console.log('2. 通过环境变量设置API密钥: export GEMINI_API_KEY=your-actual-api-key');
      // 修改错误提示中的文件格式说明
      console.log('3. 检查输入文件的格式是否符合预期（支持TXT等纯文本格式）');
    }
    
  } catch (error) {
    console.error('程序执行出错:', error);
  } finally {
    rl.close();
  }
}

// 运行交互式格式化工具
interactiveFormat();