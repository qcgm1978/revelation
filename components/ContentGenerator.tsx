import React, { useState, useEffect, useCallback } from 'react'
import { streamDefinition } from 'llm-service-provider'
import ContentDisplay from './ContentDisplay'
import LoadingSkeleton from './LoadingSkeleton'
import SearchBar from './SearchBar'
import { getSelectedServiceProvider, ServiceProvider } from 'llm-service-provider'

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
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const synth = window.speechSynthesis

  const handleTextToSpeech = () => {
    if (isPlaying) {
      synth.cancel()
      setIsPlaying(false)
      return
    }

    if (!content) return

    const utterance = new SpeechSynthesisUtterance(content)
    utterance.lang = language === 'zh' ? 'zh-CN' : 'en-US'
    utterance.volume = 1
    utterance.rate = 1
    utterance.pitch = 1

    utterance.onend = () => {
      setIsPlaying(false)
    }

    synth.speak(utterance)
    setIsPlaying(true)
  }

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
      getSelectedServiceProvider() === ServiceProvider.GEMINI ? 'gemini' : 
      getSelectedServiceProvider() === ServiceProvider.YOUCHAT ? 'youchat' : 
      getSelectedServiceProvider() === ServiceProvider.GROQ ? 'groq' : 'xunfei'
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

  const err_msg = <div
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
        ? '点击右上角的"⋮"进入语言模型菜单，输入模型密钥以获得更好的内容生成体验。或选择YouChat直接可用。'
        : 'Click the "Configure" button in the top right corner to enter your DeepSeek API key for better content generation. Currently using Wikipedia service.'}
    </p>
  </div>
  return (
    <div>
      {(error) && (
        err_msg
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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              alignSelf: 'flex-end'
            }}
          >
            <button
              onClick={handleTextToSpeech}
              style={{
                fontSize: '1rem',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title={language === 'zh' ? (isPlaying ? '停止朗读' : '朗读内容') : (isPlaying ? 'Stop reading' : 'Read content')}
            >
              {isPlaying ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="black">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="black">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
              )}
            </button>
            <button
              onClick={handleRefreshContent}
              style={{
                fontSize: '1rem',
                padding: '0 0.5rem',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              title={language === 'zh' ? '刷新内容' : 'Refresh content'}
            >
              🔄
            </button>
          </div>
          <ContentDisplay
            content={content}
            isLoading={isLoading}
            onWordClick={onWordClick}
          />
        </div>
      )}

      {!isLoading && !error && content.length === 0 && (
        err_msg
      )}
    </div>
  )
}

export default ContentGenerator
