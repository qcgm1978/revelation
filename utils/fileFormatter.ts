import {
  extract,
  ExampleData,
  Document,
  AnnotatedDocument,
  FormatType
} from 'langextract'
import * as fs from 'fs/promises'
import * as path from 'path'

/**
 * 使用langextract库从文件内容中提取结构化信息，并将其格式化为符合项目要求的JSON格式
 * @param filePath 要处理的文件路径
 * @param outputPath 输出JSON文件的路径
 * @returns 格式化后的JSON数据
 */
async function formatFileContent (
  filePath: string,
  outputPath?: string
): Promise<Record<string, Array<{ term: string; pages: string[] }>>> {
  try {
    // 读取文件内容
    const fileContent = await fs.readFile(filePath, 'utf-8')
    console.log(`正在处理文件: ${filePath}`)

    // 定义提取示例，指导模型如何提取分类、术语和页码
    const examples: ExampleData[] = [
      {
        text: '心理\n- 投射 (p59)\n- 童年 (p59)\n科学\n- 牛一 (p61)\n- 地圆说 (p63)',
        extractions: [
          {
            extractionClass: 'category',
            extractionText: '心理',
            attributes: {
              terms: JSON.stringify([
                { term: '投射', pages: ['p59'] },
                { term: '童年', pages: ['p59'] }
              ])
            }
          },
          {
            extractionClass: 'category',
            extractionText: '科学',
            attributes: {
              terms: JSON.stringify([
                { term: '牛一', pages: ['p61'] },
                { term: '地圆说', pages: ['p63'] }
              ])
            }
          }
        ]
      }
    ]

    // 准备文档对象
    const document: Document = {
      text: fileContent,
      documentId: path.basename(filePath)
    }

    // 使用langextract提取结构化信息
    const result = await extract(document, {
      promptDescription:
        '从文档中提取分类、术语和对应的页码，将每个分类下的术语整理成数组格式',
      examples: examples,
      modelType: 'gemini',
      apiKey: process.env.GEMINI_API_KEY || 'your-gemini-api-key', // 建议从环境变量获取API密钥
      modelId: 'gemini-2.5-flash',
      formatType: FormatType.JSON
    })

    // 处理提取结果
    const formattedResult: Record<
      string,
      Array<{ term: string; pages: string[] }>
    > = {}

    // 处理可能是单个文档或文档数组的情况
    const documents: AnnotatedDocument[] = Array.isArray(result)
      ? result
      : [result]

    documents.forEach(doc => {
      if (doc.extractions) {
        doc.extractions.forEach(extraction => {
          if (
            extraction.extractionClass === 'category' &&
            extraction.attributes?.terms
          ) {
            try {
              // 解析attributes中的terms JSON字符串
              // 处理terms可能是字符串或字符串数组的情况
              let termsString = extraction.attributes.terms
              if (Array.isArray(termsString)) {
                // 如果是数组，将其转换为JSON字符串
                termsString = JSON.stringify(termsString)
              }
              const terms = JSON.parse(termsString)
              formattedResult[extraction.extractionText] = terms
            } catch (error) {
              console.warn(`解析术语数据失败: ${error}`)
              // 如果解析失败，尝试直接使用提取的文本
              formattedResult[extraction.extractionText] = [
                { term: extraction.extractionText, pages: ['unknown'] }
              ]
            }
          }
        })
      }
    })

    // 如果没有提取到结果，提供一个基本的格式化结构
    if (Object.keys(formattedResult).length === 0) {
      console.warn('没有提取到结构化信息，使用基本格式化结构')
      // 简单的备用格式化逻辑
      const basicCategories = categorizeContent(fileContent)
      Object.assign(formattedResult, basicCategories)
    }

    // 如果指定了输出路径，将结果保存为JSON文件
    if (outputPath) {
      await fs.writeFile(
        outputPath,
        JSON.stringify(formattedResult, null, 2),
        'utf-8'
      )
      console.log(`已将格式化结果保存到: ${outputPath}`)
    }

    return formattedResult
  } catch (error) {
    console.error(`处理文件时出错: ${error}`)
    throw error
  }
}

/**
 * 备用的基本文本分类和格式化逻辑
 * @param content 文件内容
 * @returns 格式化后的基本结构
 */
function categorizeContent (
  content: string
): Record<string, Array<{ term: string; pages: string[] }>> {
  const result: Record<string, Array<{ term: string; pages: string[] }>> = {}

  // 示例：简单的文本分割和分类逻辑
  const lines = content.split('\n')
  let currentCategory = '未分类'

  lines.forEach(line => {
    const trimmedLine = line.trim()
    if (!trimmedLine) return

    // 检查是否是新的分类（假设以标题形式出现）
    if (
      /^[#*]+\s+/.test(trimmedLine) ||
      /^[\u4e00-\u9fa5]+$/.test(trimmedLine.replace(/[^\u4e00-\u9fa5]/g, ''))
    ) {
      currentCategory = trimmedLine.replace(/^[#*]+\s+/, '').trim()
      if (!result[currentCategory]) {
        result[currentCategory] = []
      }
    } else if (trimmedLine) {
      // 尝试提取术语和页码
      let term = trimmedLine
      let pageMatch = trimmedLine.match(/\((p\d+)\)/)
      let pages: string[] = []

      if (pageMatch) {
        pages = [pageMatch[1]]
        term = trimmedLine.replace(/\s*\(p\d+\)\s*$/, '').trim()
      }

      if (!result[currentCategory]) {
        result[currentCategory] = []
      }

      result[currentCategory].push({ term, pages })
    }
  })

  return result
}

/**
 * 主函数，用于处理命令行参数
 */
async function main () {
  const args = process.argv.slice(2)
  const inputFile = args[0]
  const outputFile =
    args[1] ||
    path.join(
      path.dirname(inputFile),
      `${path.basename(inputFile, path.extname(inputFile))}_formatted.json`
    )

  if (!inputFile) {
    console.log('用法: node fileFormatter.js <输入文件路径> [输出文件路径]')
    process.exit(1)
  }

  try {
    await formatFileContent(inputFile, outputFile)
  } catch (error) {
    console.error('处理文件失败', error)
    process.exit(1)
  }
}

// 如果直接运行此脚本，则执行主函数
// if (require.main === module) {
//   main();
// }

export { formatFileContent }

// Add new function for in-memory content processing
export async function formatFileContentFromString (
  content: string
): Promise<Record<string, Array<{ term: string; pages: string[] }>>> {
  try {
    // Modified logic using content directly instead of file path
    const examples: ExampleData[] = [
      {
        text: '心理\n- 投射 (p59)\n- 童年 (p59)\n科学\n- 牛一 (p61)\n- 地圆说 (p63)',
        extractions: [
          {
            extractionClass: 'category',
            extractionText: '心理',
            attributes: {
              terms: JSON.stringify([
                { term: '投射', pages: ['p59'] },
                { term: '童年', pages: ['p59'] }
              ])
            }
          },
          {
            extractionClass: 'category',
            extractionText: '科学',
            attributes: {
              terms: JSON.stringify([
                { term: '牛一', pages: ['p61'] },
                { term: '地圆说', pages: ['p63'] }
              ])
            }
          }
        ]
      }
    ]

    // 准备文档对象
    const document: Document = {
      text: content,
      documentId: 'memory-document'
    }
    // const examples1: ExampleData[] = [
    //   {
    //     text: 'John Smith is 30 years old and works at Google.',
    //     extractions: [
    //       {
    //         extractionClass: 'person',
    //         extractionText: 'John Smith',
    //         attributes: {
    //           age: '30',
    //           employer: 'Google'
    //         }
    //       }
    //     ]
    //   }
    // ]

    // // Extract information from text using Gemini
    // const result1 = await extract(
    //   'Alice Johnson is 25 and works at Microsoft.',
    //   {
    //     promptDescription:
    //       'Extract person information including name, age, and employer',
    //     examples: examples1,
    //     modelType: 'gemini',
    //     apiKey: process.env.GEMINI_API_KEY,
    //     modelId: 'gemini-2.5-flash'
    //   }
    // )
    // console.log(result1.extractions)
    const result = await extract(document, {
      promptDescription: 'Extract categories and terms',
      examples: examples,
      modelType: 'gemini',
      apiKey: process.env.GEMINI_API_KEY,
      modelId: 'gemini-2.5-flash',
      formatType: FormatType.JSON
    })

    // 处理提取结果
    const formattedResult: Record<
      string,
      Array<{ term: string; pages: string[] }>
    > = {}

    // 处理可能是单个文档或文档数组的情况
    const documents: AnnotatedDocument[] = Array.isArray(result)
      ? result
      : [result]

    documents.forEach(doc => {
      if (doc.extractions) {
        doc.extractions.forEach(extraction => {
          if (
            extraction.extractionClass === 'category' &&
            extraction.attributes?.terms
          ) {
            try {
              // 解析attributes中的terms JSON字符串
              // 处理terms可能是字符串或字符串数组的情况
              let termsString = extraction.attributes.terms
              if (Array.isArray(termsString)) {
                // 如果是数组，将其转换为JSON字符串
                termsString = JSON.stringify(termsString)
              }
              const terms = JSON.parse(termsString)
              formattedResult[extraction.extractionText] = terms
            } catch (error) {
              console.warn(`解析术语数据失败: ${error}`)
              // 如果解析失败，尝试直接使用提取的文本
              formattedResult[extraction.extractionText] = [
                { term: extraction.extractionText, pages: ['unknown'] }
              ]
            }
          }
        })
      }
    })

    // 如果没有提取到结果，提供一个基本的格式化结构
    if (Object.keys(formattedResult).length === 0) {
      console.warn('没有提取到结构化信息，使用基本格式化结构')
      // 简单的备用格式化逻辑
      const basicCategories = categorizeContent(content)
      Object.assign(formattedResult, basicCategories)
    }

    // // 如果指定了输出路径，将结果保存为JSON文件
    // if (outputPath) {
    //   await fs.writeFile(outputPath, JSON.stringify(formattedResult, null, 2), 'utf-8');
    //   console.log(`已将格式化结果保存到: ${outputPath}`);
    // }

    return formattedResult
  } catch (error) {
    console.error('Error processing content:', error)
    return { Uncategorized: [{ term: content.substring(0, 100), pages: [] }] }
  }
}
