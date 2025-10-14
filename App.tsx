// @ts-nocheck
import { useState, useEffect } from 'react'
import {
  hasApiKey,
  setHasShownApiKeyPrompt,
  ApiKeyManager
} from 'llm-service-provider'
import DocumentRenderer from './components/DocumentRenderer'
import Header from './components/OverflowMenu'
import useBookManager from './hooks/useBookManager'
import audioManager from './utils/audioManager'
import { usePageController } from './hooks/usePageController'
import { initializeGestureHandler } from './utils/gestureHandler'
// import TTSDebugTool from './utils/testTTs'
const App = () => {
  const [showApiManager, setShowApiManager] = useState(!hasApiKey())
  const handleApiKeySave = (key: string) => {
    console.log('API密钥已保存')
    setShowApiManager(false)
  }

  const [availableTracks, setAvailableTracks] = useState<
    Array<{
      id: string
      name: string
      artist: string
      url: string
    }>
  >([])
  const [language, setLanguage] = useState<'zh' | 'en'>('zh')

  const [isMultiSelectMode, setIsMultiSelectMode] = useState<boolean>(false)
  const [selectedWords, setSelectedWords] = useState<string[]>([])

  const [isOverflowMenuOpen, setIsOverflowMenuOpen] = useState<boolean>(false)
  useEffect(() => {
    initializeGestureHandler()
  }, [])

  useEffect(() => {
    const handleCloseOverflowMenu = () => {
      setIsOverflowMenuOpen(false)
    }

    window.addEventListener('closeOverflowMenu', handleCloseOverflowMenu)

    return () => {
      window.removeEventListener('closeOverflowMenu', handleCloseOverflowMenu)
    }
  }, [])

  useEffect(() => {
    const handleLanguageChange = (event: Event) => {
      if (event.type === 'languageChange') {
        const { detail } = event as CustomEvent<'zh' | 'en'>
        setLanguage(detail)
      }
    }

    document.addEventListener('languageChange', handleLanguageChange)
    return () => {
      document.removeEventListener('languageChange', handleLanguageChange)
    }
  }, [])

  useEffect(() => {
    audioManager.init()
    const footer = document.querySelector('.sticky-footer')
    if (footer) {
      audioManager.addPlayerToContainer(footer)
    }
  }, [])

  useEffect(() => {
    audioManager.setLanguage(language)
  }, [language])

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
    getCurrentDirectoryData
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

  const [isApiKeyManagerOpen, setIsApiKeyManagerOpen] = useState<boolean>(false)
  const [hasValidApiKey, setHasValidApiKey] = useState<boolean>(true)

  const {
    currentTopic,
    currentTopicWithPage,
    history,
    handleSearch,
    handleWordClick
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

  useEffect(() => {
    if (directoryData && Object.keys(directoryData).length > 0) {
      const tracks: any[] = []

      Object.entries(directoryData).forEach(([key, categoryItems]) => {
        if (key === '邓紫棋') {
          categoryItems.forEach((item: any) => {
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

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.action) {
        switch (event.data.action) {
          case 'playRandomAudio':
            if (availableTracks.length > 0) {
              const randomIndex = Math.floor(
                Math.random() * availableTracks.length
              )
              const randomTrack = availableTracks[randomIndex]
              audioManager.toggleAudio(randomTrack, true)
            }
            break
          case 'stopAudio':
            audioManager.stopAudio()
            break
          default:
            break
        }
      }
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [availableTracks])

  const handleApiKeyChange = (apiKey: string) => {
    setHasValidApiKey(!!apiKey)

    setTimeout(() => {
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

    checkAndAddPlayer()

    const timer = setTimeout(checkAndAddPlayer, 100)

    return () => clearTimeout(timer)
  }, [])
  const handleTopicChange = (
    topic: string,
    page?: string[],
    category?: string,
    context?: string
  ) => {
    handleSearch(topic, page, category, context)
  }
  return (
    <div style={{ position: 'relative' }}>
      {/* <TTSDebugTool /> */}
      <Header
        language={language}
        isOverflowMenuOpen={isOverflowMenuOpen}
        setIsOverflowMenuOpen={setIsOverflowMenuOpen}
        hasValidApiKey={hasValidApiKey}
        setIsApiKeyManagerOpen={setIsApiKeyManagerOpen}
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
            setIsApiKeyManagerOpen={setIsApiKeyManagerOpen}
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
          defaultPromptType='wiki'
          language={language}
          compactTemplate={true}
          styleVariant='comic1'
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
}

export default App
