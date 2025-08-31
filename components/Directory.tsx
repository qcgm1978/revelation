import React, { useState, useEffect } from 'react'
import { DirectoryData } from '../types/directory'
import audioManager from '../utils/audioManager'
import {
  CategoryTabs,
  SubjectTabs,
  PageFilter,
  AudioControl,
  DirectoryItemsRenderer,
  getPageBasedDirectory
} from './DirectoryUtils'

interface DirectoryProps {
  directoryData: DirectoryData
  onItemClick: (term: string, pageInfo?: string[] | string) => void
  language: 'zh' | 'en'
  currentTopic?: string
  currentBookTitle: string | null;
}

// 导入新创建的HtmlLoader组件
// import HtmlLoader from './HtmlLoader'

// 在组件内部移除TimelineDisplay定义，替换为使用HtmlLoader
const Directory: React.FC<DirectoryProps> = ({
  directoryData,
  language,
  currentTopic,
  onItemClick,
  currentBookTitle
}) => {
  const [categoryMode, setCategoryMode] = useState<'subject' | 'page' | 'timeline'>(() => {
    const cachedState = localStorage.getItem('directoryState')
    if (cachedState) {
      try {
        const parsedState = JSON.parse(cachedState)
        return parsedState.categoryMode || 'subject'
      } catch (e) {
        console.error('Failed to parse cached directory state', e)
      }
    }
    return 'subject'
  })
  const [pageFilter, setPageFilter] = useState<string>(() => {
    const cachedState = localStorage.getItem('directoryState')
    if (cachedState) {
      try {
        const parsedState = JSON.parse(cachedState)
        return parsedState.pageFilter || ''
      } catch (e) {
        console.error('Failed to parse cached directory state', e)
      }
    }
    return ''
  })
  const [selectedSubject, setSelectedSubject] = useState<string>(() => {
    const cachedState = localStorage.getItem('directoryState')
    if (cachedState) {
      try {
        const parsedState = JSON.parse(cachedState)
        return parsedState.selectedSubject || ''
      } catch (e) {
        console.error('Failed to parse cached directory state', e)
      }
    }
    return ''
  })

  // 组件挂载时停止音频播放
  useEffect(() => {
    // 当组件挂载时停止任何正在播放的音频
    audioManager.stopAudio()

    return () => {
      if (currentTopic !== '目录' &&
        currentTopic !== 'Directory') {
        // 组件卸载时也停止音频
        audioManager.stopAudio()
      }
    }
  }, [currentTopic])

  // 添加效果，监听目录状态更新
  useEffect(() => {
    const handleStateUpdate = (event: Event) => {
      if (event.type === 'directoryStateUpdated') {
        const { detail } = event as CustomEvent<{
          categoryMode: 'subject' | 'page'
          pageFilter: string
          selectedSubject: string
        }>
        setCategoryMode(detail.categoryMode)
        setPageFilter(detail.pageFilter)
        setSelectedSubject(detail.selectedSubject)
      }
    }

    document.addEventListener('directoryStateUpdated', handleStateUpdate)

    return () => {
      document.removeEventListener('directoryStateUpdated', handleStateUpdate)
    }
  }, [])

  // 添加时间线iframe组件
  const TimelineDisplay = () => {
    return (
      <div style={{ width: '100%', height: '600px', overflow: 'hidden', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
        <iframe 
          src="timeline_visualization.html" 
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="时间线可视化"
        />
      </div>
    )
  }

  useEffect(() => {
    const stateToCache = {
      categoryMode,
      pageFilter,
      selectedSubject
    }
    localStorage.setItem('directoryState', JSON.stringify(stateToCache))
    document.dispatchEvent(
      new CustomEvent('updateDirectoryCache', {
        detail: stateToCache
      })
    )
  }, [categoryMode, pageFilter, selectedSubject])

  // 修复后的useEffect钩子
  useEffect(() => {
    if (categoryMode === 'subject' && Object.keys(directoryData).length > 0) {
      const isValidSubject =
        selectedSubject && Object.keys(directoryData).includes(selectedSubject)

      if (!isValidSubject) {
        setSelectedSubject(Object.keys(directoryData)[0])
      }
    }
  }, [categoryMode, directoryData, selectedSubject])

  // 决定使用哪个目录数据
  const directoryToRender =
    categoryMode === 'subject'
      ? directoryData
      : categoryMode === 'page'
      ? getPageBasedDirectory(directoryData, pageFilter)
      : {} // 当categoryMode为'timeline'时返回空对象

  // 过滤逻辑 - 确保每个item都有pages字段
  const filteredDirectory = Object.entries(
    directoryToRender as DirectoryData
  ).reduce((acc, [category, items]) => {
    const processedItems = items.map(item => ({
      ...item,
      pages: item.pages || []
    }))
    acc[category] = processedItems
    return acc
  }, {} as DirectoryData)

  return (
    <div
      style={{
        fontFamily: 'sans-serif',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        margin: '1rem auto',
        maxWidth: '1200px'
      }}
    >
      <CategoryTabs
        categoryMode={categoryMode}
        setCategoryMode={setCategoryMode}
        directoryData={directoryData}
        setSelectedSubject={setSelectedSubject}
        language={language}
        currentBookTitle={currentBookTitle}
      />
      <SubjectTabs
        categoryMode={categoryMode}
        directoryData={directoryData}
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        language={language}
      />
      {categoryMode === 'page' && (
        <div
          style={{
            textAlign: 'center',
            margin: '0.5rem',
            color: '#666',
            fontSize: '14px',
            fontStyle: 'italic'
          }}
        >
          {language === 'zh'
            ? '（基于简体平装版第一版）'
            : '(Based on Simplified Chinese Paperback Edition, First Printing)'}
        </div>
      )}
      {categoryMode === 'page' && (
        <PageFilter
          pageFilter={pageFilter}
          setPageFilter={setPageFilter}
          language={language}
        />
      )}

      <AudioControl />

      {/* Tab内容区域 */}
      <div
        style={{
          animation: 'fadeIn 0.5s ease-in-out',
          minHeight: '300px'
        }}
      >
        {categoryMode === 'timeline' ? (
          <TimelineDisplay />
        ) : (
          <DirectoryItemsRenderer
            filteredDirectory={filteredDirectory}
            categoryMode={categoryMode}
            selectedSubject={selectedSubject}
            onItemClick={onItemClick}
            language={language}
            currentBookTitle={currentBookTitle}
          />
        )}
      </div>
    </div>
  )
}

export default Directory
