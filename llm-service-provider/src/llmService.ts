export enum ServiceProvider {
  DEEPSEEK = 'deepseek',
  GEMINI = 'gemini',
  XUNFEI = 'xunfei',
  YOUCHAT = 'youchat',
  GROQ = 'groq'
}

// 检查运行环境是否支持 localStorage
const hasLocalStorage = () => {
  try {
    return typeof window !== 'undefined' && !!window.localStorage
  } catch (e) {
    return false
  }
}

export const getSelectedServiceProvider = (): ServiceProvider => {
  if (hasLocalStorage()) {
    const saved = localStorage.getItem('selected_service_provider')
    if (
      saved &&
      Object.values(ServiceProvider).includes(saved as ServiceProvider)
    ) {
      return saved as ServiceProvider
    }
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
  if (hasLocalStorage()) {
    localStorage.setItem('selected_service_provider', provider)
  }
}

export const hasDeepSeekApiKey = (): boolean => {
  if (hasLocalStorage()) {
    const key = localStorage.getItem('DEEPSEEK_API_KEY')
    return !!key && key.trim().length > 0
  }
  return false
}

export const hasGeminiApiKey = (): boolean => {
  if (hasLocalStorage()) {
    const key = localStorage.getItem('GEMINI_API_KEY')
    return !!key && key.trim().length > 0
  }
  return false
}

export const hasFreeApiKey = (): boolean => {
  return hasXunfeiApiKey() && hasXunfeiApiSecret()
}

export const setDeepSeekApiKey = (key: string): void => {
  if (hasLocalStorage()) {
    if (key) {
      localStorage.setItem('DEEPSEEK_API_KEY', key)
    } else {
      localStorage.removeItem('DEEPSEEK_API_KEY')
    }
  }
}

export const setGeminiApiKey = (key: string): void => {
  if (hasLocalStorage()) {
    if (key) {
      localStorage.setItem('GEMINI_API_KEY', key)
      
      // 更新 Gemini API 密钥
      if (typeof window !== 'undefined') {
        try {
          // 动态导入以避免循环依赖
          import('./geminiService').then(({ updateApiKey }) => {
            updateApiKey(key)
          })
        } catch (e) {
          console.error('Failed to update Gemini API key:', e)
        }
      }
    } else {
      localStorage.removeItem('GEMINI_API_KEY')
      
      if (typeof window !== 'undefined') {
        try {
          import('./geminiService').then(({ updateApiKey }) => {
            updateApiKey(null)
          })
        } catch (e) {
          console.error('Failed to clear Gemini API key:', e)
        }
      }
    }
  }
}

export const hasGroqApiKey = (): boolean => {
  if (hasLocalStorage()) {
    const key = localStorage.getItem('GROQ_API_KEY')
    return !!key && key.trim().length > 0
  }
  return false
}

export const setGroqApiKey = (key: string): void => {
  if (hasLocalStorage()) {
    if (key) {
      localStorage.setItem('GROQ_API_KEY', key)
    } else {
      localStorage.removeItem('GROQ_API_KEY')
    }
  }
}

export const clearAllApiKeys = (): void => {
  if (hasLocalStorage()) {
    localStorage.removeItem('DEEPSEEK_API_KEY')
    localStorage.removeItem('GEMINI_API_KEY')
    localStorage.removeItem('GROQ_API_KEY')
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

export const hasXunfeiApiKey = (): boolean => {
  if (hasLocalStorage()) {
    const key = localStorage.getItem('XUNFEI_API_KEY')
    return !!key && key.trim().length > 0
  }
  return false
}

export const hasXunfeiApiSecret = (): boolean => {
  if (hasLocalStorage()) {
    const secret = localStorage.getItem('XUNFEI_API_SECRET')
    return !!secret && secret.trim().length > 0
  }
  return false
}

export const setXunfeiApiKey = (key: string): void => {
  if (hasLocalStorage()) {
    if (key) {
      localStorage.setItem('XUNFEI_API_KEY', key)
    } else {
      localStorage.removeItem('XUNFEI_API_KEY')
    }
  }
}

export const setXunfeiApiSecret = (secret: string): void => {
  if (hasLocalStorage()) {
    if (secret) {
      localStorage.setItem('XUNFEI_API_SECRET', secret)
    } else {
      localStorage.removeItem('XUNFEI_API_SECRET')
    }
  }
}

export const hasShownApiKeyPrompt = (): boolean => {
  if (hasLocalStorage()) {
    const shown = localStorage.getItem('has_shown_api_key_prompt')
    return shown === 'true'
  }
  return false
}

export const setHasShownApiKeyPrompt = (shown: boolean): void => {
  if (hasLocalStorage()) {
    localStorage.setItem('has_shown_api_key_prompt', shown.toString())
  }
}

export const hasYouChatApiKey = (): boolean => {
  return true
}

export const setYouChatApiKey = (key: string): void => {
  if (hasLocalStorage()) {
    if (key) {
      localStorage.setItem('YOUCHAT_API_KEY', key)
    } else {
      localStorage.removeItem('YOUCHAT_API_KEY')
    }
  }
}

export const hasApiKey = (): boolean => {
  return (
    hasDeepSeekApiKey() ||
    hasGeminiApiKey() ||
    hasGroqApiKey() ||
    hasYouChatApiKey() ||
    hasFreeApiKey()
  )
}

// 动态导入服务模块以处理流定义
// 注意：为了避免循环依赖，我们使用动态导入

export async function* streamDefinition(
  topic: string,
  language: 'zh' | 'en' = 'zh',
  category?: string,
  context?: string
): AsyncGenerator<string, void, undefined> {
  const provider = getSelectedServiceProvider()
  
  try {
    switch (provider) {
      case ServiceProvider.DEEPSEEK:
        if (hasDeepSeekApiKey()) {
          const { streamDefinition } = await import('./deepseekService')
          yield* streamDefinition(topic, language, category, context)
          break
        }
      case ServiceProvider.GEMINI:
        if (hasGeminiApiKey()) {
          const { streamDefinition } = await import('./geminiService')
          yield* streamDefinition(topic, language, category, context)
          break
        }
      case ServiceProvider.GROQ:
        if (hasGroqApiKey()) {
          const { streamDefinition } = await import('./groqService')
          yield* streamDefinition(topic, language, category, context)
          break
        }
      case ServiceProvider.YOUCHAT:
        if (hasYouChatApiKey()) {
          const { streamDefinition } = await import('./youChatService')
          yield* streamDefinition(topic, language, category, context)
          break
        }
      case ServiceProvider.XUNFEI:
        if (hasFreeApiKey()) {
          const { streamDefinition } = await import('./xunfeiService')
          yield* streamDefinition(topic, language, category, context)
          break
        }
      default:
        const { streamDefinition } = await import('./xunfeiService')
        yield* streamDefinition(topic, language, category, context)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    const prefix = language === 'zh' ? '发生错误: ' : 'Error: '
    yield `${prefix}${errorMessage}`
  }
}