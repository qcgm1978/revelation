import React, { useEffect } from 'react'
import ContentGenerator from './ContentGenerator'
import Directory from './Directory'

interface DocumentRendererProps {
  currentTopic: string
  currentTopicWithPage: string
  language: string
  hasValidApiKey: boolean
  history: string[]
  onHistoryChange: (history: string[]) => void
  contentCache: Record<string, any>
  onCacheClear: () => void
  isUsingUploadedData: boolean
  uploadedBookName: string | null
  onTopicChange: (topic: string, page?: Array<string>) => void
  onRequestApiKey: () => void
  directoryData?: Record<string, any>
  getCurrentDirectoryData?: () => Record<string, any> | undefined
  onWordClick: (word: string, page?: string) => void
  onMultiSearch: (words: string[]) => void
}

const DocumentRenderer: React.FC<DocumentRendererProps> = ({
  currentTopic,
  currentTopicWithPage,
  language,
  hasValidApiKey,
  history,
  onHistoryChange,
  contentCache,
  onCacheClear,
  isUsingUploadedData,
  uploadedBookName,
  onTopicChange,
  onRequestApiKey,
  directoryData,
  getCurrentDirectoryData,
  onWordClick,
  onMultiSearch
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
    if (!hasValidApiKey && currentTopic === '目录') {
      onRequestApiKey()
    } else {
      // 存储当前主题的类别信息
      if (category) {
        sessionStorage.setItem(`category_for_${topic}`, category)
      }
      // 如果有页码信息，组合词条和页码
      onTopicChange(topic, page instanceof Array ? page : [page])
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
            <h2 dangerouslySetInnerHTML={{ __html: currentTopicWithPage }} />
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
          />
        </div>

        {/* 无API密钥提示 */}
        {!hasValidApiKey &&
          currentTopic !== '目录' &&
          currentTopic !== 'Directory' && (
            <div className='no-api-key-prompt'>
              <div className='prompt-content'>
                <h3>当前正在使用维基百科服务</h3>
                <p>为了获得更丰富的内容生成体验，建议配置API密钥。</p>
                <button onClick={onRequestApiKey} className='configure-button'>
                  立即配置
                </button>
              </div>
            </div>
          )}
      </div>
    </div>
  )
}

export default DocumentRenderer
