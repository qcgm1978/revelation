import {
  extract,
  ExampleData,
  Document,
  AnnotatedDocument,
  FormatType
} from 'langextract'
import * as fs from 'fs/promises'
import * as path from 'path'


async function formatFileContent (
  filePath: string,
  outputPath?: string
): Promise<Record<string, Array<{ term: string; pages: string[] }>>> {
  try {
   
    const fileContent = await fs.readFile(filePath, 'utf-8')
    console.log(`正在处理文件: ${filePath}`)

   
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

   
    const document: Document = {
      text: fileContent,
      documentId: path.basename(filePath)
    }

   
    const result = await extract(document, {
      promptDescription:
        '从文档中提取分类、术语和对应的页码，将每个分类下的术语整理成数组格式',
      examples: examples,
      modelType: 'gemini',
      apiKey: process.env.GEMINI_API_KEY || 'your-gemini-api-key',
      modelId: 'gemini-2.5-flash',
      formatType: FormatType.JSON
    })

   
    const formattedResult: Record<
      string,
      Array<{ term: string; pages: string[] }>
    > = {}

   
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
             
             
              let termsString = extraction.attributes.terms
              if (Array.isArray(termsString)) {
               
                termsString = JSON.stringify(termsString)
              }
              const terms = JSON.parse(termsString)
              formattedResult[extraction.extractionText] = terms
            } catch (error) {
              console.warn(`解析术语数据失败: ${error}`)
             
              formattedResult[extraction.extractionText] = [
                { term: extraction.extractionText, pages: ['unknown'] }
              ]
            }
          }
        })
      }
    })

   
    if (Object.keys(formattedResult).length === 0) {
      console.warn('没有提取到结构化信息，使用基本格式化结构')
     
      const basicCategories = categorizeContent(fileContent)
      Object.assign(formattedResult, basicCategories)
    }

   
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


function categorizeContent (
  content: string
): Record<string, Array<{ term: string; pages: string[] }>> {
  const result: Record<string, Array<{ term: string; pages: string[] }>> = {}

 
  const lines = content.split('\n')
  let currentCategory = '未分类'

  lines.forEach(line => {
    const trimmedLine = line.trim()
    if (!trimmedLine) return

   
    if (
      /^[#*]+\s+/.test(trimmedLine) ||
      /^[\u4e00-\u9fa5]+$/.test(trimmedLine.replace(/[^\u4e00-\u9fa5]/g, ''))
    ) {
      currentCategory = trimmedLine.replace(/^[#*]+\s+/, '').trim()
      if (!result[currentCategory]) {
        result[currentCategory] = []
      }
    } else if (trimmedLine) {
     
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






export { formatFileContent }


export async function formatFileContentFromString (
  content: string
): Promise<Record<string, Array<{ term: string; pages: string[] }>>> {
  try {
   
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

   
    const document: Document = {
      text: content,
      documentId: 'memory-document'
    }
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   

   
   
   
   
   
   
   
   
   
   
   
   
   
    const result = await extract(document, {
      promptDescription: 'Extract categories and terms',
      examples: examples,
      modelType: 'gemini',
      apiKey: process.env.GEMINI_API_KEY,
      modelId: 'gemini-2.5-flash',
      formatType: FormatType.JSON
    })

   
    const formattedResult: Record<
      string,
      Array<{ term: string; pages: string[] }>
    > = {}

   
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
             
             
              let termsString = extraction.attributes.terms
              if (Array.isArray(termsString)) {
               
                termsString = JSON.stringify(termsString)
              }
              const terms = JSON.parse(termsString)
              formattedResult[extraction.extractionText] = terms
            } catch (error) {
              console.warn(`解析术语数据失败: ${error}`)
             
              formattedResult[extraction.extractionText] = [
                { term: extraction.extractionText, pages: ['unknown'] }
              ]
            }
          }
        })
      }
    })

   
    if (Object.keys(formattedResult).length === 0) {
      console.warn('没有提取到结构化信息，使用基本格式化结构')
     
      const basicCategories = categorizeContent(content)
      Object.assign(formattedResult, basicCategories)
    }

   
   
   
   
   

    return formattedResult
  } catch (error) {
    console.error('Error processing content:', error)
    return { Uncategorized: [{ term: content.substring(0, 100), pages: [] }] }
  }
}
