import { formatFileContent } from './fileFormatter';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * 创建一个示例文件并使用fileFormatter工具进行格式化
 * 这个脚本展示了如何在实际项目中使用我们创建的文件格式化工具
 */
async function runFormatExample() {
  try {
    // 创建一个临时的示例文件
    const exampleFilePath = path.join(__dirname, 'example_content.txt');
    const outputFilePath = path.join(__dirname, 'example_formatted.json');
    
    // 示例文件内容 - 模拟用户可能上传的文件
    const exampleContent = `心理
- 投射 (p59)
- 童年 (p59)
- 婴儿期原始自恋 (p61, p63)
- 回归 (p62, p74)

科学
- 牛一 (p61)
- 地圆说 (p63)
- 宇宙膨胀说 (p63, p179)

历史
- 文艺复兴 (p100)
- 工业革命 (p120)
`;
    
    // 写入示例文件
    await fs.writeFile(exampleFilePath, exampleContent, 'utf-8');
    console.log(`已创建示例文件: ${exampleFilePath}`);
    
    // 使用fileFormatter工具格式化文件
    console.log('开始格式化文件...');
    const startTime = Date.now();
    
    try {
      const formattedData = await formatFileContent(exampleFilePath, outputFilePath);
      const endTime = Date.now();
      
      console.log(`格式化完成，耗时: ${endTime - startTime}ms`);
      console.log('格式化结果预览:');
      console.log(JSON.stringify(formattedData, null, 2).substring(0, 500) + '...');
      console.log(`完整结果已保存到: ${outputFilePath}`);
      
      // 检查输出文件是否存在
      const fileExists = await fs.stat(outputFilePath).then(() => true).catch(() => false);
      if (fileExists) {
        console.log('输出文件创建成功！');
        
        // 读取并显示输出文件的内容
        const outputContent = await fs.readFile(outputFilePath, 'utf-8');
        console.log('\n输出文件内容:');
        console.log(outputContent);
      } else {
        console.error('错误: 输出文件未创建');
      }
      
    } catch (formatError) {
      console.error('格式化过程中出错:', formatError);
      console.log('\n提示: 如果是API密钥问题，请设置环境变量:');
      console.log('export GEMINI_API_KEY=your-actual-api-key');
      console.log('然后重新运行此脚本。');
    }
    
  } catch (error) {
    console.error('示例运行失败:', error);
  }
}

// 运行示例
runFormatExample();