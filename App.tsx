import React, { useState, useEffect } from 'react'
import { hasApiKey, setApiKey, clearApiKey } from './services/wikiService'
import DocumentRenderer from './components/DocumentRenderer'

import SearchBar from './components/SearchBar'
import ApiKeyManager from './components/ApiKeyManager'
import useBookManager from './hooks/useBookManager'
import audioManager from './utils/audioManager'
import { usePageController } from './hooks/usePageController'
import { initializeGestureHandler } from './utils/gestureHandler';
import Header from './components/Header'


const App: React.FC = () => {
  const [availableTracks, setAvailableTracks] = useState<string[]>([])
  const [language, setLanguage] = useState<'zh' | 'en'>('zh')
  // 添加多选相关状态
  useEffect(() => {
    initializeGestureHandler();
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
  const [contentCache, setContentCache] = useState<
    Record<string, { content: string; generationTime: number | null }>
  >({})

  // API密钥状态
  const [isApiKeyManagerOpen, setIsApiKeyManagerOpen] = useState<boolean>(false)
  const [hasValidApiKey, setHasValidApiKey] = useState<boolean>(false)

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
  // 在App组件中添加useEffect钩子来监听message事件
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
              audioManager.toggleAudio(randomTrack)
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

  // 修改提取音频轨道的useEffect，更新availableTracks状态
  useEffect(() => {
    if (directoryData && Object.keys(directoryData).length > 0) {
      const tracks: string[] = []

      Object.entries(directoryData).forEach(([key, categoryItems]) => {
        if (key === '邓紫棋') {
          categoryItems.forEach(item => {
            if (item.track?.preview_url) {
              tracks.push(item.track.preview_url)
            }
          })
        }
      })

      setAvailableTracks(tracks)
      // 调用audioManager的setAvailableTracks方法
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
            // 播放随机音乐
            if (availableTracks.length > 0) {
              const randomIndex = Math.floor(
                Math.random() * availableTracks.length
              )
              const randomTrack = availableTracks[randomIndex]
              // 这里需要修改，但由于随机播放时无法直接获取歌曲信息，暂时保持不变
              audioManager.toggleAudio(randomTrack)
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
      <Header
        hasValidApiKey={hasValidApiKey}
        setIsApiKeyManagerOpen={() => setIsApiKeyManagerOpen(true)}
        language={language}
        directoryData={directoryData}
        isUsingUploadedData={isUsingUploadedData}
        currentBookId={currentBookId}
        uploadedBooksMetadata={uploadedBooksMetadata}
        uploadErrorMessage={uploadErrorMessage}
        handleFileUpload={handleFileUpload}
        handleSearch={handleSearch}
        switchToDefaultBook={switchToDefaultBook}
        switchToUploadedBook={switchToUploadedBook}
      />

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
          onClose={() => setIsApiKeyManagerOpen(false)}
          onNavigateToWiki={() => {
            if (
              currentTopic &&
              currentTopic !== '目录' &&
              currentTopic !== 'Directory'
            ) {
              handleSearch(currentTopic)
            }
            setIsApiKeyManagerOpen(false)
          }}
        />
      )}
    </div>
  )
}
export default App