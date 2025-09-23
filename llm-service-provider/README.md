# LLM Service Provider

一个提供多种 LLM（大型语言模型）服务集成的 Node.js 模块，支持 DeepSeek、Gemini、Groq、讯飞星火和 YouChat 等服务提供商。

## 安装

```bash
npm install llm-service-provider
# 或
pnpm add llm-service-provider
# 或
 yarn add llm-service-provider
```

## 使用方法

### 1. 使用 API 密钥管理组件

```tsx
import React, { useState } from 'react'
import { ApiKeyManager } from 'llm-service-provider'

function App() {
  const [isApiKeyManagerOpen, setIsApiKeyManagerOpen] = useState(false)
  const [apiKey, setApiKey] = useState('')

  const handleSaveApiKey = (key: string) => {
    setApiKey(key)
    console.log('API key saved:', key)
  }

  return (
    <div>
      <button onClick={() => setIsApiKeyManagerOpen(true)}>
        配置 API 密钥
      </button>
      
      <ApiKeyManager
        isOpen={isApiKeyManagerOpen}
        onSave={handleSaveApiKey}
        onClose={() => setIsApiKeyManagerOpen(false)}
      />
    </div>
  )
}

export default App
```

### 2. 使用流式内容生成

```tsx
import React, { useState, useEffect, useRef } from 'react'
import { streamDefinition, getSelectedServiceProvider, hasApiKey } from 'llm-service-provider'

function ContentGenerator({ topic }: { topic: string }) {
  const [content, setContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!topic || !hasApiKey()) return

    const generateContent = async () => {
      setIsGenerating(true)
      setContent('')
      controllerRef.current = new AbortController()
      const signal = controllerRef.current.signal

      try {
        const provider = getSelectedServiceProvider()
        const generator = streamDefinition(topic, 'zh', undefined, undefined)
        
        for await (const chunk of generator) {
          if (signal.aborted) break
          setContent(chunk)
        }
      } catch (error) {
        console.error('Error generating content:', error)
        setContent(`生成内容时出错: ${error instanceof Error ? error.message : '未知错误'}`)
      } finally {
        setIsGenerating(false)
      }
    }

    generateContent()

    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort()
      }
    }
  }, [topic])

  return (
    <div>
      {isGenerating && <p>生成中...</p>}
      <div>{content}</div>
    </div>
  )
}

export default ContentGenerator
```

### 3. 服务提供商管理

```javascript
import {
  ServiceProvider,
  getSelectedServiceProvider,
  setSelectedServiceProvider,
  hasApiKey
} from 'llm-service-provider'

// 获取当前选中的服务提供商
const currentProvider = getSelectedServiceProvider()
console.log('当前选中的服务提供商:', currentProvider)

// 选择特定的服务提供商
setSelectedServiceProvider(ServiceProvider.GEMINI)

// 检查是否已配置任何 API 密钥
const hasKey = hasApiKey()
console.log('是否已配置 API 密钥:', hasKey)
```

## 支持的服务提供商

- DeepSeek
- Gemini
- Groq (Meta)
- 讯飞星火
- YouChat

## 浏览器兼容性

该模块支持所有现代浏览器，使用 localStorage 存储 API 密钥和用户偏好设置。

## License

MIT