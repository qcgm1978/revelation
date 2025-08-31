import React, { useState, useEffect } from 'react'
import ContentGenerator from './ContentGenerator'
import Directory from './Directory'
import LanguageSelector from './LanguageSelector'
import chapterPageData from '../public/chapter_page.json'
import { Capacitor } from '@capacitor/core'

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
  onTopicChange: (topic: string, page?: Array<string>) => void
  onRequestApiKey: () => void
  directoryData?: Record<string, any>
  getCurrentDirectoryData?: () => Record<string, any> | undefined
  onWordClick: (word: string, page?: string) => void
  currentBookTitle: string | null
  onLanguageChange: (language: 'zh' | 'en') => void
}

interface ChapterPageData {
  prologue?: {
    title: string
    content?: string
    page: number
    id: string
  }
  [key: string]: {
    title?: string
    englishTitle?: string
    chapters?: Array<{
      title: string
      page: number
      id: string
    }>
  } | undefined
}

const DocumentRenderer: React.FC<DocumentRendererProps> = ({ currentTopic, currentTopicWithPage, language, hasValidApiKey, history, contentCache, onCacheClear, onTopicChange, onRequestApiKey, directoryData, getCurrentDirectoryData, onWordClick, currentBookTitle, onLanguageChange }) => {
  // 从当前主题中提取页数
  const extractPageNumber = (topic: string): number | null => {
    const match = topic.match(/第(\d+)页/)
    return match ? parseInt(match[1], 10) : null
  }

  // 根据页数查找章节ID
  const findChapterByIdByPageNumber = (pageNumber: number): string | null => {
    const chapterData = chapterPageData as ChapterPageData
    let foundChapter: { id: string } | null = null
    
    // 先检查序章
    if (chapterData.prologue) {
      const prologuePage = chapterData.prologue.page
      let nextChapterPage = Infinity
      
      // 查找第一本书的第一章作为序章的下一章
      for (const bookKey in chapterData) {
        const book = chapterData[bookKey]
        if (book?.chapters && book.chapters.length > 0) {
          nextChapterPage = book.chapters[0].page
          break
        }
      }
      
      // 检查当前页数是否在序章范围内
      if (pageNumber >= prologuePage && pageNumber < nextChapterPage) {
        foundChapter = { id: chapterData.prologue.id }
      }
    }
    
    // 如果没有找到，检查所有章节
    if (!foundChapter) {
      let allChapters: Array<{ page: number; id: string; nextPage?: number }> = []
      
      // 收集所有章节及其页码
      for (const bookKey in chapterData) {
        const book = chapterData[bookKey]
        if (book?.chapters) {
          allChapters = allChapters.concat(book.chapters)
        }
      }
      
      // 按页码排序
      allChapters.sort((a, b) => a.page - b.page)
      
      // 查找当前页数所在的章节
      for (let i = 0; i < allChapters.length; i++) {
        const current = allChapters[i]
        const next = allChapters[i + 1]
        
        // 检查当前页数是否在当前章节和下一章节之间
        if (pageNumber >= current.page && (!next || pageNumber < next.page)) {
          foundChapter = current
          break
        }
      }
    }
    
    return foundChapter?.id || null
  }

  // 处理标题点击事件
  const handleTitleClick = (e: React.MouseEvent) => {
    const pageNumber = extractPageNumber(currentTopicWithPage)
    if (pageNumber) {
      const chapterId = findChapterByIdByPageNumber(pageNumber)
      if (chapterId) {
        // 使用固定的书籍ID
        // open_fanqie_page(chapterId)
          window.open(`https://fanqienovel.com/reader/${chapterId}`, '_blank')
      }
    }
  }

  // 检查是否包含页数信息
  const hasPageNumber = (topic: string): boolean => {
    return extractPageNumber(topic) !== null
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

  // 修改handleDirectoryItemClick函数
  const handleDirectoryItemClick = (
    topic: string,
    page?: Array<string>,
    category?: string
  ) => {
    onTopicChange(topic, page instanceof Array ? page : [page],category)
    if (!hasValidApiKey && currentTopic === '目录') {
      onRequestApiKey()
    } else {
      // 存储当前主题的类别信息
      if (category) {
        sessionStorage.setItem(`category_for_${topic}`, category)
      }
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
        <div className='current-topic-container'>
          {currentTopic !== '目录' && currentTopic !== 'Directory' && (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}
              >
                <button
                  onClick={() => onTopicChange('目录')}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    marginRight: '1rem'
                  }}
                >
                  ← 返回目录
                </button>
                <LanguageSelector
                  language={language as 'zh' | 'en'}
                  onLanguageChange={onLanguageChange}
                />
              </div>
              {hasPageNumber(currentTopicWithPage) ? (
              <h2
                onClick={handleTitleClick}
                style={{
                  cursor: 'pointer',
                  color: '#1a0dab',
                  // textDecoration: 'underline'
                }}
                dangerouslySetInnerHTML={{ __html: currentTopicWithPage + ' <a style="text-decoration:none;">🔗</a>' }}
              />
            ) : (
              <h2
                dangerouslySetInnerHTML={{ __html: currentTopicWithPage }}
              />
            )}
            </>
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
            language={language as 'zh' | 'en'}
            currentTopic={currentTopic}
            onItemClick={handleDirectoryItemClick}
            currentBookTitle={currentBookTitle}
          />
        )}

        {/* 主内容区域 */}
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
function open_fanqie_page(chapterId: string) {
  const targetUrl = `https://changdunovel.com/wap/share-v2.html?aid=1967&book_id=7537238965661748249&share_type=0&share_code=diY8wJs2nFZl3ncaE8fjlbOqax0PrWOUwyCmWbwPJO8%3D&uid=ed27e473107013f0b4b569bad2db5377&share_id=zLDRwV3Rbs6QEwUEIOCxEfOxVMHv6P1_KZZvgliYD3o%3D&use_open_launch_app=1&user_id=f383434d8b7e976fcc2bd49879b48cce&did=ed27e473107013f0b4b569bad2db5377&entrance=reader_paragraph&zlink=https%3A%2F%2Fzlink.fqnovel.com%2FdhVGe&gd_label=click_schema_lhft_share_novelapp_android&source_channel=wechat&share_channel=wechat&type=book&share_timestamp=1756565140&share_token=609159f2-caaf-454d-955c-7458f4bad7f3`

  try {
    // 对于Android，直接使用webview的方式打开URL
    if (Capacitor.isNativePlatform()) {
      // 创建一个临时链接元素并触发点击
      const link = document.createElement('a')
      link.href = targetUrl
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      // 在网页环境中，继续使用浏览器打开
      window.open(`https://fanqienovel.com/reader/${chapterId}`, '_blank')
    }
  } catch (err) {
    // 捕获任何可能的错误并回退到备用方案
    console.error('打开链接失败:', err)
    window.open(`https://fanqienovel.com/reader/${chapterId}`, '_blank')
  }
}

