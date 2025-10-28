#!/usr/bin/env node

/**
 * 图片自动生成脚本
 * 用于根据配置从源图片生成不同尺寸的图片
 */

// 使用ES模块语法
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// 获取当前文件和目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 异步加载sharp并执行主函数
async function main() {
  try {
    // 动态导入sharp
    const sharpModule = await import('sharp');
    sharp = sharpModule.default;
    
    // 加载配置
    config = await loadConfig();
    
    // 生成图片
    await generateImages();
    
    console.log('图片生成脚本执行完毕');
  } catch (error) {
    console.error(`脚本执行失败: ${error.message}`);
    process.exit(1);
  }
}

// 检查是否安装了必要的依赖
let sharp;
try {
  // 启动主函数
  main().catch(error => {
    console.error('错误: 执行脚本时发生异常');
    console.error(error);
    process.exit(1);
  });
} catch (error) {
  console.error('错误: 启动脚本失败');
  console.error(error);
  process.exit(1);
}

// 获取配置文件
let config;
async function loadConfig() {
  try {
    // 简化配置加载，直接从TypeScript文件中提取需要的信息
    const configPath = path.resolve(__dirname, '../config.ts');
    
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf8');
      
      // 提取SOURCE_IMAGE_PATH常量
      const sourceImagePathMatch = configContent.match(/export\s+const\s+SOURCE_IMAGE_PATH\s*=\s*['"`](.*?)['"`];/);
      const sourceImagePath = sourceImagePathMatch ? sourceImagePathMatch[1] : '/buddha.jpg';
      console.log(`成功提取SOURCE_IMAGE_PATH: ${sourceImagePath}`);
      
      // 提取imageGenerationConfig
      const imageGenConfigMatch = configContent.match(/export\s+const\s+imageGenerationConfig\s*=\s*([\s\S]*?);\s*(?:export|$)/);
      
      // 创建基本配置对象
      config = {
        sourceImage: {
          path: sourceImagePath,
          minSize: 512
        },
        generation: {
          enabled: true,
          format: 'png',
          outputDir: '/assets/android', // 与config.ts保持一致
          sizes: [],
          quality: 1.0,
          preserveAspectRatio: true,
          backgroundColor: '#FFFFFF'
        }
      };
      
      // 如果找到了imageGenerationConfig，尝试解析它
      if (imageGenConfigMatch) {
        try {
          // 清理配置字符串以便安全解析
          const cleanedConfigStr = imageGenConfigMatch[1]
            .replace(/\/\/.*$/gm, '') // 移除单行注释
            .replace(/\/\*[\s\S]*?\*\//g, '') // 移除多行注释
            .replace(/,\s*}/g, '}') // 移除尾随逗号
            .replace(/,\s*]/g, ']');
          
          const parsedConfig = new Function(`return ${cleanedConfigStr}`)();
          
          // 合并解析的配置
          if (parsedConfig.sourceImage) {
            config.sourceImage = { ...config.sourceImage, ...parsedConfig.sourceImage };
          }
          if (parsedConfig.generation) {
            config.generation = { ...config.generation, ...parsedConfig.generation };
          }
          
          console.log('成功解析imageGenerationConfig');
        } catch (parseError) {
          console.warn('解析imageGenerationConfig失败，使用基本配置');
        }
      }
      
      // 如果没有指定sizes，使用默认尺寸
      if (!config.generation.sizes || config.generation.sizes.length === 0) {
        config.generation.sizes = [
          { width: 36, height: 36, suffix: '36x36' },
          { width: 48, height: 48, suffix: '48x48' },
          { width: 72, height: 72, suffix: '72x72' },
          { width: 96, height: 96, suffix: '96x96' },
          { width: 144, height: 144, suffix: '144x144' },
          { width: 180, height: 180, suffix: '180x180' },
          { width: 192, height: 192, suffix: '192x192' },
          { width: 216, height: 216, suffix: '216x216' },
          { width: 512, height: 512, suffix: '512x512' }
        ];
      }
      
      console.log('成功加载配置文件');
      return config;
    }
    
    console.warn('未找到配置文件，使用默认配置');
    
    // 使用默认配置，优先使用/buddha.jpg作为源图片
      config = {
        sourceImage: {
          path: '/buddha.jpg',
          minSize: 512
        },
        generation: {
          enabled: true,
          format: 'png',
          outputDir: '/assets/android', // 与config.ts保持一致
          sizes: [
            { width: 36, height: 36, suffix: '36x36' },
            { width: 48, height: 48, suffix: '48x48' },
            { width: 72, height: 72, suffix: '72x72' },
            { width: 96, height: 96, suffix: '96x96' },
            { width: 144, height: 144, suffix: '144x144' },
            { width: 180, height: 180, suffix: '180x180' },
            { width: 192, height: 192, suffix: '192x192' },
            { width: 216, height: 216, suffix: '216x216' },
            { width: 512, height: 512, suffix: '512x512' }
          ],
          quality: 1.0,
          preserveAspectRatio: true,
          backgroundColor: '#FFFFFF'
        }
      };
    return config;
    
    // 函数已经在前面返回了配置，这里不再需要后续代码
      return config;
    
  } catch (error) {
    console.error(`加载配置文件失败: ${error.message}`);
    
    // 使用默认配置作为后备
    console.log('使用默认配置...');
    config = {
      sourceImage: {
        path: '/assets/android/icon_512x512.png',
        minSize: 512
      },
      generation: {
        enabled: true,
        format: 'png',
        outputDir: '/assets/android',
        sizes: [
          { width: 36, height: 36, suffix: '36x36' },
          { width: 48, height: 48, suffix: '48x48' },
          { width: 72, height: 72, suffix: '72x72' },
          { width: 96, height: 96, suffix: '96x96' },
          { width: 144, height: 144, suffix: '144x144' },
          { width: 180, height: 180, suffix: '180x180' },
          { width: 192, height: 192, suffix: '192x192' },
          { width: 216, height: 216, suffix: '216x216' },
          { width: 512, height: 512, suffix: '512x512' }
        ],
        quality: 1.0,
        preserveAspectRatio: true,
        backgroundColor: '#FFFFFF'
      }
    };
    return config;
  }
}

/**
 * 生成不同尺寸的图片
 */
async function generateImages() {
  if (!config) {
    console.error('配置未加载');
    return;
  }
  
  if (!config.generation.enabled) {
    console.log('图片自动生成功能已禁用');
    return;
  }

  // 处理输出目录路径 - 直接输出到assets/android目录
  const outputDir = path.resolve(process.cwd(), 'assets', 'android');
  console.log(`设置输出目录为: ${outputDir}`);
  
  // 确保输出目录存在
  if (!fs.existsSync(outputDir)) {
    console.log(`创建输出目录: ${outputDir}`);
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 查找源图片 - 重点处理public目录下的图片
  const sourceImagePath = config.sourceImage.path;
  console.log(`配置的源图片路径: ${sourceImagePath}`);
  
  // 构建可能的源图片路径，优先检查public目录
  const possibleSourcePaths = [
    // 直接路径 (绝对路径或相对路径)
    path.resolve(__dirname, '..', sourceImagePath),
    // public目录下的路径 (最优先)
    path.resolve(__dirname, '..', 'public', sourceImagePath),
    // 移除前导斜杠再尝试public目录
    sourceImagePath.startsWith('/') ? path.resolve(__dirname, '..', 'public', sourceImagePath.substring(1)) : null,
    // 其他可能的目录
    path.resolve(__dirname, '..', 'src', sourceImagePath),
    path.resolve(__dirname, '..', 'assets', sourceImagePath)
  ].filter(Boolean); // 过滤掉null值

  console.log('尝试查找源图片的路径:');
  possibleSourcePaths.forEach(path => console.log(`  - ${path}`));

  let sourceImageFile = null;
  for (const possiblePath of possibleSourcePaths) {
    if (fs.existsSync(possiblePath)) {
      sourceImageFile = possiblePath;
      break;
    }
  }

  if (!sourceImageFile) {
    console.error(`错误: 源图片不存在于以下路径:`);
    possibleSourcePaths.forEach(path => console.error(`  - ${path}`));
    return;
  }

  console.log(`✓ 成功找到源图片: ${sourceImageFile}`);

  try {
    // 加载源图片
    const image = await sharp(sourceImageFile);
    
    // 获取图片信息
    const metadata = await image.metadata();
    console.log(`源图片信息: ${metadata.width}x${metadata.height}px, 格式: ${metadata.format}`);
    
    // 检查源图片尺寸是否满足最小要求
    const minSize = config.sourceImage.minSize || 512;
    if (metadata.width < minSize || metadata.height < minSize) {
      console.warn(`警告: 源图片尺寸 (${metadata.width}x${metadata.height}) 小于最小要求 ${minSize}x${minSize}`);
    }
    
    // 使用配置中的尺寸或默认尺寸
    const sizes = config.generation.sizes && config.generation.sizes.length > 0 
      ? config.generation.sizes 
      : [
          { width: 36, height: 36, suffix: '36x36' },
          { width: 48, height: 48, suffix: '48x48' },
          { width: 72, height: 72, suffix: '72x72' },
          { width: 96, height: 96, suffix: '96x96' },
          { width: 144, height: 144, suffix: '144x144' },
          { width: 180, height: 180, suffix: '180x180' },
          { width: 192, height: 192, suffix: '192x192' },
          { width: 216, height: 216, suffix: '216x216' },
          { width: 512, height: 512, suffix: '512x512' }
        ];
    
    // 生成不同尺寸的图片
    let successCount = 0;
    let errorCount = 0;
    
    console.log('开始生成图片...');
    for (const size of sizes) {
      try {
        // 确保size对象有必要的属性
        if (!size.width || !size.height) {
          console.warn(`跳过无效尺寸配置: ${JSON.stringify(size)}`);
          continue;
        }
        
        // 生成输出文件名
        const fileName = size.name || `icon_${size.suffix || `${size.width}x${size.height}`}`;
        const outputPath = path.join(outputDir, `${fileName}.${config.generation.format || 'png'}`);
        
        // 设置输出选项
        const outputOptions = {};
        if (config.generation.quality !== undefined) {
          outputOptions.quality = Math.round(config.generation.quality * 100); // sharp使用0-100的值
        }
        
        // 处理图片 - 为每个尺寸创建新的sharp实例
        const resizeOptions = {
          width: size.width,
          height: size.height,
          fit: config.generation.preserveAspectRatio !== false ? 'cover' : 'fill'
        };
        
        // 如果需要背景色且使用cover/fill模式，添加背景色
        if (config.generation.backgroundColor && ['cover', 'fill'].includes(resizeOptions.fit)) {
          resizeOptions.background = config.generation.backgroundColor;
        }
        
        // 处理图片并输出
        const processedImage = await sharp(sourceImageFile).resize(resizeOptions);
        
        // 根据格式输出图片
        const format = (config.generation.format || 'png').toLowerCase();
        if (format === 'png') {
          await processedImage.png(outputOptions).toFile(outputPath);
        } else if (['jpg', 'jpeg'].includes(format)) {
          await processedImage.jpeg(outputOptions).toFile(outputPath);
        } else {
          // 默认使用png格式
          await processedImage.png(outputOptions).toFile(outputPath);
        }
        
        console.log(`✓ 生成图片: ${fileName}`);
        successCount++;
        
      } catch (err) {
        console.error(`✗ 生成图片失败 (${size.width}x${size.height}): ${err.message}`);
        errorCount++;
      }
    }
    
    console.log(`图片生成完成: 成功 ${successCount}, 失败 ${errorCount}`);
    
  } catch (error) {
    console.error(`处理图片时发生错误: ${error.message}`);
    // 输出更详细的错误信息以便调试
    if (error.stack) {
      console.error(error.stack);
    }
    return;
  }
}

// 添加帮助功能到我们的main函数中
async function enhancedMain() {
  try {
    // 检查命令行参数
    const args = process.argv.slice(2);
    if (args.includes('help') || args.includes('-h') || args.includes('--help')) {
      console.log('图片自动生成工具');
      console.log('\n用法:');
      console.log('  node generate_images.js       - 生成所有配置的图片尺寸');
      console.log('  node generate_images.js help  - 显示此帮助信息');
      console.log('\n注意: 需要安装sharp依赖: npm install sharp --save-dev');
      return;
    }
    
    // 动态导入sharp
    const sharpModule = await import('sharp');
    sharp = sharpModule.default;
    
    // 加载配置
    config = await loadConfig();
    
    // 生成图片
    await generateImages();
    
    console.log('图片生成脚本执行完毕');
  } catch (error) {
    console.error(`脚本执行失败: ${error.message}`);
    process.exit(1);
  }
}

// 替换原来的main函数
main = enhancedMain;

// 初始化代码 - 仅在直接运行此脚本时执行
if (import.meta.url === new URL(process.argv[1], import.meta.url).href) {
  enhancedMain().catch(error => {
    console.error('错误: 执行脚本时发生异常');
    console.error(error);
    process.exit(1);
  });
}