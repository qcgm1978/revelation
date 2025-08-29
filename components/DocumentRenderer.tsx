import React, { useEffect } from 'react'
import ContentGenerator from './ContentGenerator'
import Directory from './Directory'

// 修改DocumentRendererProps接口，移除onHistoryChange属性
interface DocumentRendererProps {
  currentTopic: string
  currentTopicWithPage: string
  language: string
  hasValidApiKey: boolean
  history: string[]
  // 移除这一行：onHistoryChange: (history: string[]) => void
  contentCache: Record<string, any>
  onCacheClear: () => void
  isUsingUploadedData: boolean
  uploadedBookName: string | null
  onTopicChange: (topic: string, page?: Array<string>) => void
  onRequestApiKey: () => void
  directoryData?: Record<string, any>
  getCurrentDirectoryData?: () => Record<string, any> | undefined
  onWordClick: (word: string, page?: string) => void
  currentBookTitle: string | null;
  onMultiSearch: (words: string[]) => void
}

// 修改组件定义，移除onHistoryChange参数
const DocumentRenderer: React.FC<DocumentRendererProps> = ({
  currentTopic,
  currentTopicWithPage,
  language,
  hasValidApiKey,
  history,
  // 移除这一行：onHistoryChange,
  contentCache,
  onCacheClear,
  isUsingUploadedData,
  uploadedBookName,
  onTopicChange,
  onRequestApiKey,
  directoryData,
  getCurrentDirectoryData,
  onWordClick,
  onMultiSearch,
  currentBookTitle
}) => {
  const handleForward = () => {
    const currentIndex = history.indexOf(currentTopic)
    if (currentIndex < history.length - 1) {
      onTopicChange(history[currentIndex + 1])
    }
  }

  const handleBack = () => {
    const currentIndex = history.indexOf(currentTopic)
    if (currentIndex > 0) {
      onTopicChange(history[currentIndex - 1])
    }
  }

  const handleClearCacheAndRefresh = () => {
    onCacheClear()
    onTopicChange(currentTopic)
  }

  const isAtFirstTopic = history.indexOf(currentTopic) === 0
  const isAtLastTopic = history.indexOf(currentTopic) === history.length - 1

  ;<ContentGenerator
    currentTopic={currentTopic}
    language={language as "zh" | "en"}
    hasValidApiKey={hasValidApiKey}
    onWordClick={onWordClick}
    onMultiSearch={onMultiSearch}
    directoryData={
      getCurrentDirectoryData ? getCurrentDirectoryData() : directoryData
    }
  />

  // 修改handleDirectoryItemClick函数
  const handleDirectoryItemClick = (
    topic: string,
    page?: Array<string>,
    category?: string
  ) => {
    onTopicChange(topic, page instanceof Array ? page : [page])
    if (!hasValidApiKey && currentTopic === '目录') {
      onRequestApiKey()
    } else {
      // 存储当前主题的类别信息
      if (category) {
        sessionStorage.setItem(`category_for_${topic}`, category)
      }
      // 如果有页码信息，组合词条和页码
    }
  }

  // 添加目录状态缓存效果
  useEffect(() => {
    const handleRestoreState = (event: Event) => {
      if (event.type === 'restoreDirectoryState') {
        const { detail } = event as CustomEvent<{
          categoryMode: 'subject' | 'page'
          pageFilter: string
          selectedSubject: string
        }>
        // 立即发送到Directory组件
        document.dispatchEvent(
          new CustomEvent('directoryStateUpdated', {
            detail
          })
        )
      }
    }

    document.addEventListener('restoreDirectoryState', handleRestoreState)
    return () => {
      document.removeEventListener('restoreDirectoryState', handleRestoreState)
    }
  }, [])

  return (
    <div className='app-container'>
      <div className='main-content'>
        {/* 导航按钮 */}

        {/* 当前主题和缓存状态 */}
        <div className='current-topic-container'>
          {(currentTopic !== '目录' && currentTopic !== 'Directory') && (
            <h2 
              dangerouslySetInnerHTML={{ __html: currentTopicWithPage }} 
              style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#2c3e50',
                marginBottom: '1.5rem',
                paddingBottom: '0.5rem',
                borderBottom: '3px solid #3498db',
                textAlign: 'center',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            />
          )}
          <div className='topic-actions'>
            {contentCache[currentTopicWithPage] && (
              <button
                onClick={handleClearCacheAndRefresh}
                className='clear-cache-button'
              >
                🗑️ 清除缓存并刷新
              </button>
            )}
          </div>
        </div>

        {/* 目录 - 修改为始终显示目录 */}
        {(currentTopic === '目录' || currentTopic === 'Directory') && (
          <Directory
            directoryData={
              getCurrentDirectoryData
                ? getCurrentDirectoryData()
                : directoryData || {}
            }
            language={language as "zh" | "en"}
            currentTopic={currentTopic}
            onItemClick={handleDirectoryItemClick}
            currentBookTitle={currentBookTitle}
          />
        )}

        {/* 主内容区域 */}
        <div className='content-area'>
          <ContentGenerator
            currentTopic={currentTopic}
            language={language as "zh" | "en"}
            hasValidApiKey={hasValidApiKey}
            onWordClick={onWordClick}
            onMultiSearch={onMultiSearch}
            directoryData={
              getCurrentDirectoryData
                ? getCurrentDirectoryData()
                : directoryData || {}
            }
            // 添加SearchBar需要的props
            onSearch={onTopicChange}
            onRandom={onRequestApiKey}
          />
        </div>
      </div>
    </div>
  )
}

export default DocumentRenderer
