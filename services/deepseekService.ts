import { generatePrompt } from './llmService'

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'
const DEEPSEEK_MODEL = 'deepseek-chat'

function getApiKey (): string | undefined {
  if (typeof window !== 'undefined' && window.localStorage) {
    const savedApiKey = localStorage.getItem('DEEPSEEK_API_KEY')
    if (savedApiKey) {
      return savedApiKey
    }
  }

  if (typeof process !== 'undefined' && process.env) {
    return process.env.DEEPSEEK_API_KEY
  }

  return undefined
}

export function setApiKey (apiKey: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('DEEPSEEK_API_KEY', apiKey)
  }
}

export function clearApiKey (): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem('DEEPSEEK_API_KEY')
  }
}

export function hasApiKey (): boolean {
  return !!getApiKey()
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
                if (accumulatedContent.length >= 40) {
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
  } catch (error) {
    if (accumulatedContent) {
      yield accumulatedContent
    }
    console.error('Error streaming from DeepSeek:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred.'
    const msg =
      language === 'zh'
        ? `请配置DEEPSEEK_API_KEY`
        : `Please configure DEEPSEEK_API_KEY`
    yield `Error: ${errorMessage}. ${msg}`
    throw new Error(errorMessage)
  }
}

export async function getRandomWord (): Promise<string> {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY is not configured.')
  }

  const prompt = `请生成一个有趣的中文词汇或概念，可以是名词、动词、形容词或专有名词。请只回复词汇或概念本身，不要额外的文字、标点符号或格式。`

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
        stream: false,
        max_tokens: 50,
        temperature: 0.8
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content?.trim() || ''
  } catch (error) {
    console.error('Error getting random word from DeepSeek:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred.'
    throw new Error(`Could not get random word: ${errorMessage}`)
  }
}

