import * as deepseekService from './deepseekService'
import * as freeWikiService from './freeWikiService'
import * as geminiService from './geminiService'
import { updateApiKey as updateGeminiApiKey } from './geminiService'

export enum ServiceProvider {
  DEEPSEEK = 'deepseek',
  GEMINI = 'gemini',
  FREE = 'free'
}

export const getSelectedServiceProvider = (): ServiceProvider => {
  const saved = localStorage.getItem('selected_service_provider')
  if (
    saved &&
    Object.values(ServiceProvider).includes(saved as ServiceProvider)
  ) {
    return saved as ServiceProvider
  }

  if (hasDeepSeekApiKey()) {
    return ServiceProvider.DEEPSEEK
  } else if (hasGeminiApiKey()) {
    return ServiceProvider.GEMINI
  } else {
    return ServiceProvider.FREE
  }
}

export const setSelectedServiceProvider = (provider: ServiceProvider): void => {
  localStorage.setItem('selected_service_provider', provider)
}

export const hasDeepSeekApiKey = (): boolean => {
  const key = localStorage.getItem('DEEPSEEK_API_KEY')
  return !!key && key.trim().length > 0
}

export const hasGeminiApiKey = (): boolean => {
  const key = localStorage.getItem('GEMINI_API_KEY')
  return !!key && key.trim().length > 0
}
export const hasFreeApiKey = (): boolean => {
  return true
}

export const setDeepSeekApiKey = (key: string): void => {
  if (key) {
    localStorage.setItem('DEEPSEEK_API_KEY', key)
  } else {
    localStorage.removeItem('DEEPSEEK_API_KEY')
  }
}

export const setGeminiApiKey = (key: string): void => {
  if (key) {
    localStorage.setItem('GEMINI_API_KEY', key)

    if (typeof window !== 'undefined') {
      updateGeminiApiKey(key)
    }
  } else {
    localStorage.removeItem('GEMINI_API_KEY')

    if (typeof window !== 'undefined') {
      updateGeminiApiKey(null)
    }
  }
}

export const clearAllApiKeys = (): void => {
  localStorage.removeItem('DEEPSEEK_API_KEY')
  localStorage.removeItem('GEMINI_API_KEY')
}

let hasShownApiKeyPrompt = false

export { hasShownApiKeyPrompt }

export const setHasShownApiKeyPrompt = (value: boolean): void => {
  hasShownApiKeyPrompt = value
}

export async function* streamDefinition (
  topic: string,
  language: 'zh' | 'en' = 'zh',
  category?: string,
  context?: string
): AsyncGenerator<string, void, undefined> {
  const provider = getSelectedServiceProvider()

  switch (provider) {
    case ServiceProvider.DEEPSEEK:
      if (hasDeepSeekApiKey()) {
        yield* deepseekService.streamDefinition(
          topic,
          language,
          category,
          context
        )
      } else {
        yield* freeWikiService.streamDefinition(
          topic,
          language,
          category,
          context
        )
      }
      break
    case ServiceProvider.GEMINI:
      if (hasGeminiApiKey()) {
        if (typeof window !== 'undefined') {
          const key = localStorage.getItem('GEMINI_API_KEY')
          updateGeminiApiKey(key)
        }
        yield* geminiService.streamDefinition(
          topic,
          language,
          category,
          context
        )
      } else {
        yield* freeWikiService.streamDefinition(
          topic,
          language,
          category,
          context
        )
      }
      break
    default:
      yield* freeWikiService.streamDefinition(
        topic,
        language,
        category,
        context
      )
  }
}

export async function getRandomWord (
  language: 'zh' | 'en' = 'zh'
): Promise<string> {
  const provider = getSelectedServiceProvider()

  switch (provider) {
    case ServiceProvider.DEEPSEEK:
      if (hasDeepSeekApiKey()) {
        return deepseekService.getRandomWord()
      }
      break
    case ServiceProvider.GEMINI:
      if (hasGeminiApiKey()) {
        if (typeof window !== 'undefined') {
          const key = localStorage.getItem('GEMINI_API_KEY')
          updateGeminiApiKey(key)
        }

        try {
          return await geminiService.getRandomWord(language)
        } catch (error) {
          console.error('Gemini random word generation failed:', error)
        }
      }
      break
  }

  const randomWords =
    language === 'zh'
      ? [
          '知识',
          '技术',
          '历史',
          '文化',
          '科学',
          '艺术',
          '自然',
          '社会',
          '哲学',
          '创新'
        ]
      : [
          'knowledge',
          'technology',
          'history',
          'culture',
          'science',
          'art',
          'nature',
          'society',
          'philosophy',
          'innovation'
        ]
  const randomIndex = Math.floor(Math.random() * randomWords.length)
  return randomWords[randomIndex]
}

export const hasApiKey = (): boolean => {
  return hasDeepSeekApiKey() || hasGeminiApiKey() || hasFreeApiKey()
}

export const generatePrompt = (
  topic: string,
  language: 'zh' | 'en' = 'zh',
  category?: string,
  context?: string
): string => {
  let prompt: string
  if (language === 'zh') {
    if (context) {
      prompt = `请用中文回答"${topic}"。\n\n上下文信息：${context}`
    } else if (category) {
      prompt = `请用中文为${category}类别里的术语"${topic}"提供一个简洁、百科全书式的定义。请提供信息丰富且中立的内容。不要使用markdown、标题或任何特殊格式。只返回定义本身的文本。`
    } else {
      prompt = `请用中文为术语"${topic}"提供一个简洁、百科全书式的定义。请提供信息丰富且中立的内容。不要使用markdown、标题或任何特殊格式。只返回定义本身的文本。`
    }
  } else {
    if (context) {
      prompt = `Please answer the question "${topic}" in English.\n\nContext information: ${context}`
    } else if (category) {
      prompt = `Please provide a concise, encyclopedia-style definition for the term: "${topic}" in the category of ${category} in English. Please provide informative and neutral content. Do not use markdown, headings, or any special formatting. Return only the text of the definition itself.`
    } else {
      prompt = `Please provide a concise, encyclopedia-style definition for the term: "${topic}" in English. Please provide informative and neutral content. Do not use markdown, headings, or any special formatting. Return only the text of the definition itself.`
    }
  }
  return prompt
}
