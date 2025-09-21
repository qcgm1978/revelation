import React, { useState, useEffect } from 'react'
// 在导入部分添加
import { hasApiKey, hasShownApiKeyPrompt, setHasShownApiKeyPrompt } from './services/wikiService'
import DocumentRenderer from './components/DocumentRenderer'

import ApiKeyManager from './components/ApiKeyManager'
// 导入书籍管理hook
import useBookManager from './hooks/useBookManager'
import audioManager from './utils/audioManager'
// 导入新创建的页面控制hook
import { usePageController } from './hooks/usePageController'
import { initializeGestureHandler } from './utils/gestureHandler';


const App: React.FC = () => {
  const [availableTracks, setAvailableTracks] = useState<Array<{    
    id: string
    name: string
    artist: string
    url: string
  }>>([])
  const [language, setLanguage] = useState<'zh' | 'en'>('zh')
  // 添加多选相关状态
  const [isMultiSelectMode, setIsMultiSelectMode] = useState<boolean>(false)
  const [selectedWords, setSelectedWords] = useState<string[]>([])
  // 添加overflow menu状态
  const [isOverflowMenuOpen, setIsOverflowMenuOpen] = useState<boolean>(false)
  useEffect(() => {
    initializeGestureHandler();
  }, []);
  
  useEffect(() => {
    // 监听关闭溢出菜单的事件
    const handleCloseOverflowMenu = () => {
      setIsOverflowMenuOpen(false);
    };
    
    window.addEventListener('closeOverflowMenu', handleCloseOverflowMenu);
    
    return () => {
      window.removeEventListener('closeOverflowMenu', handleCloseOverflowMenu);
    };
  }, []);
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
    currentBookTitle,
    isUsingUploadedData,
    uploadErrorMessage,
    uploadedBooksMetadata,
    currentBookId,
    handleFileUpload,
    switchToDefaultBook,
    switchToUploadedBook,
    getCurrentDirectoryData // Add this line
  } = useBookManager(language)

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
  const [contentCache, setContentCache] = useState<
    Record<string, { content: string; generationTime: number | null }>
  >({})

  // API密钥状态
  const [isApiKeyManagerOpen, setIsApiKeyManagerOpen] = useState<boolean>(false)
  const [hasValidApiKey, setHasValidApiKey] = useState<boolean>(true)

  // 使用页面控制hook
  const {
    currentTopic,
    currentTopicWithPage,
    history,
    handleSearch,
    handleWordClick,
  } = usePageController({
    language,
    directoryStateCache,
    getCurrentDirectoryData
  })

  useEffect(() => {
    setHasValidApiKey(hasApiKey())
  }, [])

  useEffect(() => {
    document.title = `${currentBookTitle}`
  }, [currentBookTitle, language])

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


  // 修改提取音频轨道的useEffect，更新availableTracks状态
  useEffect(() => {
    if (directoryData && Object.keys(directoryData).length > 0) {
      const tracks: string[] = []

      Object.entries(directoryData).forEach(([key, categoryItems]) => {
        if (key === '邓紫棋') {
          categoryItems.forEach(item => {
            if (item.track?.preview_url) {
              tracks.push({
                ...item.track,
                artist: item?.track?.artists[0].name,
                url: item.track.preview_url
              })
            }
          })
        }
      })

      setAvailableTracks(tracks)
      audioManager.setAvailableTracks(tracks)
    }
  }, [directoryData])

  // 修改消息处理逻辑，支持传递歌曲信息
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // 确保消息来自我们的iframe
      if (event.data && event.data.action) {
        switch (event.data.action) {
          case 'playRandomAudio':
            if (availableTracks.length > 0) {
              const randomIndex = Math.floor(
                Math.random() * availableTracks.length
              )
              const randomTrack = availableTracks[randomIndex]
              audioManager.toggleAudio(randomTrack,true)
            }
            break
          case 'stopAudio':
            // 停止音乐
            audioManager.stopAudio()
            break
          default:
            break
        }
      }
    }

    // 添加事件监听器
    window.addEventListener('message', handleMessage)

    // 清理函数
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [availableTracks])

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
    setIsApiKeyManagerOpen(false)
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
  const handleTopicChange = (topic: string, page?: string[], category?: string, context?: string) => {
        handleSearch(topic, page, category, context);
      };
  return (
    <div style={{ position: 'relative' }}>
      <header>
        <div id='menu-wrapper'>
          <button
            onClick={() => setIsOverflowMenuOpen(!isOverflowMenuOpen)}
            id='menu'
            title={
              language === 'zh' ? '更多选项' : 'More Options'
            }
          >
            ⋮
          </button>

          {isOverflowMenuOpen && (
            <div id='setting'>
              <button
                onClick={() => {
                  setIsApiKeyManagerOpen(true)
                  setIsOverflowMenuOpen(false)
                }}
                style={{
                  background: hasValidApiKey ? '#27ae60' : '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem'
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

              {/* 返回目录按钮 */}
              <button
                onClick={() => {
                  const directoryTopic = language === 'zh' ? '目录' : 'Directory'
                  handleSearch(directoryTopic)
                  setIsOverflowMenuOpen(false)
                }}
                style={{
                  background: '#1abc9c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem'
                }}
                title={
                  language === 'zh' ? '返回目录页面' : 'Back to Directory'
                }
              >
                📑 {language === 'zh' ? '返回目录' : 'Back to Directory'}
              </button>

              {/* 书籍上传按钮 */}
              <input
                type='file'
                id='book-upload'
                accept='.json,.txt'
                onChange={e => {
                  handleFileUpload(e)
                  // 上传成功后回到目录页
                  setTimeout(() => {
                    const directoryTopic = language === 'zh' ? '目录' : 'Directory'
                    // 使用handleSearch函数跳转到目录页
                    handleSearch(directoryTopic)
                  }, 500)
                  setIsOverflowMenuOpen(false)
                }}
                style={{ display: 'none' }}
              />
              <button
                onClick={() => {
                  document.getElementById('book-upload')?.click()
                  setIsOverflowMenuOpen(false)
                }}
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
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem'
                }}
                title={
                  language === 'zh' ? '上传书籍JSON文件' : 'Upload Book JSON File'
                }
              >
                📚 {language === 'zh' ? '上传书籍' : 'Upload Book'}
              </button>

              {/* 书籍选择器下拉菜单 */}
              <select
                value={isUsingUploadedData ? currentBookId || '' : 'default'}
                onChange={e => {
                  if (e.target.value === 'default') {
                    switchToDefaultBook()
                  } else {
                    switchToUploadedBook(e.target.value)
                  }
                  setIsOverflowMenuOpen(false)
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
                  width: '100%',
                  marginBottom: '0.5rem'
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

              {/* 如果没有下拉菜单但正在使用上传的书籍，显示返回默认书籍按钮 */}
              {uploadedBooksMetadata.length === 0 && isUsingUploadedData && (
                <button
                  onClick={() => {
                    switchToDefaultBook()
                    setIsOverflowMenuOpen(false)
                  }}
                  style={{
                    background: '#e67e22',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    width: '100%'
                  }}
                  title={
                    language === 'zh' ? '返回默认书籍' : 'Back to Default Book'
                  }
                >
                  🔙 {language === 'zh' ? '返回默认书籍' : 'Back to Default'}
                </button>
              )}
            </div>
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

      <DocumentRenderer
        currentTopic={currentTopic}
        currentTopicWithPage={currentTopicWithPage}
        language={language}
        hasValidApiKey={hasValidApiKey}
        history={history}
        contentCache={contentCache}
        onCacheClear={handleClearCache}
        isUsingUploadedData={isUsingUploadedData}
        uploadedBookName={currentBookTitle}
        onTopicChange={handleSearch}
        onRequestApiKey={handleRequestApiKey}
        getCurrentDirectoryData={getCurrentDirectoryData}
        onWordClick={handleWordClick}
        currentBookTitle={currentBookTitle}
       onLanguageChange={setLanguage}
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

      {isApiKeyManagerOpen && (
        <ApiKeyManager
          isOpen={isApiKeyManagerOpen}
          onSave={handleApiKeyChange}
          onClose={() => {
            setIsApiKeyManagerOpen(false)
            setHasShownApiKeyPrompt(true)
          }}
          onNavigateToWiki={() => {
            if (
              currentTopic &&
              currentTopic !== '目录' &&
              currentTopic !== 'Directory'
            ) {
              handleSearch(currentTopic)
            }
            setIsApiKeyManagerOpen(false)
            setHasShownApiKeyPrompt(true)
          }}
        />
      )}
    </div>
  )
  
  {/* 移除不需要的useEffect钩子 */}
  // useEffect(() => {
  //   // 当hasShownApiKeyPrompt变为true时，关闭API密钥管理器
  //   if (hasShownApiKeyPrompt) {
  //     setIsApiKeyManagerOpen(false)
  //   }
  // }, [hasShownApiKeyPrompt])
}
export default App