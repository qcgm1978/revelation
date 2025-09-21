// 统一维基服务层
// 根据是否有API密钥自动选择使用哪个服务

import * as deepseekService from './deepseekService'
import * as freeWikiService from './freeWikiService'
import * as geminiService from './geminiService'

// 导出接口
export interface AsciiArtData {
  art: string
  text?: string
}

// 服务类型枚举
export enum ServiceProvider {
  DEEPSEEK = 'deepseek',
  GEMINI = 'gemini',
  FREE = 'free'
}

/**
 * 获取当前选择的服务提供商
 */
export const getSelectedServiceProvider = (): ServiceProvider => {
  const saved = localStorage.getItem('selected_service_provider')
  if (
    saved &&
    Object.values(ServiceProvider).includes(saved as ServiceProvider)
  ) {
    return saved as ServiceProvider
  }

  // 检查各服务的API密钥是否存在
  if (hasDeepSeekApiKey()) {
    return ServiceProvider.DEEPSEEK
  } else if (hasGeminiApiKey()) {
    return ServiceProvider.GEMINI
  } else {
    return ServiceProvider.FREE
  }
}

/**
 * 设置服务提供商
 */
export const setSelectedServiceProvider = (provider: ServiceProvider): void => {
  localStorage.setItem('selected_service_provider', provider)
}

export const hasDeepSeekApiKey = (): boolean => {
  const key = localStorage.getItem('DEEPSEEK_API_KEY')
  return !!key && key.trim().length > 0
}

export const hasGeminiApiKey = (): boolean => {
  // Gemini API密钥检查逻辑
  const key = localStorage.getItem('GEMINI_API_KEY')
  return !!key && key.trim().length > 0
}
export const hasFreeApiKey = (): boolean => {
  return true
}

/**
 * 设置DeepSeek API密钥
 */
export const setDeepSeekApiKey = (key: string): void => {
  if (key) {
    localStorage.setItem('DEEPSEEK_API_KEY', key)
  } else {
    localStorage.removeItem('DEEPSEEK_API_KEY')
  }
}

/**
 * 设置Gemini API密钥
 */
export const setGeminiApiKey = (key: string): void => {
  if (key) {
    localStorage.setItem('GEMINI_API_KEY', key)
    // 更新geminiService中的API密钥
    if (typeof window !== 'undefined') {
      updateGeminiApiKey(key)
    }
  } else {
    localStorage.removeItem('GEMINI_API_KEY')
    // 清除geminiService中的API密钥
    if (typeof window !== 'undefined') {
      updateGeminiApiKey(null)
    }
  }
}

/**
 * 清除所有API密钥
 */
export const clearAllApiKeys = (): void => {
  localStorage.removeItem('DEEPSEEK_API_KEY')
  localStorage.removeItem('GEMINI_API_KEY')
}

/**
 * 流式获取定义内容
 * 根据选择的服务提供商获取内容
 * @param topic 要定义的词或术语
 * @param language 语言选择：'zh' 为中文，'en' 为英文
 * @returns 异步生成器，产生文本块
 */
// 在文件顶部导入updateApiKey函数
import { updateApiKey as updateGeminiApiKey } from './geminiService'

// 全局变量，跟踪是否已经显示过API密钥提示
let hasShownApiKeyPrompt = false

// 导出变量和更新函数
export { hasShownApiKeyPrompt }

export const setHasShownApiKeyPrompt = (value: boolean): void => {
  hasShownApiKeyPrompt = value
}

/**
 * 流式获取定义内容
 */
export async function* streamDefinition (
  topic: string,
  language: 'zh' | 'en' = 'zh',
  category?: string,
  context?: string
): AsyncGenerator<string, void, undefined> {
  const provider = getSelectedServiceProvider()

  // 移除这里的提示逻辑，统一在App.tsx中处理

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

/**
 * 生成单个随机单词或概念
 * 根据选择的服务提供商生成
 * @returns 返回一个随机单词的Promise
 */
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
        // 确保geminiService使用最新的API密钥
        if (typeof window !== 'undefined') {
          const key = localStorage.getItem('GEMINI_API_KEY')
          updateGeminiApiKey(key)
        }
        // 传递language参数
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

// 为了兼容性，保留原来的hasApiKey导出
// 这个函数会检查是否有任何有效的API密钥
// 优先检查DeepSeek，然后是Gemini

export const hasApiKey = (): boolean => {
  return hasDeepSeekApiKey() || hasGeminiApiKey() || hasFreeApiKey()
}

/**
 * 生成统一的提示词
 * @param topic 要定义的词或术语
 * @param language 语言选择：'zh' 为中文，'en' 为英文
 * @param category 可选的类别信息
 * @param context 可选的上下文信息
 * @returns 生成的提示词
 */
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
