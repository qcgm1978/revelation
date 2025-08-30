# LangExtract 文件格式化工具集

这个工具集基于 `langextract` 库，帮助您将上传的文件内容提取并格式化为符合项目要求的JSON格式。

## 工具概述

我们创建了以下工具来帮助您处理文件格式化需求：

1. **fileFormatter.ts** - 核心功能模块，提供文件内容提取和格式化的主要功能
2. **formatUploadedFile.ts** - 交互式命令行工具，方便用户直接使用
3. **formatExample.ts** - 示例脚本，展示如何在代码中使用fileFormatter
4. **fileFormatter_README.md** - 详细的使用说明文档

## 功能特点

- 使用Google Gemini模型进行智能文本分析和信息提取
- 支持从各种文本文件中识别分类、术语和对应的页码
- 输出符合项目要求的JSON格式（与public/revelation.json保持一致）
- 提供多种使用方式：命令行调用、代码导入、交互式界面
- 包含备用的基本格式化逻辑，确保在各种情况下都能提供有用的输出

## 快速开始

### 1. 使用交互式工具（最简单的方式）

```bash
# 在项目根目录下运行
./utils/formatUploadedFile.ts
```

然后按照提示输入文件路径，工具会自动处理并生成格式化后的JSON文件。

### 2. 直接运行格式化脚本

```bash
# 基本用法
node --experimental-network-inspection utils/fileFormatter.js <输入文件路径> [输出文件路径]

# 示例
node --experimental-network-inspection utils/fileFormatter.js ./path/to/your/document.txt ./output/formatted.json
```

### 3. 运行示例脚本

```bash
# 运行示例脚本，它会创建一个示例文件并演示格式化过程
node --experimental-network-inspection utils/formatExample.ts
```

## API密钥配置

这些工具使用Google Gemini API进行文本分析。建议通过环境变量设置API密钥：

```bash
# 在运行工具前设置环境变量
export GEMINI_API_KEY=your-actual-api-key
```

## 项目要求的格式

工具输出的JSON格式遵循`public/revelation.json`的结构：

```json
{
  "分类名称1": [
    { "term": "术语1", "pages": ["p123"] },
    { "term": "术语2", "pages": ["p125", "p126"] }
  ],
  "分类名称2": [
    { "term": "术语3", "pages": ["p45"] }
  ]
}
```

## 自定义选项

如果您需要调整信息提取的方式，可以修改`fileFormatter.ts`中的以下部分：

1. **示例数据**：修改`examples`数组，提供更多符合您数据格式的示例
2. **模型配置**：调整`extract`函数的选项，如`modelId`、`temperature`等
3. **备用格式化逻辑**：优化`categorizeContent`函数，以更好地处理您特定格式的文件

## 故障排除

- **API密钥错误**：确保已正确设置`GEMINI_API_KEY`环境变量
- **文件访问错误**：检查文件路径是否正确，以及是否有相应的读写权限
- **格式化结果不理想**：尝试添加更多符合您数据格式的示例到`examples`数组中
- **依赖问题**：确保已安装所有依赖 `npm install`

## 技术细节

这些工具基于以下技术和库：

- **TypeScript**：主要开发语言
- **langextract**：核心信息提取库
- **Google Gemini API**：提供AI文本分析能力
- **Node.js 文件系统 API**：处理文件读写操作

## 扩展建议

如果您需要进一步扩展这些工具的功能，可以考虑：

1. 添加对更多文件格式的支持（如PDF、DOCX等）
2. 实现批处理功能，一次处理多个文件
3. 提供图形用户界面
4. 添加更多配置选项，允许用户自定义提取规则

如有任何问题或建议，请随时提出。祝您使用愉快！