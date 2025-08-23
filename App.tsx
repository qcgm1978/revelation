import React, { useState, useEffect, useCallback, ChangeEvent } from 'react'
import { hasApiKey } from './services/deepseekService'
import ContentGenerator from './components/ContentGenerator'
import SearchBar from './components/SearchBar'
import ApiKeyManager from './components/ApiKeyManager'
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'
// 导入必要的依赖
import { formatFileContentFromString } from './utils/fileFormatter'
// 导入目录组件
import Directory, { DirectoryData } from './components/Directory'
// 导入书籍管理hook
import useBookManager from './hooks/useBookManager'

// 定义目录项的类型
interface DirectoryItem {
  term: string
  pages: string[]
  note?: string
}

const App: React.FC = () => {
  const [language, setLanguage] = useState<'zh' | 'en'>('zh')
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
  const [isLoading, setIsLoading] = useState<boolean>(false)
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
  useEffect(() => {
    if (history.length === 0) {
      const defaultTopic = language === 'zh' ? '目录' : 'Directory'
      handleSearch(defaultTopic)
    }
  }, [language, history.length])

  // 检查 API 密钥状态
  useEffect(() => {
    setHasValidApiKey(hasApiKey())
  }, [])

  // 处理 API 密钥变化
  const handleApiKeyChange = (apiKey: string) => {
    setHasValidApiKey(!!apiKey)
  }

  // 导航函数
  const handleForward = () => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setCurrentTopic(history[currentIndex + 1])
    }
  }

  const handleWordClick = (word: string) => {
    handleSearch(word)
  }

  const handleMultiSearch = (words: string[]) => {
    const combinedTopic = words.join(' ')
    handleSearch(combinedTopic)
  }

  const handleSearch = (topic: string) => {
    const newTopic = topic.trim()
    if (newTopic && newTopic.toLowerCase() !== currentTopic.toLowerCase()) {
      setCurrentTopic(newTopic)
      const newHistory = history.slice(0, currentIndex + 1)
      newHistory.push(newTopic)
      setHistory(newHistory)
      setCurrentIndex(newHistory.length - 1)
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
      }
    }
  }

  return (
    <div>
      <SearchBar
        onSearch={handleSearch}
        onRandom={handleRandom}
        isLoading={isLoading}
        showRandomButton={!isDirectory}
        language={language}
      />

      <header
        style={{
          textAlign: 'center',
          marginBottom: '2rem',
          position: 'relative'
        }}
      >
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
          {/* 书籍上传按钮保持不变 */}
          <input
            type='file'
            id='book-upload'
            accept='.json,.txt'
            onChange={handleFileUpload}
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
          {uploadedBooksMetadata.length > 0 && (
            <div style={{ position: 'relative' }}>
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
                  fontWeight: '500'
                }}
              >
                {/* 默认书籍选项始终显示默认书籍的实际标题 */}
                <option value='default'>
                  {/* 这里使用一个新的变量来获取默认书籍的标题 */}
                  {directoryData?.title || (language === 'zh' ? '启示录' : 'Revelation')}
                </option>
                {uploadedBooksMetadata.map(book => (
                  <option key={book.id} value={book.id}>
                    {book.title}
                  </option>
                ))}
              </select>
            </div>
          )}

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

        {/* 移除h1标签中的书名显示 */}
        <div style={{ height: '1rem' }}></div>

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

      {/* 其余的渲染逻辑保持不变 */}
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

          {isDirectory ? (
            <>
              <Directory
                directoryData={getCurrentDirectoryData()}
                language={language}
                onItemClick={term => {
                  if (hasValidApiKey) {
                    handleSearch(term)
                    setIsDirectory(false)
                  } else {
                    setIsApiKeyManagerOpen(true)
                  }
                }}
              />
              {!hasValidApiKey && (
                <div
                  style={{
                    border: '2px solid #f39c12',
                    padding: '1.5rem',
                    color: '#d68910',
                    backgroundColor: '#fef9e7',
                    borderRadius: '8px',
                    textAlign: 'center',
                    marginTop: '2rem'
                  }}
                >
                  <h3 style={{ margin: '0 0 1rem 0', color: '#d68910' }}>
                    🔑{' '}
                    {language === 'zh'
                      ? '需要配置 API 密钥'
                      : 'API Key Required'}
                  </h3>
                  <p style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>
                    {language === 'zh'
                      ? '请点击右上角的"配置"按钮，输入你的 DeepSeek API 密钥以查看详细内容。'
                      : 'Please click the "Configure" button in the top right corner to enter your DeepSeek API key to view detailed content.'}
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
            </>
          ) : hasValidApiKey ? (
            <ContentGenerator
              currentTopic={currentTopic}
              language={language}
              hasValidApiKey={hasValidApiKey}
              onWordClick={handleWordClick}
              onMultiSearch={handleMultiSearch}
            />
          ) : (
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
