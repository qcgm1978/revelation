import React, { useState, useEffect, useCallback } from 'react'
import { hasApiKey, setApiKey, clearApiKey } from './services/wikiService'
import DocumentRenderer from './components/DocumentRenderer'

import SearchBar from './components/SearchBar'
import ApiKeyManager from './components/ApiKeyManager'
import LanguageSelector from './components/LanguageSelector'
// 导入书籍管理hook
import useBookManager from './hooks/useBookManager'
import audioManager from './utils/audioManager'

// 定义目录项的类型
interface DirectoryItem {
  term: string
  pages: string[]
  note?: string
}

const App: React.FC = () => {
  const [language, setLanguage] = useState<'zh' | 'en'>('zh')
  // 添加多选相关状态
  const [isMultiSelectMode, setIsMultiSelectMode] = useState<boolean>(false)
  const [selectedWords, setSelectedWords] = useState<string[]>([])
  useEffect(() => {
    audioManager.init()
    const footer = document.querySelector('.sticky-footer')
    if (footer) {
      audioManager.addPlayerToContainer(footer)
    }
  }, [])
  // 使用书籍管理hook
  // Modify the useBookManager initialization to include getCurrentDirectoryData
  const {
    directoryData,
    uploadedBooks,
    currentBookTitle,
    isUsingUploadedData,
    uploadErrorMessage,
    uploadedBooksMetadata,
    currentBookId,
    handleFileUpload,
    switchToDefaultBook,
    switchToUploadedBook,
    deleteUploadedBook,
    getCurrentDirectoryData // Add this line
  } = useBookManager(language)

  // 恢复必要的状态
  const [currentTopic, setCurrentTopic] = useState('目录')
  const [currentTopicWithPage, setCurrentTopicWithPage] = useState('目录')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  // 添加目录状态缓存
  const [directoryStateCache, setDirectoryStateCache] = useState<{
    categoryMode: 'subject' | 'page'
    pageFilter: string
    selectedSubject: string
  }>({
    categoryMode: 'subject',
    pageFilter: '',
    selectedSubject: ''
  })
  const [isFromCache, setIsFromCache] = useState<boolean>(false)
  const [isDirectory, setIsDirectory] = useState<boolean>(true)
  const [history, setHistory] = useState<string[]>(['目录'])
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [contentCache, setContentCache] = useState<
    Record<string, { content: string; generationTime: number | null }>
  >({})

  // API密钥状态
  const [isApiKeyManagerOpen, setIsApiKeyManagerOpen] = useState<boolean>(false)
  const [hasValidApiKey, setHasValidApiKey] = useState<boolean>(false)

  // 初始化历史记录
  // 修改初始化历史记录的 useEffect 钩子
  useEffect(() => {
    if (history.length === 0) {
      const defaultTopic = language === 'zh' ? '目录' : 'Directory'
      handleSearch(defaultTopic)
    } else {
      // 检查URL参数，尝试从URL恢复状态
      const urlParams = new URLSearchParams(window.location.search)
      const topicFromUrl = urlParams.get('topic')

      if (topicFromUrl) {
        const decodedTopic = decodeURIComponent(topicFromUrl)
        setCurrentTopic(decodedTopic)
        // 添加这行来设置currentTopicWithPage
        setCurrentTopicWithPage(decodedTopic)
        setCurrentIndex(0)
        setHistory([decodedTopic])

        if (decodedTopic === '目录' || decodedTopic === 'Directory') {
          setIsDirectory(true)
        }
      } else if (window.history.state === null) {
        // 既没有URL参数也没有history状态，设置默认状态
        window.history.replaceState(
          { historyIndex: currentIndex, topic: currentTopic },
          '',
          `?topic=${encodeURIComponent(currentTopic)}`
        )
      }
    }
  }, [language, history.length])
  // 检查 API 密钥状态
  useEffect(() => {
    setHasValidApiKey(hasApiKey())
  }, [])

  // 添加新的useEffect钩子来更新文档标题
  useEffect(() => {
    document.title = `${currentBookTitle}(开发中)`
  }, [currentBookTitle, language])

  // 添加目录状态缓存更新的useEffect钩子
  useEffect(() => {
    const handleDirectoryCacheUpdate = (event: Event) => {
      if (event.type === 'updateDirectoryCache') {
        const { detail } = event as CustomEvent<{
          categoryMode: 'subject' | 'page'
          pageFilter: string
          selectedSubject: string
        }>
        setDirectoryStateCache(detail)
      }
    }

    document.addEventListener(
      'updateDirectoryCache',
      handleDirectoryCacheUpdate
    )
    return () => {
      document.removeEventListener(
        'updateDirectoryCache',
        handleDirectoryCacheUpdate
      )
    }
  }, [])

  // 添加effect来提取并设置可用的音频轨道
  useEffect(() => {
    if (directoryData && Object.keys(directoryData).length > 0) {
      const availableTracks: string[] = []

      // 遍历目录数据，提取所有的preview_url
      Object.values(directoryData).forEach(categoryItems => {
        categoryItems.forEach(item => {
          if (item.track?.preview_url) {
            availableTracks.push(item.track.preview_url)
          }
        })
      })

      // 调用audioManager的setAvailableTracks方法
      audioManager.setAvailableTracks(availableTracks)
    }
  }, [directoryData])

  // 处理 API 密钥变化
  const handleApiKeyChange = (apiKey: string) => {
    setHasValidApiKey(!!apiKey)
    // 修复：使用setTimeout强制触发重新渲染和内容加载
    setTimeout(() => {
      // 重新触发搜索，确保内容根据新的API密钥状态重新加载
      if (
        currentTopic &&
        currentTopic !== '目录' &&
        currentTopic !== 'Directory'
      ) {
        handleSearch(currentTopic)
      }
    }, 100)
  }

  // 导航函数
  const handleForward = () => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setCurrentTopic(history[currentIndex + 1])
    }
  }

  const handleWordClick = (word: string, page?: string) => {
    // 如果有页码信息，组合词条和页码
    const topicWithPage = page ? `${word} ${page}` : word
    handleSearch(topicWithPage)
  }

  const handleMultiSearch = (words: string[]) => {
    const combinedTopic = words.join(' ')
    handleSearch(combinedTopic)
  }

  // 在组件顶部添加 useEffect 钩子来监听浏览器的 popstate 事件
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // 从事件状态中获取保存的历史索引
      const state = event.state
      if (state && state.historyIndex !== undefined) {
        const newIndex = state.historyIndex

        // 增强的范围检查和回退策略
        if (newIndex >= 0 && newIndex < history.length) {
          // 正常情况：索引在有效范围内
          const newTopic = history[newIndex]
          setCurrentIndex(newIndex)
          setCurrentTopic(newTopic)

          // 处理目录页的特殊情况
          if (newTopic === '目录' || newTopic === 'Directory') {
            setIsDirectory(true)
            document.dispatchEvent(
              new CustomEvent('restoreDirectoryState', {
                detail: directoryStateCache
              })
            )
          }
        } else if (state.topic) {
          // 降级方案1：索引无效但有topic，直接跳转到该主题
          setCurrentTopic(state.topic)
          setCurrentIndex(0)
          setHistory([state.topic])

          if (state.topic === '目录' || state.topic === 'Directory') {
            setIsDirectory(true)
            document.dispatchEvent(
              new CustomEvent('restoreDirectoryState', {
                detail: directoryStateCache
              })
            )
          }
        } else {
          // 降级方案2：完全无法恢复时，重置到目录页
          const defaultTopic = language === 'zh' ? '目录' : 'Directory'
          setCurrentTopic(defaultTopic)
          setCurrentIndex(0)
          setHistory([defaultTopic])
          setIsDirectory(true)
        }
      } else {
        // 从URL参数中尝试恢复状态
        const urlParams = new URLSearchParams(window.location.search)
        const topicFromUrl = urlParams.get('topic')

        if (topicFromUrl) {
          const decodedTopic = decodeURIComponent(topicFromUrl)
          setCurrentTopic(decodedTopic)
          setCurrentIndex(0)
          setHistory([decodedTopic])

          if (decodedTopic === '目录' || decodedTopic === 'Directory') {
            setIsDirectory(true)
          }
        }
      }
    }

    // 监听 popstate 事件
    window.addEventListener('popstate', handlePopState)

    // 清理函数
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [history, directoryStateCache])

  const handleSearch = (topic: string, page?: Array<string>) => {
    const newTopic = topic.trim()
    if (newTopic && newTopic.toLowerCase() !== currentTopic.toLowerCase()) {
      const page_txt = page?.length ? ` 第${page.join('、')}页` : ''
      const topicWithPage = page
        ? `<span style="color: rgb(155, 89, 182);">${topic}</span>${page_txt}`
        : topic
      setCurrentTopic(topic)
      setCurrentTopicWithPage(topicWithPage)
      const newHistory = history.slice(0, currentIndex + 1)
      newHistory.push(newTopic)
      setHistory(newHistory)
      const newIndex = newHistory.length - 1
      setCurrentIndex(newIndex)

      // 在pushState中包含完整的topic信息，以便恢复
      window.history.pushState(
        { historyIndex: newIndex, topic: newTopic },
        '',
        `?topic=${encodeURIComponent(newTopic)}`
      )
    }
  }

  const handleRandom = () => {
    setIsLoading(true)
    const allTerms: string[] = []
    const currentData = getCurrentDirectoryData()
    if (currentData) {
      ;(Object.values(currentData) as DirectoryItem[][]).forEach(
        categoryItems => {
          categoryItems.forEach(item => {
            if (item.term) {
              allTerms.push(item.term)
            }
          })
        }
      )
    }

    if (allTerms.length > 0) {
      const randomIndex = Math.floor(Math.random() * allTerms.length)
      let randomTerm = allTerms[randomIndex]

      if (randomTerm.toLowerCase() === currentTopic.toLowerCase()) {
        randomTerm = allTerms[(randomIndex + 1) % allTerms.length]
      }

      setCurrentTopic(randomTerm)
      const newHistory = history.slice(0, currentIndex + 1)
      newHistory.push(randomTerm)
      setHistory(newHistory)
      setCurrentIndex(newHistory.length - 1)
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1
      const prevTopic = history[prevIndex]
      setCurrentIndex(prevIndex)
      setCurrentTopic(prevTopic)
      if (prevTopic === '目录' || prevTopic === 'Directory') {
        setIsDirectory(true)
        // 当返回目录页时，发送目录状态缓存
        document.dispatchEvent(
          new CustomEvent('restoreDirectoryState', {
            detail: directoryStateCache
          })
        )
      }
    }
  }

  const handleClearCache = () => {
    const cacheKey = `${currentTopic}-${language}`
    setContentCache(prevCache => {
      const newCache = { ...prevCache }
      delete newCache[cacheKey]
      return newCache
    })
    setIsFromCache(false)
  }

  const handleRequestApiKey = () => {
    setIsApiKeyManagerOpen(true)
  }
  useEffect(() => {
    const checkAndAddPlayer = () => {
      const footer = document.querySelector('.sticky-footer')
      if (footer && !footer.querySelector('#audioPlayer')) {
        audioManager.addPlayerToContainer(footer)
      }
    }

    // 立即检查一次
    checkAndAddPlayer()

    // 使用setTimeout再次检查，确保组件完全渲染
    const timer = setTimeout(checkAndAddPlayer, 100)

    return () => clearTimeout(timer)
  }, [])
  return (
    <div>
      <SearchBar
        onSearch={handleSearch}
        onRandom={handleRandom}
        isLoading={isLoading}
        showRandomButton={!isDirectory}
        language={language}
      />

      <header>
        {/* API密钥按钮保持不变 */}
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

        {/* 书籍管理区域 */}
        <div
          style={{
            position: 'absolute',
            top: '0',
            left: '0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <input
            type='file'
            id='book-upload'
            accept='.json,.txt'
            onChange={e => {
              handleFileUpload(e)
              // 上传成功后回到目录页
              setTimeout(() => {
                const directoryTopic = language === 'zh' ? '目录' : 'Directory'
                setCurrentTopic(directoryTopic)
                setIsDirectory(true)
                setHistory([directoryTopic])
                setCurrentIndex(0)
              }, 500)
            }}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => document.getElementById('book-upload')?.click()}
            style={{
              background: '#9b59b6',
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
              language === 'zh' ? '上传书籍JSON文件' : 'Upload Book JSON File'
            }
          >
            📚 {language === 'zh' ? '上传书籍' : 'Upload Book'}
          </button>

          {/* 书籍选择器下拉菜单 */}
          {
            <div style={{ position: 'relative',display: 'flex' }}>
              <select
                value={isUsingUploadedData ? currentBookId || '' : 'default'}
                onChange={e => {
                  if (e.target.value === 'default') {
                    switchToDefaultBook()
                  } else {
                    switchToUploadedBook(e.target.value)
                  }
                }}
                style={{
                  background: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  maxWidth: '80%'
                }}
              >
                {/* 默认书籍选项始终显示默认书籍的实际标题 */}
                <option value='default'>
                  {/* 这里使用一个新的变量来获取默认书籍的标题 */}
                  {typeof directoryData?.title === 'string'
                    ? directoryData.title
                    : language === 'zh'
                    ? '启示路'
                    : 'Revelation'}
                </option>
                {uploadedBooksMetadata.map(book => (
                  <option key={book.id} value={book.id}>
                    {book.title}
                  </option>
                ))}
              </select>
            </div>
          }

          {/* 如果没有下拉菜单但正在使用上传的书籍，显示返回默认书籍按钮 */}
          {uploadedBooksMetadata.length === 0 && isUsingUploadedData && (
            <button
              onClick={switchToDefaultBook}
              style={{
                background: '#e67e22',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
              title={
                language === 'zh' ? '返回默认书籍' : 'Back to Default Book'
              }
            >
              🔙
            </button>
          )}
        </div>

        {/* 上传错误消息 */}
        {uploadErrorMessage && (
          <div
            style={{
              color: '#e74c3c',
              marginTop: '0.5rem',
              fontSize: '0.9rem'
            }}
          >
            {uploadErrorMessage}
          </div>
        )}
      </header>
      <LanguageSelector
        language={language}
        onLanguageChange={setLanguage}
        isMultiSelectMode={isMultiSelectMode}
        selectedWords={selectedWords}
        toggleMultiSelectMode={() => setIsMultiSelectMode(!isMultiSelectMode)}
        handleMultiSearch={() => handleMultiSearch(selectedWords)}
      />

      {/* 使用DocumentRenderer组件 */}
      <DocumentRenderer
        currentTopic={currentTopic}
        currentTopicWithPage={currentTopicWithPage}
        language={language}
        hasValidApiKey={hasValidApiKey}
        history={history}
        onHistoryChange={setHistory}
        contentCache={contentCache}
        onCacheClear={handleClearCache}
        isUsingUploadedData={isUsingUploadedData}
        uploadedBookName={currentBookTitle}
        onTopicChange={handleSearch}
        onRequestApiKey={handleRequestApiKey}
        getCurrentDirectoryData={getCurrentDirectoryData}
        onWordClick={handleWordClick}
        onMultiSearch={handleMultiSearch}
        currentBookTitle={currentBookTitle}
      />

      <footer
        className='sticky-footer'
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '10px 0'
        }}
      ></footer>

      <ApiKeyManager
        isOpen={isApiKeyManagerOpen}
        onClose={() => setIsApiKeyManagerOpen(false)}
        onApiKeyChange={handleApiKeyChange}
      />
    </div>
  )
}

export default App
