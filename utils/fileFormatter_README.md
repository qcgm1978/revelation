# 文件格式化工具使用说明

## 概述

此工具利用`langextract`库从上传的文件中提取结构化信息，并将其格式化为符合项目要求的JSON格式。工具可以自动识别文件中的分类、术语和对应的页码，并按照`revelation.json`的格式进行组织。

## 功能特点

- 使用Google Gemini模型进行智能文本分析和信息提取
- 支持从各种文本文件中识别分类和术语
- 自动提取页码信息
- 输出符合项目要求的JSON格式
- 包含备用的基本格式化逻辑，确保即使在API调用失败时也能提供有用的输出

## 安装依赖

确保您已安装项目的依赖：

```bash
npm install
```

## 使用方法

### 命令行方式

您可以直接在命令行中运行此工具处理文件：

```bash
# 基本用法
node --experimental-network-inspection utils/fileFormatter.js <输入文件路径> [输出文件路径]

# 示例
node --experimental-network-inspection utils/fileFormatter.js ./path/to/your/document.txt ./output/formatted.json
```

如果不提供输出文件路径，工具将在输入文件所在目录创建一个带有`_formatted.json`后缀的文件。

### 作为模块导入

您也可以在其他JavaScript/TypeScript文件中导入并使用此工具：

```javascript
import { formatFileContent } from './utils/fileFormatter';

async function processFile() {
  try {
    const formattedData = await formatFileContent('./path/to/your/document.txt', './output/formatted.json');
    console.log('文件已成功格式化:', formattedData);
  } catch (error) {
    console.error('格式化文件时出错:', error);
  }
}

processFile();
```

## 配置

### API密钥配置

工具使用Google Gemini API进行文本分析。建议通过环境变量设置API密钥：

```bash
# 在运行工具前设置环境变量
export GEMINI_API_KEY=your-actual-api-key

# 然后运行工具
node --experimental-network-inspection utils/fileFormatter.js input.txt
```

如果未设置环境变量，工具将使用代码中默认的占位符（需要手动替换为实际密钥）。

## 自定义提取规则

如果您需要调整信息提取的方式，可以修改`formatFileContent`函数中的`examples`数组，提供更多符合您需求的示例，以指导模型更好地提取结构化信息。

## 处理逻辑说明

1. 读取指定文件的内容
2. 准备示例数据指导模型如何提取信息
3. 调用`langextract`库的`extract`函数，使用Gemini模型分析文本
4. 解析模型返回的结果，转换为符合项目要求的JSON格式
5. 如果指定了输出路径，将结果保存为JSON文件
6. 如果提取失败，使用备用的基本格式化逻辑

## 项目要求的格式说明

工具输出的JSON格式遵循`public/revelation.json`的结构，大致如下：

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

## 注意事项

1. 确保您有有效的Google Gemini API密钥
2. 对于大文件，处理时间可能会有所延长
3. 提取结果的准确性取决于输入文本的清晰度和一致性
4. 在没有网络连接或API调用失败时，工具将使用备用的基本格式化逻辑

## 故障排除

- **API密钥错误**：确保已正确设置`GEMINI_API_KEY`环境变量
- **文件访问错误**：检查输入文件路径是否正确，以及是否有读取权限
- **格式化结果不理想**：尝试添加更多符合您数据格式的示例到`examples`数组中

## 开发说明

如果您想修改或扩展此工具的功能，请参考以下文件：
- `utils/fileFormatter.ts`：主要实现文件
- `node_modules/langextract/dist/index.d.ts`：`langextract`库的类型定义

祝您使用愉快！