// @ts-nocheck
import { useEffect } from 'react'
import ContentGenerator from './ContentGenerator'
import Directory from './Directory'
import { chapterPage, ChapterPageData, ChapterPageItem } from '../config'

interface DocumentRendererProps {
  currentTopic: string
  currentTopicWithPage: string
  language: string
  hasValidApiKey: boolean
  history: string[]
  contentCache: Record<string, any>
  onCacheClear: () => void
  isUsingUploadedData: boolean
  uploadedBookName: string | null
  onTopicChange: (topic: string, page?: Array<string>, context?: string) => void
  onRequestApiKey: () => void
  directoryData?: Record<string, any>
  getCurrentDirectoryData?: () => Record<string, any> | undefined
  onWordClick: (word: string, page?: string) => void
  currentBookTitle: string | null
  onLanguageChange: (language: 'zh' | 'en') => void
  setIsApiKeyManagerOpen: (open: boolean) => void
}

// 类型已从config.ts导入

const DocumentRenderer = ({
  currentTopic,
  currentTopicWithPage,
  language,
  hasValidApiKey,
  contentCache,
  onCacheClear,
  onTopicChange,
  onRequestApiKey,
  directoryData,
  getCurrentDirectoryData,
  onWordClick,
  currentBookTitle,
  onLanguageChange,
  setIsApiKeyManagerOpen,
}: DocumentRendererProps) => {
  const extractPageNumber = (
    topic: string
  ): { num: number | null; type: string | null } => {
    const match = topic.match(/(\d+)(页|章)|序/)
    const is_prologue = topic.match(/序/)
    return {
      num: is_prologue ? 0 : match ? parseInt(match[1], 10) : null,
      type: is_prologue ? '序' : match ? match[2] : null
    }
  }

  const findChapterByIdByPageNumber = (num_unit: {
    num: number | null
    type: string | null
  }): string | null => {
    // 类型断言为实际的数组结构
    const chapterData = chapterPage as ChapterPageData;
    
    // 如果是序章或前言，查找标题包含"序"的章节
    if (num_unit.type === '序' || num_unit.num === 0) {
      const prologueChapter = chapterData.find(chapter => 
        chapter.title.includes('序') || chapter.realChapterOrder === '0' || chapter.realChapterOrder === '1'
      );
      return prologueChapter?.itemId || null;
    }
    
    // 如果是按章节号查找
    if (num_unit.type === '章' && num_unit.num !== null) {
      // 尝试直接通过realChapterOrder匹配
      const chapterByOrder = chapterData.find(chapter => 
        parseInt(chapter.title) === num_unit.num
      );
      if (chapterByOrder) {
        return chapterByOrder.itemId;
      }
      
      // 尝试通过标题匹配
      const chapterByTitle = chapterData.find(chapter => {
        const titleMatch = chapter.title.match(/^(\d+)\s*/);
        return titleMatch && parseInt(titleMatch[1]) === num_unit.num;
      });
      return chapterByTitle?.itemId || null;
    }
    
    // 如果是按页码范围查找（假设页码对应章节顺序）
    if (num_unit.num !== null && num_unit.num > 0) {
      // 确保数据已排序
      const sortedChapters = [...chapterData].sort((a, b) => 
        parseInt(a.realChapterOrder) - parseInt(b.realChapterOrder)
      );
      
      // 简单的页码到章节的映射（假设页码从1开始，与章节顺序对应）
      const chapterIndex = Math.min(num_unit.num - 1, sortedChapters.length - 1);
      return sortedChapters[chapterIndex]?.itemId || null;
    }
    
    return null;
  }

  const handleTitleClick = (e: React.MouseEvent) => {
    const num_unit = extractPageNumber(currentTopicWithPage)
    const pageNumber = num_unit.num
    if (!isNaN(pageNumber)) {
      const chapterId = findChapterByIdByPageNumber(num_unit)
      if (chapterId) {
        window.open(`https://fanqienovel.com/reader/${chapterId}`, '_blank')
      }
    }
  }

  const hasPageNumber = (topic: string): boolean => {
    return topic && extractPageNumber(topic).num !== null
  }
  const handleClearCacheAndRefresh = () => {
    onCacheClear()
    onTopicChange(currentTopic)
  }

  ;<ContentGenerator
    currentTopic={currentTopic}
    language={language as 'zh' | 'en'}
    hasValidApiKey={hasValidApiKey}
    onWordClick={onWordClick}
    directoryData={
      getCurrentDirectoryData ? getCurrentDirectoryData() : directoryData
    }
  />

  const handleDirectoryItemClick = (
    topic: string,
    item?: object,
    category?: string
  ) => {
    onTopicChange(topic, item.chapters && item.chapters instanceof Array ? item.chapters : item.pages instanceof Array ? item.pages : [item.pages], category)
    if (!hasValidApiKey && currentTopic === '目录') {
      onRequestApiKey()
    } else {
      if (category) {
        sessionStorage.setItem(`category_for_${topic}`, category)
      }
    }
  }

  useEffect(() => {
    const handleRestoreState = (event: Event) => {
      if (event.type === 'restoreDirectoryState') {
        const { detail } = event as CustomEvent<{
          categoryMode: 'subject' | 'page'
          pageFilter: string
          selectedSubject: string
        }>

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
        <div className='current-topic-container'>
          {currentTopic !== '目录' && currentTopic !== 'Directory' && (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}
              />
              {hasPageNumber(currentTopicWithPage) ? (
                <h2
                  onClick={handleTitleClick}
                  style={{
                    cursor: 'pointer',
                    color: '#1a0dab',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '90%'
                  }}
                  dangerouslySetInnerHTML={{
                    __html:
                      currentTopicWithPage +
                      ' <a style="text-decoration:none;">🔗</a>'
                  }}
                />
              ) : (
                <h2
                  style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '90%'
                  }}
                  dangerouslySetInnerHTML={{ __html: currentTopicWithPage }}
                />
              )}
            </>
          )}
          <div className='topic-actions'>
            {currentTopicWithPage && contentCache[currentTopicWithPage] && (
              <button
                onClick={handleClearCacheAndRefresh}
                className='clear-cache-button'
              >
                🗑️ 清除缓存并刷新
              </button>
            )}
          </div>
        </div>

        {(currentTopic === '目录' || currentTopic === 'Directory') && (
          <Directory
            directoryData={
              getCurrentDirectoryData
                ? getCurrentDirectoryData()
                : directoryData || {}
            }
            language={language as 'zh' | 'en'}
            currentTopic={currentTopic}
            onItemClick={handleDirectoryItemClick}
            currentBookTitle={currentBookTitle}
          />
        )}

        <div className='content-area'>
          <ContentGenerator
            currentTopic={currentTopic}
            language={language as 'zh' | 'en'}
            hasValidApiKey={hasValidApiKey}
            onWordClick={onWordClick}
            directoryData={
              getCurrentDirectoryData
                ? getCurrentDirectoryData()
                : directoryData || {}
            }
            onSearch={onTopicChange}
            onRandom={onRequestApiKey}
            setIsApiKeyManagerOpen={setIsApiKeyManagerOpen}
          />
        </div>
      </div>
    </div>
  )
}

export default DocumentRenderer
