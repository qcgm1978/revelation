


export interface AsciiArtData {
  art: string
  text?: string
}
import { generatePrompt } from './wikiService'

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
            } catch (e) {
             
            }
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


export async function generateAsciiArt (
  topic: string,
  language: 'zh' | 'en' = 'zh'
): Promise<AsciiArtData> {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY is not configured.')
  }

 
  let artPromptPart: string
  let keysDescription: string
  let prompt: string

  if (language === 'zh') {
    artPromptPart = `1. "art": 为词汇"${topic}"创建元ASCII可视化：
  - 调色板：│─┌┐└┘├┤┬┴┼►◄▲▼○●◐◑░▒▓█▀▄■□▪▫★☆♦♠♣♥⟨⟩/\\_|
  - 形状反映概念 - 让视觉形式体现词汇的本质
  - 示例：
    * "爆炸" → 从中心辐射的线条
    * "层次" → 金字塔结构
    * "流动" → 弯曲的方向性线条
  - 返回为单个字符串，使用\\n换行`

    keysDescription = `一个键："art"`
    prompt = `为"${topic}"创建一个包含${keysDescription}的JSON对象。
${artPromptPart}

请只返回原始JSON对象，不要额外的文字。响应必须以"{"开始，以"}"结束，只包含art属性。`
  } else {
    artPromptPart = `1. "art": Create meta-ASCII visualization for the term "${topic}":
  - Palette: │─┌┐└┘├┤┬┴┼►◄▲▼○●◐◑░▒▓█▀▄■□▪▫★☆♦♠♣♥⟨⟩/\\_|
  - Shape reflects concept - let visual form embody the essence of the term
  - Examples:
    * "Explosion" → radiating lines from center
    * "Hierarchy" → pyramid structure
    * "Flow" → curved directional lines
  - Return as single string, use \\n for line breaks`

    keysDescription = `one key: "art"`
    prompt = `Create a JSON object containing ${keysDescription} for "${topic}".
${artPromptPart}

Please only return the raw JSON object, no additional text. Response must start with "{" and end with "}", containing only the art property.`
  }

  const maxRetries = 1
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
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
          max_tokens: 1000,
          temperature: 0.3
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      let jsonStr = data.choices?.[0]?.message?.content?.trim() || ''

     
      console.log(
        `Attempt ${attempt}/${maxRetries} - Raw API response:`,
        jsonStr
      )

     
      const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s
      const match = jsonStr.match(fenceRegex)
      if (match && match[1]) {
        jsonStr = match[1].trim()
      }

     
      if (!jsonStr.startsWith('{') || !jsonStr.endsWith('}')) {
        throw new Error('Response is not a valid JSON object')
      }

      const parsedData = JSON.parse(jsonStr) as AsciiArtData

     
      if (
        typeof parsedData.art !== 'string' ||
        parsedData.art.trim().length === 0
      ) {
        throw new Error('Invalid or empty ASCII art in response')
      }

     
      const result: AsciiArtData = {
        art: parsedData.art
      }

      if (parsedData.text) {
        result.text = parsedData.text
      }

      return result
    } catch (error) {
      lastError =
        error instanceof Error ? error : new Error('Unknown error occurred')
      console.warn(
        `Attempt ${attempt}/${maxRetries} failed:`,
        lastError.message
      )

      if (attempt === maxRetries) {
        console.error('All retry attempts failed for ASCII art generation')
        throw new Error(
          `Could not generate ASCII art after ${maxRetries} attempts: ${lastError.message}`
        )
      }
     
    }
  }

 
  throw lastError || new Error('All retry attempts failed')
}
