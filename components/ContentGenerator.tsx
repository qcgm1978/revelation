import React, { useState, useEffect, useCallback } from 'react'
import { streamDefinition } from '../services/wikiService'
import ContentDisplay from './ContentDisplay'
import LoadingSkeleton from './LoadingSkeleton'
import SearchBar from './SearchBar'

interface ContentGeneratorProps {
  currentTopic: string
  language: 'zh' | 'en'
  hasValidApiKey: boolean
  onWordClick: (word: string) => void
  directoryData?: Record<string, any>
  // 添加onSearch和onRandom回调
  onSearch: (query: string) => void
  onRandom: () => void
}

const ContentGenerator: React.FC<ContentGeneratorProps> = ({
  currentTopic,
  language,
  hasValidApiKey,
  onWordClick,
  directoryData,
  // 添加新的props
  onSearch,
  onRandom
}) => {
  const [content, setContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [generationTime, setGenerationTime] = useState<number | null>(null)
  const [contentCache, setContentCache] = useState<
    Record<
      string,
      {
        content: string
        generationTime: number | null
      }
    >
  >({})
  const [isFromCache, setIsFromCache] = useState<boolean>(false)
  const [isDirectory, setIsDirectory] = useState<boolean>(false)

  useEffect(() => {
    if (!currentTopic) return

    // 如果是目录页面，直接显示目录内容
    if (currentTopic === '目录' || currentTopic === 'Directory') {
      setIsDirectory(true)
      setContent('')
      setIsLoading(false)
      setError(null)
      setGenerationTime(null)
      return
    }

    // 如果不是目录，设置为非目录状态
    setIsDirectory(false)

    // 移除阻止在没有API密钥时加载内容的限制
    // 不再显示'请先配置 DeepSeek API 密钥'的错误信息

    // 生成缓存键，包含主题和语言
    const cacheKey = `${currentTopic}-${language}-${
      hasValidApiKey ? 'deepseek' : 'wiki'
    }`

    // 检查缓存中是否有该主题的内容
    if (contentCache[cacheKey]) {
      console.log(`从缓存加载内容: ${cacheKey}`)
      const cachedData = contentCache[cacheKey]
      setContent(cachedData.content)
      setGenerationTime(cachedData.generationTime)
      setIsLoading(false)
      setError(null)
      setIsFromCache(true) // 标记内容来自缓存
      return
    }

    // 不是从缓存加载，重置缓存标记
    setIsFromCache(false)

    let isCancelled = false

    const fetchContentAndArt = async () => {
      // Set initial state for a clean page load
      setIsLoading(true)
      setContent('') // Clear previous content immediately
      setGenerationTime(null)
      const startTime = performance.now()

      let accumulatedContent = ''
      try {
        // 获取当前主题的类别信息
        let category = sessionStorage.getItem(`category_for_${currentTopic}`)

        // 如果sessionStorage中没有，尝试从directoryData中查找
        if (!category && directoryData) {
          const categories = Object.keys(directoryData)
          for (const cat of categories) {
            const items = directoryData[cat]
            if (items && Array.isArray(items)) {
              const foundItem = items.find(
                item => item.term && item.term.includes(currentTopic)
              )
              if (foundItem) {
                category = cat
                break
              }
            }
          }
        }

        for await (const chunk of streamDefinition(
          currentTopic,
          language,
          category
        )) {
          if (isCancelled) break

          if (chunk.startsWith('Error:')) {
            throw new Error(chunk)
          }
          accumulatedContent += chunk
          if (!isCancelled) {
            setContent(accumulatedContent)
          }
        }
      } catch (e: unknown) {
        if (!isCancelled) {
          const errorMessage =
            e instanceof Error ? e.message : 'An unknown error occurred'
          setError(errorMessage)
          setContent('') // Ensure content is clear on error
          console.error(e)
        }
      } finally {
        if (!isCancelled) {
          const endTime = performance.now()
          const genTime = endTime - startTime
          setGenerationTime(genTime)
          setIsLoading(false)

          // 将内容存入缓存
          if (accumulatedContent && !isCancelled) {
            setContentCache(prevCache => ({
              ...prevCache,
              [cacheKey]: {
                content: accumulatedContent,
                generationTime: genTime
              }
            }))
            console.log(`内容已缓存: ${cacheKey}`)
          }
        }
      }
    }

    fetchContentAndArt()

    return () => {
      isCancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTopic, language, hasValidApiKey])

  const handleRefreshContent = useCallback(() => {
    // 清除当前主题的缓存 - 使用与useEffect相同的缓存键格式
    const cacheKey = `${currentTopic}-${language}-${
      hasValidApiKey ? 'deepseek' : 'wiki'
    }`
    setContentCache(prevCache => {
      const newCache = { ...prevCache }
      delete newCache[cacheKey]
      return newCache
    })
    // 重置缓存标记
    setIsFromCache(false)
    // 重新加载内容
    setContent('')
    setIsLoading(true)
    // 通过设置相同的主题来触发useEffect重新获取内容
    setTimeout(() => {
      if (currentTopic) {
        // 这里我们直接调用fetchContentAndArt而不是依赖useEffect
        let isCancelled = false

        const fetchContentAndArt = async () => {
          const startTime = performance.now()
          let accumulatedContent = ''
          try {
            for await (const chunk of streamDefinition(
              currentTopic,
              language
            )) {
              if (isCancelled) break

              if (chunk.startsWith('Error:')) {
                throw new Error(chunk)
              }
              accumulatedContent += chunk
              if (!isCancelled) {
                setContent(accumulatedContent)
              }
            }
          } catch (e: unknown) {
            if (!isCancelled) {
              const errorMessage =
                e instanceof Error ? e.message : 'An unknown error occurred'
              setError(errorMessage)
              setContent('') // Ensure content is clear on error
              console.error(e)
            }
          } finally {
            if (!isCancelled) {
              const endTime = performance.now()
              const genTime = endTime - startTime
              setGenerationTime(genTime)
              setIsLoading(false)

              // 将内容存入缓存 - 使用与useEffect相同的缓存键格式
              if (accumulatedContent && !isCancelled) {
                setContentCache(prevCache => ({
                  ...prevCache,
                  [`${currentTopic}-${language}-${
                    hasValidApiKey ? 'deepseek' : 'wiki'
                  }`]: {
                    content: accumulatedContent,
                    generationTime: genTime
                  }
                }))
              }
            }
          }
        }

        fetchContentAndArt()

        return () => {
          isCancelled = true
        }
      }
    }, 100)
  }, [currentTopic, language, hasValidApiKey])

  if (isDirectory) {
    return null // 目录内容由Directory组件处理
  }

  return (
    <div>
      {!hasValidApiKey && error && (
        <div
          style={{
            border: '2px solid #f39c12',
            padding: '1.5rem',
            color: '#d68910',
            backgroundColor: '#fef9e7',
            borderRadius: '8px',
            textAlign: 'center',
            marginBottom: '2rem'
          }}
        >
          <h3 style={{ margin: '0 0 1rem 0', color: '#d68910' }}>
            🔑 {language === 'zh' ? '推荐配置 API 密钥' : 'API Key Recommended'}
          </h3>
          <p style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>
            {language === 'zh'
              ? '点击右上角的"配置"按钮，输入DeepSeek API密钥以获得更好的内容生成体验。目前将使用维基百科服务。'
              : 'Click the "Configure" button in the top right corner to enter your DeepSeek API key for better content generation. Currently using Wikipedia service.'}
          </p>
        </div>
      )}

      {error && (
        <div
          style={{
            border: '1px solid #cc0000',
            padding: '1rem',
            color: '#cc0000'
          }}
        >
          <p style={{ margin: 0 }}>
            {language === 'zh' ? '发生错误' : 'An Error Occurred'}
          </p>
          <p style={{ marginTop: '0.5rem', margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Show skeleton loader when loading and no content is yet available */}
      {isLoading && content.length === 0 && !error && <LoadingSkeleton />}


      {/* 先放置搜索框 */}
      <SearchBar
        onSearch={onSearch}
        onRandom={onRandom}
        isLoading={isLoading}
        showRandomButton={!isDirectory}
        language={language}
      />

      {/* 再放置内容区域 */}
      {/* Show content as it streams or when it's interactive */}
      {content.length > 0 && !error && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '1rem',
            marginBottom: '1rem',
            // 添加最大高度和滚动效果
            maxHeight: 'calc(100vh - 20rem)',
            overflowY: 'auto',
            paddingRight: '0.5rem'
          }}
        >
          {isFromCache && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                alignSelf: 'flex-end'
              }}
            >
              <span
                style={{
                  fontSize: '0.8rem',
                  padding: '0.2rem 0.5rem',
                  backgroundColor: '#27ae60',
                  color: 'white',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  marginRight: '0.5rem'
                }}
                title={
                  language === 'zh'
                    ? '内容从缓存加载'
                    : 'Content loaded from cache'
                }
              >
                {language === 'zh' ? '缓存' : 'Cached'}
              </span>
              <button
                onClick={handleRefreshContent}
                style={{
                  fontSize: '0.7rem',
                  padding: '0.2rem 0.4rem',
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                title={language === 'zh' ? '刷新内容' : 'Refresh content'}
              >
                {language === 'zh' ? '刷新' : 'Refresh'}
              </button>
            </div>
          )}
          <ContentDisplay
            content={content}
            isLoading={isLoading}
            onWordClick={onWordClick}
          />
        </div>
      )}

      {!isLoading && !error && content.length === 0 && (
        <div style={{ color: '#888', padding: '2rem 0' }}>
          <p>
            {language === 'zh'
              ? '无法生成内容。'
              : 'Content could not be generated.'}
          </p>
        </div>
      )}
    </div>
  )
}

export default ContentGenerator
