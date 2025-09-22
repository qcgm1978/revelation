import { GoogleGenAI } from '@google/genai'
import { generatePrompt } from './wikiService'

let apiKey: string | null = null

if (typeof window !== 'undefined') {
  apiKey = localStorage.getItem('GEMINI_API_KEY')
}


let ai: GoogleGenAI | null = null
if (apiKey) {
  ai = new GoogleGenAI({ apiKey: apiKey })
}

const artModelName = 'gemini-2.5-flash'
const textModelName = 'gemini-2.5-flash-lite'

export const updateApiKey = (newApiKey: string | null): void => {
  apiKey = newApiKey
  if (newApiKey) {
    ai = new GoogleGenAI({ apiKey: newApiKey })
  } else {
    ai = null
  }
}

export async function* streamDefinition (
  topic: string,
  language: 'zh' | 'en' = 'zh',
  category?: string,
  context?: string
): AsyncGenerator<string, void, undefined> {
  if (!ai) {
    yield 'Error: GEMINI_API_KEY is not configured. Please check your settings to continue.'
    return
  }

  const prompt = generatePrompt(topic, language, category, context)

  try {
    const response = await ai.models.generateContentStream({
      model: textModelName,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    })

    for await (const chunk of response) {
      if (chunk.text) {
        yield chunk.text
      }
    }
  } catch (error) {
    const message = JSON.parse(JSON.parse(error.message).error.message).error
      .message
    console.error('Error streaming from Gemini:', error)
    const errorMessage =
      error instanceof Error ? message : 'An unknown error occurred.'
    yield `Error: Could not generate content for "${topic}". ${errorMessage}`
    throw new Error(errorMessage)
  }
}
