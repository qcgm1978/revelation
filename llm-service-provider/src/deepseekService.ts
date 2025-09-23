import { generatePrompt } from './llmService'

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'
const DEEPSEEK_MODEL = 'deepseek-chat'

function getApiKey (): string | undefined {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedApiKey = localStorage.getItem('DEEPSEEK_API_KEY')
      if (savedApiKey) {
        return savedApiKey
      }
    }

    if (typeof process !== 'undefined' && process.env) {
      return process.env.DEEPSEEK_API_KEY
    }
  } catch (e) {
    console.error('Error getting DeepSeek API key:', e)
  }

  return undefined
}

export async function* streamDefinition (
  topic: string,
  language: 'zh' | 'en' = 'zh',
  category?: string,
  context?: string
): AsyncGenerator<string, void, undefined> {
  const apiKey = getApiKey()
  let accumulatedContent = ''
  if (!apiKey) {
    const errorMsg = 
      language === 'zh'
        ? 'Error: DEEPSEEK_API_KEY is not configured. Please configure your API key in the settings to continue.'
        : 'Error: DEEPSEEK_API_KEY is not configured. Please configure your API key in the settings to continue.'
    yield errorMsg
    return
  }

  const prompt = generatePrompt(topic, language, category, context)
  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: true,
        max_tokens: 500,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('Response body is not readable')
    }

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
              break
            }

            try {
              const parsed = JSON.parse(data)
              if (parsed.choices?.[0]?.delta?.content) {
                accumulatedContent += parsed.choices[0].delta.content
                yield accumulatedContent
                accumulatedContent = ''
              }
            } catch (e) {
              console.error('Error parsing DeepSeek response:', e)
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    const errorPrefix = language === 'zh'
      ? `无法为"${topic}"生成内容: `
      : `Could not generate content for "${topic}": `
    yield `Error: ${errorPrefix}${errorMessage}`
  }
}