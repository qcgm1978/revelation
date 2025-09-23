import * as deepseekService from './deepseekService'
import * as xunfeiService from './xunfeiService'
import * as geminiService from './geminiService'
import * as youChatService from './youChatService'
import * as groqService from './groqService'
import { updateApiKey as updateGeminiApiKey } from './geminiService'


export enum ServiceProvider {
  DEEPSEEK = 'deepseek',
  GEMINI = 'gemini',
  XUNFEI = 'xunfei',
  YOUCHAT = 'youchat',
  GROQ = 'groq'
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
  } else if (hasGroqApiKey()) {
    return ServiceProvider.GROQ
  } else if (hasYouChatApiKey()) {
    return ServiceProvider.YOUCHAT
  } else {
    return ServiceProvider.XUNFEI
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
  return hasXunfeiApiKey() && hasXunfeiApiSecret()
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

export const hasGroqApiKey = (): boolean => {
  const key = localStorage.getItem('GROQ_API_KEY')
  return !!key && key.trim().length > 0
}

export const setGroqApiKey = (key: string): void => {
  if (key) {
    localStorage.setItem('GROQ_API_KEY', key)
  } else {
    localStorage.removeItem('GROQ_API_KEY')
  }
}

// 修改clearAllApiKeys函数，添加清除Groq API密钥

export const clearAllApiKeys = (): void => {
  localStorage.removeItem('DEEPSEEK_API_KEY')
  localStorage.removeItem('GEMINI_API_KEY')
  localStorage.removeItem('GROQ_API_KEY')
}

// 修改streamDefinition函数，添加对Groq服务的调用

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
        break
      }
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
        break
      }
    case ServiceProvider.GROQ:
      if (hasGroqApiKey()) {
        yield* groqService.streamDefinition(topic, language, category, context)
        break
      }
    case ServiceProvider.YOUCHAT:
      if (hasYouChatApiKey()) {
        yield* youChatService.streamDefinition(
          topic,
          language,
          category,
          context
        )
        break
      }
    case ServiceProvider.XUNFEI:
      if (hasFreeApiKey()) {
        yield* xunfeiService.streamDefinition(
          topic,
          language,
          category,
          context
        )
        break
      }
    default:
      yield* xunfeiService.streamDefinition(
        topic,
        language,
        category,
        context
      )
  }
}

// 修改hasApiKey函数，添加hasGroqApiKey检查
export const hasApiKey = (): boolean => {
  return (
    hasDeepSeekApiKey() ||
    hasGeminiApiKey() ||
    hasGroqApiKey() ||
    hasYouChatApiKey() ||
    hasFreeApiKey()
  )
}

export const setYouChatApiKey = (key: string): void => {
  if (key) {
    localStorage.setItem('YOUCHAT_API_KEY', key)
  } else {
    localStorage.removeItem('YOUCHAT_API_KEY')
  }
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

// 在已有的hasGeminiApiKey函数后添加

export const hasXunfeiApiKey = (): boolean => {
  const key = localStorage.getItem('XUNFEI_API_KEY')
  return !!key && key.trim().length > 0
}

export const hasXunfeiApiSecret = (): boolean => {
  const secret = localStorage.getItem('XUNFEI_API_SECRET')
  return !!secret && secret.trim().length > 0
}

export const setXunfeiApiKey = (key: string): void => {
  if (key) {
    localStorage.setItem('XUNFEI_API_KEY', key)
  } else {
    localStorage.removeItem('XUNFEI_API_KEY')
  }
}

export const setXunfeiApiSecret = (secret: string): void => {
  if (secret) {
    localStorage.setItem('XUNFEI_API_SECRET', secret)
  } else {
    localStorage.removeItem('XUNFEI_API_SECRET')
  }
}

// 添加缺失的API密钥提示相关函数
export const hasShownApiKeyPrompt = (): boolean => {
  const shown = localStorage.getItem('has_shown_api_key_prompt')
  return shown === 'true'
}

export const setHasShownApiKeyPrompt = (shown: boolean): void => {
  localStorage.setItem('has_shown_api_key_prompt', shown.toString())
}
export const hasYouChatApiKey = (): boolean => {
  return true
}
