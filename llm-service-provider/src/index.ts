// 导出核心服务
import { 
  ServiceProvider,
  getSelectedServiceProvider,
  setSelectedServiceProvider,
  hasDeepSeekApiKey,
  hasGeminiApiKey,
  hasGroqApiKey,
  hasXunfeiApiKey,
  hasXunfeiApiSecret,
  hasYouChatApiKey,
  hasApiKey,
  hasFreeApiKey,
  hasShownApiKeyPrompt,
  setDeepSeekApiKey,
  setGeminiApiKey,
  setGroqApiKey,
  setXunfeiApiKey,
  setXunfeiApiSecret,
  setYouChatApiKey,
  setHasShownApiKeyPrompt,
  clearAllApiKeys,
  generatePrompt,
  streamDefinition
} from './llmService'

// 导出 React 组件
import ApiKeyManager from './ApiKeyManager'

// 导出所有功能
export {
  // 服务提供商枚举
  ServiceProvider,
  
  // 服务选择和管理
  getSelectedServiceProvider,
  setSelectedServiceProvider,
  
  // API 密钥检查
  hasDeepSeekApiKey,
  hasGeminiApiKey,
  hasGroqApiKey,
  hasXunfeiApiKey,
  hasXunfeiApiSecret,
  hasYouChatApiKey,
  hasApiKey,
  hasFreeApiKey,
  hasShownApiKeyPrompt,
  
  // API 密钥设置
  setDeepSeekApiKey,
  setGeminiApiKey,
  setGroqApiKey,
  setXunfeiApiKey,
  setXunfeiApiSecret,
  setYouChatApiKey,
  setHasShownApiKeyPrompt,
  clearAllApiKeys,
  
  // 内容生成
  generatePrompt,
  streamDefinition,
  
  // React 组件
  ApiKeyManager
}