import React, { useState, useEffect, useCallback } from 'react'
import {
  streamDefinition,
  hasApiKey
} from './services/deepseekService'
import ContentDisplay from './components/ContentDisplay'
import SearchBar from './components/SearchBar'
import LoadingSkeleton from './components/LoadingSkeleton'
import ApiKeyManager from './components/ApiKeyManager'
import LanguageSelector from './components/LanguageSelector'
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'
// A curated list of "banger" words and phrases for the random button.
const PREDEFINED_WORDS = []
const UNIQUE_WORDS = [...new Set(PREDEFINED_WORDS)]

// 导入目录组件
import Directory, { DirectoryData } from './components/Directory'

// 定义目录项的类型
interface DirectoryItem {
  term: string
  pages: string[]
  note?: string
}

const App: React.FC = () => {
  const [currentTopic, setCurrentTopic] = useState('目录')
  const [content, setContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [generationTime, setGenerationTime] = useState<number | null>(null)
  const [isDirectory, setIsDirectory] = useState<boolean>(true)


  // 历史记录状态
  const [history, setHistory] = useState<string[]>(['目录'])
  const [currentIndex, setCurrentIndex] = useState<number>(0)

  // 内容缓存状态
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
  const [directoryData, setDirectoryData] = useState<DirectoryData>({})
  const [isApiKeyManagerOpen, setIsApiKeyManagerOpen] = useState<boolean>(false)
  const [hasValidApiKey, setHasValidApiKey] = useState<boolean>(false)
  const [language, setLanguage] = useState<'zh' | 'en'>('zh')
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false)
  const [selectedWords, setSelectedWords] = useState<string[]>([])

  // 检查 API 密钥状态
  useEffect(() => {
    setHasValidApiKey(hasApiKey())
  }, [])

  // 加载目录内容
  useEffect(() => {
    const loadDirectoryContent = async () => {
      try {
        const url = `${import.meta.env.BASE_URL}revelation.json`
        const response = await fetch(url, { cache: 'no-cache' })
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        const data = (await response.json()) as DirectoryData
        setDirectoryData(data)
      } catch (error) {
        console.error('Error loading revelation.json:', error)
        setDirectoryData({})
      }
    }

    loadDirectoryContent()
  }, [])

  // 处理 API 密钥变化
  const handleApiKeyChange = (apiKey: string) => {
    setHasValidApiKey(!!apiKey)
  }

  // 处理语言变化
  const handleLanguageChange = useCallback(
    (newLanguage: 'zh' | 'en') => {
      setLanguage(newLanguage)

      // 如果是目录页面且切换到英文，将标题也切换为英文
      if (currentTopic === '目录' && newLanguage === 'en') {
        // 更新当前主题但不添加到历史记录中
        setCurrentTopic('Directory')
        // 更新历史记录中当前位置的值
        const newHistory = [...history]
        newHistory[currentIndex] = 'Directory'
        setHistory(newHistory)
        return
      } else if (currentTopic === 'Directory' && newLanguage === 'zh') {
        // 更新当前主题但不添加到历史记录中
        setCurrentTopic('目录')
        // 更新历史记录中当前位置的值
        const newHistory = [...history]
        newHistory[currentIndex] = '目录'
        setHistory(newHistory)
        return
      }

      // 对于非目录页面，强制重新生成内容
      if (!isDirectory) {
        // 先清空当前内容，触发加载状态
        setContent('')
        setIsLoading(true)

        // 使用setTimeout确保状态更新后再触发重新生成
        setTimeout(() => {
          // 通过设置相同的主题来触发useEffect重新获取内容
          setCurrentTopic(prev => prev)
        }, 100)
      }
    },
    [currentTopic, history, currentIndex]
  )

  // 处理目录项点击 - 暂时使用直接更新方式，后面会重新定义
  const handleDirectoryItemClick = useCallback(
    (term: string) => {
      // 直接设置当前主题
      setCurrentTopic(term)
      // 更新历史记录
      const newHistory = history.slice(0, currentIndex + 1)
      newHistory.push(term)
      setHistory(newHistory)
      setCurrentIndex(newHistory.length - 1)
    },
    [currentTopic, history, currentIndex]
  )



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

    // 检查是否有有效的 API 密钥
    if (!hasValidApiKey) {
      setError(
        language === 'zh'
          ? '请先配置 DeepSeek API 密钥'
          : 'Please configure DeepSeek API key first'
      )
      setIsLoading(false)
      return
    }

    // 生成缓存键，包含主题和语言
    const cacheKey = `${currentTopic}-${language}`

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
      setIsDirectory(false)
      setContent('') // Clear previous content immediately
      setGenerationTime(null)
      const startTime = performance.now()

      let accumulatedContent = ''
      try {
        for await (const chunk of streamDefinition(currentTopic, language)) {
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
  }, [currentTopic, language, contentCache, hasValidApiKey])

  // 更新当前主题并添加到历史记录中的通用函数
  const updateTopicAndHistory = useCallback(
    (newTopic: string) => {
      if (newTopic && newTopic.toLowerCase() !== currentTopic.toLowerCase()) {
        // 设置新主题
        setCurrentTopic(newTopic)

        // 更新历史记录
        // 如果当前不是在历史记录的最后，则删除当前位置之后的所有记录
        const newHistory = history.slice(0, currentIndex + 1)
        newHistory.push(newTopic)
        setHistory(newHistory)
        setCurrentIndex(newHistory.length - 1)
      }
    },
    [currentTopic, history, currentIndex]
  )

  // 前进到历史记录中的下一个主题
  const handleForward = useCallback(() => {
    if (currentIndex < history.length - 1) {
      const nextIndex = currentIndex + 1
      const nextTopic = history[nextIndex]

      // 更新索引和主题
      setCurrentIndex(nextIndex)
      setCurrentTopic(nextTopic)

      // 如果是目录页面，设置目录状态
      if (nextTopic === '目录' || nextTopic === 'Directory') {
        setIsDirectory(true)
        setContent('')
        setError(null)
        setGenerationTime(null)
      }
    }
  }, [currentIndex, history])

  // 后退到历史记录中的上一个主题
  const handleBack = useCallback(() => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1
      const prevTopic = history[prevIndex]

      // 更新索引和主题
      setCurrentIndex(prevIndex)
      setCurrentTopic(prevTopic)

      // 如果是目录页面，设置目录状态
      if (prevTopic === '目录' || prevTopic === 'Directory') {
        setIsDirectory(true)
        setContent('')
        setError(null)
        setGenerationTime(null)
      }
    }
  }, [currentIndex, history])

  const handleWordClick = useCallback(
    (word: string) => {
      const newTopic = word.trim()
      updateTopicAndHistory(newTopic)
    },
    [updateTopicAndHistory]
  )

  const handleSearch = useCallback(
    (topic: string) => {
      const newTopic = topic.trim()
      updateTopicAndHistory(newTopic)
    },
    [updateTopicAndHistory]
  )

  const handleMultiSearch = useCallback(
    (words: string[]) => {
      console.log('handleMultiSearch called with words:', words)
      if (words.length > 0) {
        // 将选中的单词组合成一个词组，用空格连接
        const combinedTopic = words.join(' ')
        console.log('Combined topic:', combinedTopic)
        updateTopicAndHistory(combinedTopic)
      }
    },
    [updateTopicAndHistory]
  )

  const toggleMultiSelectMode = () => {
    setIsMultiSelectMode(!isMultiSelectMode)
    if (isMultiSelectMode) {
      setSelectedWords([])
    }
  }

  const handleRandom = useCallback(() => {
    setIsLoading(true) // Disable UI immediately
    setError(null)
    setContent('')
    // 从目录数据中收集所有术语
    const allTerms: string[] = []
    if (directoryData) {
      ;(Object.values(directoryData) as DirectoryItem[][]).forEach(
        categoryItems => {
          categoryItems.forEach(item => {
            if (item.term) {
              allTerms.push(item.term)
            }
          })
        }
      )
    }

    // 如果没有目录项，回退到原来的UNIQUE_WORDS
    if (allTerms.length === 0) {
      const randomIndex = Math.floor(Math.random() * UNIQUE_WORDS.length)
      const randomWord = UNIQUE_WORDS[randomIndex]

      // Prevent picking the same word twice in a row
      if (randomWord.toLowerCase() === currentTopic.toLowerCase()) {
        const nextIndex = (randomIndex + 1) % UNIQUE_WORDS.length
        updateTopicAndHistory(UNIQUE_WORDS[nextIndex])
      } else {
        updateTopicAndHistory(randomWord)
      }
      return
    }

    // 从目录术语中随机选择一个
    const randomIndex = Math.floor(Math.random() * allTerms.length)
    const randomTerm = allTerms[randomIndex]

    // Prevent picking the same term twice in a row
    if (randomTerm.toLowerCase() === currentTopic.toLowerCase()) {
      const nextIndex = (randomIndex + 1) % allTerms.length
      updateTopicAndHistory(allTerms[nextIndex])
    } else {
      updateTopicAndHistory(randomTerm)
    }
  }, [currentTopic, updateTopicAndHistory, directoryData])

  return (
    <div>
      <SearchBar
        onSearch={handleSearch}
        onRandom={handleRandom}
        isLoading={isLoading}
      />

      <header
        style={{
          textAlign: 'center',
          marginBottom: '2rem',
          position: 'relative'
        }}
      >
        <button
          onClick={() => setIsApiKeyManagerOpen(true)}
          style={{
            position: 'absolute',
            top: '0',
            right: '0',
            background: hasValidApiKey ? '#27ae60' : '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          title={
            hasValidApiKey
              ? language === 'zh'
                ? 'API 密钥已配置'
                : 'API Key Configured'
              : language === 'zh'
              ? '配置 API 密钥'
              : 'Configure API Key'
          }
        >
          {hasValidApiKey ? '🔑' : '⚙️'}
          {hasValidApiKey
            ? language === 'zh'
              ? '已配置'
              : 'Configured'
            : language === 'zh'
            ? '配置'
            : 'Configure'}
        </button>

        <h1 style={{ letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          启示路
        </h1>
      </header>

      <main>
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '2rem'
            }}
          >
            {/* 导航按钮 */}
            <div style={{ display: 'flex', marginRight: '1rem' }}>
              <button
                onClick={handleBack}
                disabled={currentIndex <= 0}
                style={{
                  background: currentIndex <= 0 ? '#e0e0e0' : '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.5rem',
                  marginRight: '0.5rem',
                  cursor: currentIndex <= 0 ? 'not-allowed' : 'pointer',
                  opacity: currentIndex <= 0 ? 0.5 : 1,
                  transition: 'all 0.3s ease'
                }}
                title={language === 'zh' ? '返回' : 'Back'}
              >
                <FaArrowLeft />
              </button>
              <button
                onClick={handleForward}
                disabled={currentIndex >= history.length - 1}
                style={{
                  background:
                    currentIndex >= history.length - 1 ? '#e0e0e0' : '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.5rem',
                  cursor:
                    currentIndex >= history.length - 1
                      ? 'not-allowed'
                      : 'pointer',
                  opacity: currentIndex >= history.length - 1 ? 0.5 : 1,
                  transition: 'all 0.3s ease'
                }}
                title={language === 'zh' ? '前进' : 'Forward'}
              >
                <FaArrowRight />
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <h2 style={{ margin: 0, textTransform: 'capitalize' }}>
                {currentTopic}
              </h2>
              {isFromCache && !isDirectory && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginLeft: '1rem'
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
                    onClick={() => {
                      // 清除当前主题的缓存
                      const cacheKey = `${currentTopic}-${language}`
                      setContentCache(prevCache => {
                        const newCache = { ...prevCache }
                        delete newCache[cacheKey]
                        return newCache
                      })
                      // 重置缓存标记
                      setIsFromCache(false)
                      // 重新加载内容
                      setCurrentTopic(prev => prev)
                    }}
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
            </div>
          </div>

          {/* 语言选择器和内容显示在同一行 */}
          {!isDirectory && hasValidApiKey && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '1rem',
                marginBottom: '1rem'
              }}
            >
              <LanguageSelector
                language={language}
                onLanguageChange={handleLanguageChange}
                isMultiSelectMode={isMultiSelectMode}
                selectedWords={selectedWords}
                toggleMultiSelectMode={toggleMultiSelectMode}
                handleMultiSearch={() => handleMultiSearch(selectedWords)}
              />
              {content.length > 0 && !error && !isDirectory && (
                <ContentDisplay
                  content={content}
                  isLoading={isLoading}
                  onWordClick={handleWordClick}
                  onMultiSearch={handleMultiSearch}
                />
              )}
            </div>
          )}

          {!hasValidApiKey && (
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
                🔑{' '}
                {language === 'zh' ? '需要配置 API 密钥' : 'API Key Required'}
              </h3>
              <p style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>
                {language === 'zh'
                  ? '请点击右上角的"配置"按钮，输入你的 DeepSeek API 密钥以开始使用应用。'
                  : 'Please click the "Configure" button in the top right corner to enter your DeepSeek API key to start using the application.'}
              </p>
              <button
                onClick={() => setIsApiKeyManagerOpen(true)}
                style={{
                  background:
                    'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                🚀 {language === 'zh' ? '立即配置' : 'Configure Now'}
              </button>
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

          {/* 目录页面特殊显示 */}
          {isDirectory && (
            <div
              style={{
                padding: '1rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}
            >
              <Directory
                directoryData={directoryData}
                onItemClick={handleDirectoryItemClick}
                language={language}
              />
            </div>
          )}

          {/* Show skeleton loader when loading and no content is yet available */}
          {isLoading && content.length === 0 && !error && !isDirectory && (
            <LoadingSkeleton />
          )}

          {/* Show content as it streams or when it's interactive */}
          {/* {content.length > 0 && !error && !isDirectory && (
            <ContentDisplay
              content={content}
              isLoading={isLoading}
              onWordClick={handleWordClick}
              onMultiSearch={handleMultiSearch}
            />
          )} */}

          {/* Show empty state if fetch completes with no content and is not loading */}
          {!isLoading && !error && content.length === 0 && !isDirectory && (
            <div style={{ color: '#888', padding: '2rem 0' }}>
              <p>
                {language === 'zh'
                  ? '无法生成内容。'
                  : 'Content could not be generated.'}
              </p>
            </div>
          )}
        </div>
      </main>

      <footer className='sticky-footer'>
        <p className='footer-text' style={{ margin: 0 }}>
          {language === 'zh'
            ? '按空格键停止/播放音乐'
            : 'Press Spacebar to stop/play music'}
        </p>
      </footer>

      {/* API 密钥管理器 */}
      <ApiKeyManager
        isOpen={isApiKeyManagerOpen}
        onClose={() => setIsApiKeyManagerOpen(false)}
        onApiKeyChange={handleApiKeyChange}
      />
    </div>
  )
}

export default App
