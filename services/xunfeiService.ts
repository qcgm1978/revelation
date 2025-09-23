import { generatePrompt } from './llmService'
import request_xunfei from './xunfei'

export async function* streamDefinition (
  topic: string,
  language: 'zh' | 'en' = 'zh',
  category?: string,
  context?: string
): AsyncGenerator<string, void, undefined> {
  try {
    const prompt = generatePrompt(topic, language, category, context)

    const reader = await request_xunfei(
      localStorage.getItem('XUNFEI_API_KEY') ||
        import.meta.env.VITE_XUNFEI_API_KEY ||
        '',
      localStorage.getItem('XUNFEI_API_SECRET') ||
        import.meta.env.VITE_XUNFEI_API_SECRET ||
        '',
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
                  yield accumulatedContent
                  accumulatedContent = ''
                  await new Promise(resolve => setTimeout(resolve, 30))
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

    const errorPrefix = language === 'zh'
      ? `无法为"${topic}"生成内容: `
      : `Could not generate content for "${topic}": `
    yield `Error: ${errorPrefix}无法连接到讯飞API`
    throw new Error('无法连接到讯飞API')
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.'
    const errorPrefix = language === 'zh'
      ? `无法为"${topic}"生成内容: `
      : `Could not generate content for "${topic}": `
    yield `Error: ${errorPrefix}${errorMessage}`
    throw new Error(errorMessage)
  }
}
