import {
  extract,
  ExampleData,
  Document,
  AnnotatedDocument,
  FormatType
} from 'langextract'


function categorizeContent(
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


export async function formatFileContentFromString(
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
              formattedResult[extraction.extractionText] = [
                { term: extraction.extractionText, pages: ['unknown'] }
              ]
            }
          }
        })
      }
    })

    if (Object.keys(formattedResult).length === 0) {
      const basicCategories = categorizeContent(content)
      Object.assign(formattedResult, basicCategories)
    }

    return formattedResult
  } catch (error) {
    return { Uncategorized: [{ term: content.substring(0, 100), pages: [] }] }
  }
}