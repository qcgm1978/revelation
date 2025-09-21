import React, { useState, useEffect, useCallback } from 'react'
import { streamDefinition } from '../services/wikiService'
import ContentDisplay from './ContentDisplay'
import LoadingSkeleton from './LoadingSkeleton'
import SearchBar from './SearchBar'
import { getSelectedServiceProvider, ServiceProvider } from '../services/wikiService'

interface ContentGeneratorProps {
  currentTopic: string
  language: 'zh' | 'en'
  hasValidApiKey: boolean
  onWordClick: (word: string) => void
  directoryData?: Record<string, any>

  onSearch: (query: string) => void
  onRandom: () => void
}

const ContentGenerator: React.FC<ContentGeneratorProps> = ({
  currentTopic,
  language,
  hasValidApiKey,
  onWordClick,
  directoryData,
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
    if (content && content.length > 0) {
      document.dispatchEvent(
        new CustomEvent('contentUpdated', {
          detail: content
        })
      )
    }
  }, [content])
  useEffect(() => {
    if (!currentTopic) return

    if (currentTopic === '目录' || currentTopic === 'Directory') {
      setIsDirectory(true)
      setContent('')
      setIsLoading(false)
      setError(null)
      setGenerationTime(null)
      return
    }

    setIsDirectory(false)

    const cacheKey = `${currentTopic}-${language}-${
      getSelectedServiceProvider() === ServiceProvider.DEEPSEEK ? 'deepseek' : 
      getSelectedServiceProvider() === ServiceProvider.GEMINI ? 'gemini' : 'xunfei'
    }`

    if (contentCache[cacheKey]) {
      console.log(`从缓存加载内容: ${cacheKey}`)
      const cachedData = contentCache[cacheKey]
      setContent(cachedData.content)
      setGenerationTime(cachedData.generationTime)
      setIsLoading(false)
      setError(null)
      setIsFromCache(true)
      return
    }

    setIsFromCache(false)

    let isCancelled = false

    const fetchContentAndArt = async () => {
      setIsLoading(true)
      setContent('')
      setGenerationTime(null)
      const startTime = performance.now()

      let accumulatedContent = ''
      try {
        let category = sessionStorage.getItem(`category_for_${currentTopic}`)

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
          category,
          content
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
          setContent('')
          console.error(e)
        }
      } finally {
        if (!isCancelled) {
          const endTime = performance.now()
          const genTime = endTime - startTime
          setGenerationTime(genTime)
          setIsLoading(false)

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
  }, [currentTopic, language, hasValidApiKey])

  const handleRefreshContent = useCallback(() => {
    const cacheKey = `${currentTopic}-${language}-${
      hasValidApiKey ? 'deepseek' : 'wiki'
    }`
    setContentCache(prevCache => {
      const newCache = { ...prevCache }
      delete newCache[cacheKey]
      return newCache
    })

    setIsFromCache(false)

    setContent('')
    setIsLoading(true)

    setTimeout(() => {
      if (currentTopic) {
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
              setContent('')
              console.error(e)
            }
          } finally {
            if (!isCancelled) {
              const endTime = performance.now()
              const genTime = endTime - startTime
              setGenerationTime(genTime)
              setIsLoading(false)

              if (accumulatedContent && !isCancelled) {
                setContentCache(prevCache => ({
                  ...prevCache,
                  [`${currentTopic}-${language}-${
                    getSelectedServiceProvider() === ServiceProvider.DEEPSEEK
                      ? 'deepseek'
                      : getSelectedServiceProvider() === ServiceProvider.GEMINI
                      ? 'gemini'
                      : 'xunfei'
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
    return null
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

      {content.length > 0 && !error && (
        <div id="content-container">
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
