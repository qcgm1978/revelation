// https://openrouter.ai/models
import { generatePrompt } from './wikiService'
import request_xunfei from './xunfei'

export async function* streamDefinition (
  topic: string,
  language: 'zh' | 'en' = 'zh',
  category?: string,
  context?: string
): AsyncGenerator<string, void, undefined> {
  try {
    const prompt = generatePrompt(topic, language, category, context)
    
    // 尝试调用讯飞API
    const reader = await request_xunfei(
      'M2IwOGJlNTc0MzE1ODc3Mzc2Y2FlZjI4',
      '4a9ae31f567d8dc05a378786518bda5d',
      'wss://spark-api.xf-yun.com/v1/x1',
      prompt
    )

    let accumulatedContent = ''

    if (reader) {
      const decoder = new TextDecoder()
      let buffer = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') {
                if (accumulatedContent) {
                  yield accumulatedContent
                  accumulatedContent = ''
                }
                return
              }

              try {
                const parsed = JSON.parse(data)
                if (parsed.choices?.[0]?.delta?.content) {
                  accumulatedContent += parsed.choices[0].delta.content
                  if (accumulatedContent.length >= 30) {
                    yield accumulatedContent
                    accumulatedContent = ''
                  }
                }
              } catch (e) {}
            }
          }
        }
      } finally {
        if (accumulatedContent) {
          yield accumulatedContent
        }
        reader.releaseLock()
      }
      return
    }

    // 如果讯飞API调用失败或返回null，则使用维基百科API备选方案
    const containsChinese = /[一-龥]/.test(topic)

    const baseUrl = language === 'zh' && containsChinese ? 'https://zh.wikipedia.org/w/api.php' : 'https://en.wikipedia.org/w/api.php'

    const freeProxies = [
      'https://api.allorigins.win/raw?url=',
      'https://cors-anywhere.herokuapp.com/',
      'https://proxy.cors.sh/'
    ]

    let finalUrl = baseUrl
    let response
    let currentProxyIndex = -1
    let attempts = 0
    const maxAttempts = freeProxies.length + 1

    while (attempts < maxAttempts) {
      try {
        if (attempts > 0) {
          currentProxyIndex = attempts - 1
          finalUrl = freeProxies[currentProxyIndex] + encodeURIComponent(baseUrl)
        }

        const params = new URLSearchParams({
          action: 'query',
          format: 'json',
          titles: topic,
          prop: 'extracts',
          exintro: 'true',
          explaintext: 'true',
          origin: '*'
        })

        const url = finalUrl + (attempts > 0 ? '' : '?' + params.toString())
        response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36'
          },
          timeout: 15000
        })

        if (response.ok) {
          break
        }
      } catch (error) {
        console.log(`连接尝试 ${attempts + 1} 失败:`, error)
      }
      attempts++
    }

    if (!response || !response.ok) {
      throw new Error(`无法连接到维基百科API，尝试了${attempts}种方式`)
    }

    let data
    try {
      if (currentProxyIndex >= 0) {
        const text = await response.text()
        data = JSON.parse(text)
      } else {
        data = await response.json()
      }
    } catch (jsonError) {
      console.error('解析响应JSON失败:', jsonError)
      throw new Error('解析维基百科响应失败')
    }

    let content = ''
    const pages = data.query?.pages || {}
    const pageId = Object.keys(pages)[0]

    if (pageId && pages[pageId].extract) {
      content = pages[pageId].extract
      const firstParagraph = content
      if (firstParagraph) {
        content = firstParagraph
      }
    }

    if (!content) {
      content = language === 'zh' ? `抱歉，未能找到关于"${topic}"的信息。请尝试其他关键词。` : `Sorry, no information found for "${topic}". Please try another keyword.`
    }

    const chunkSize = 30
    for (let i = 0; i < content.length; i += chunkSize) {
      yield content.slice(i, i + chunkSize)
      await new Promise(resolve => setTimeout(resolve, 30))
    }
  } catch (error) {
    console.error('Error fetching from free wiki service:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.'
    const errorPrefix = language === 'zh' ? `无法为"${topic}"生成内容: ` : `Could not generate content for "${topic}": `
    yield `Error: ${errorPrefix}${errorMessage}`
    throw new Error(errorMessage)
  }
}
