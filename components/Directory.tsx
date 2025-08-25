import React, { useState, useEffect } from 'react'
import { FaArrowLeft, FaArrowRight, FaPlay, FaPause } from 'react-icons/fa'
import { DirectoryData } from '../types/directory'
import audioManager from '../utils/audioManager'

// 定义目录项的类型
interface DirectoryItem {
  term: string
  pages: string[]
  note?: string
  preview_url?: string
}

interface DirectoryProps {
  directoryData: DirectoryData
  onItemClick: (term: string, pageInfo?: string[] | string) => void
  language: 'zh' | 'en'
  currentTopic?: string
}

const Directory: React.FC<DirectoryProps> = ({
  directoryData,
  onItemClick,
  language,
  currentTopic
}) => {
  const [categoryMode, setCategoryMode] = useState<'subject' | 'page'>(
    'subject'
  )
  const [pageFilter, setPageFilter] = useState<string>('')
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
  // 添加音频播放状态
  // const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  // const [isPlaying, setIsPlaying] = useState(false)

  // 修改音频播放控制函数
  const toggleAudio = (url?: string) => {
    audioManager.toggleAudio(url)
  }

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
  }, [])

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

    const cachedState = localStorage.getItem('directoryState')
    if (cachedState) {
      try {
        const parsedState = JSON.parse(cachedState)
        setCategoryMode(parsedState.categoryMode)
        setPageFilter(parsedState.pageFilter)
        setSelectedSubject(parsedState.selectedSubject)
      } catch (e) {
        console.error('Failed to parse cached directory state', e)
      }
    }

    return () => {
      document.removeEventListener('directoryStateUpdated', handleStateUpdate)
    }
  }, [])

  // 添加效果，在状态变化时保存到缓存
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

  // 翻译目录类别
  const translateCategory = (category: string): string => {
    const categoryTranslations: Record<string, string> = {
      基础概念: 'Basic Concepts',
      哲学思想: 'Philosophical Thoughts',
      科学理论: 'Scientific Theories',
      艺术表达: 'Artistic Expression',
      文学概念: 'Literary Concepts',
      心理学: 'Psychology',
      社会学: 'Sociology',
      宗教与信仰: 'Religion & Belief',
      历史事件: 'Historical Events',
      数学与逻辑: 'Mathematics & Logic',
      物理现象: 'Physical Phenomena',
      生物学: 'Biology',
      技术与创新: 'Technology & Innovation',
      经济学: 'Economics',
      政治理论: 'Political Theories',
      环境与生态: 'Environment & Ecology',
      语言学: 'Linguistics',
      音乐理论: 'Music Theory',
      电影艺术: 'Film Arts',
      建筑设计: 'Architectural Design'
    }

    return categoryTranslations[category] || category
  }

  // 按书页组织目录数据
  const getPageBasedDirectory = (
    filter?: string
  ): Record<string, DirectoryItem[]> => {
    const pageMap: Record<string, DirectoryItem[]> = {}

    ;(Object.values(directoryData) as DirectoryItem[][]).forEach(items => {
      items.forEach(item => {
        item.pages.forEach(page => {
          if (!pageMap[page]) {
            pageMap[page] = []
          }
          pageMap[page].push(item)
        })
      })
    })

    let filteredPages = Object.keys(pageMap)
    if (filter) {
      filteredPages = filteredPages.filter(page => page.includes(filter))
    }

    const sortedPageMap: Record<string, DirectoryItem[]> = {}
    filteredPages
      .sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, ''), 10)
        const numB = parseInt(b.replace(/\D/g, ''), 10)
        return numA - numB
      })
      .forEach(page => {
        sortedPageMap[page] = pageMap[page]
      })

    return sortedPageMap
  }

  // 页码筛选输入框
  const renderPageFilter = () => {
    if (categoryMode !== 'page') return null

    return (
      <div
        style={{
          marginBottom: '1.5rem',
          textAlign: 'center',
          padding: '1rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}
      >
        <input
          type='text'
          placeholder={
            language === 'zh'
              ? '输入页码筛选...'
              : 'Enter page number to filter...'
          }
          value={pageFilter}
          onChange={e => setPageFilter(e.target.value)}
          style={{
            padding: '0.75rem',
            borderRadius: '4px',
            border: '1px solid #ddd',
            width: '250px',
            marginRight: '0.5rem',
            fontSize: '1rem',
            transition: 'border-color 0.3s ease'
          }}
          onFocus={e => (e.currentTarget.style.borderColor = '#3498db')}
          onBlur={e => (e.currentTarget.style.borderColor = '#ddd')}
        />
        <button
          onClick={() => setPageFilter('')}
          style={{
            background: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '0.75rem 1.5rem',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = '#c0392b'
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(231, 76, 60, 0.3)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = '#e74c3c'
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          {language === 'zh' ? '清除' : 'Clear'}
        </button>
      </div>
    )
  }

  // 切换分类模式的Tab
  const renderCategoryTabs = () => {
    const hasPageData = Object.values(directoryData).some(categoryItems =>
      categoryItems.some(
        item => Array.isArray(item.pages) && item.pages.length > 0
      )
    )

    return (
      <div
        style={{
          marginBottom: '2rem',
          borderBottom: '2px solid #e9ecef',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <button
          onClick={() => {
            setCategoryMode('subject')
            if (Object.keys(directoryData).length > 0) {
              setSelectedSubject(Object.keys(directoryData)[0])
            }
          }}
          style={{
            background: 'none',
            color: categoryMode === 'subject' ? '#3498db' : '#6c757d',
            border: 'none',
            borderBottom:
              categoryMode === 'subject'
                ? '3px solid #3498db'
                : '3px solid transparent',
            borderRadius: '8px 8px 0 0',
            padding: '1rem 2rem',
            cursor: 'pointer',
            fontWeight: categoryMode === 'subject' ? 'bold' : 'normal',
            fontSize: '1rem',
            transition: 'all 0.3s ease',
            position: 'relative',
            bottom: '-2px'
          }}
        >
          {language === 'zh' ? '按主题分类' : 'By Subject'}
        </button>
        {hasPageData && (
          <button
            onClick={() => setCategoryMode('page')}
            style={{
              background: 'none',
              color: categoryMode === 'page' ? '#3498db' : '#6c757d',
              border: 'none',
              borderBottom:
                categoryMode === 'page'
                  ? '3px solid #3498db'
                  : '3px solid transparent',
              borderRadius: '8px 8px 0 0',
              padding: '1rem 2rem',
              cursor: 'pointer',
              fontWeight: categoryMode === 'page' ? 'bold' : 'normal',
              fontSize: '1rem',
              transition: 'all 0.3s ease',
              position: 'relative',
              bottom: '-2px'
            }}
          >
            {language === 'zh' ? '按书页分类' : 'By Page'}
          </button>
        )}
      </div>
    )
  }

  // 渲染学科Tab
  const renderSubjectTabs = () => {
    if (categoryMode !== 'subject' || Object.keys(directoryData).length === 0)
      return null

    return (
      <div
        style={{
          marginBottom: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0.5rem',
          padding: '1rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}
      >
        {Object.keys(directoryData).map(category => (
          <button
            key={category}
            onClick={() => setSelectedSubject(category)}
            style={{
              background: selectedSubject === category ? '#3498db' : 'white',
              color: selectedSubject === category ? 'white' : '#2c3e50',
              border: `1px solid ${
                selectedSubject === category ? '#3498db' : '#ddd'
              }`,
              borderRadius: '20px',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: selectedSubject === category ? 'bold' : 'normal',
              transition: 'all 0.3s ease',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={e => {
              if (selectedSubject !== category) {
                e.currentTarget.style.backgroundColor = '#f0f8ff'
                e.currentTarget.style.borderColor = '#3498db'
              }
            }}
            onMouseLeave={e => {
              if (selectedSubject !== category) {
                e.currentTarget.style.backgroundColor = 'white'
                e.currentTarget.style.borderColor = '#ddd'
              }
            }}
          >
            {language === 'zh' ? category : translateCategory(category)}
          </button>
        ))}
      </div>
    )
  }

  // 决定使用哪个目录数据
  const directoryToRender =
    categoryMode === 'subject'
      ? directoryData
      : getPageBasedDirectory(pageFilter)

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

  // 修复后的useEffect钩子
  React.useEffect(() => {
    if (categoryMode === 'subject' && Object.keys(directoryData).length > 0) {
      const isValidSubject =
        selectedSubject && Object.keys(directoryData).includes(selectedSubject)

      if (!isValidSubject) {
        setSelectedSubject(Object.keys(directoryData)[0])
      }
    }
  }, [categoryMode, directoryData, selectedSubject])

  return (
    <div
      style={{
        fontFamily: 'sans-serif',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        padding: '2rem',
        margin: '1rem auto',
        maxWidth: '1200px'
      }}
    >
      {renderCategoryTabs()}
      {renderSubjectTabs()}
      {categoryMode === 'page' && (
        <div
          style={{
            textAlign: 'center',
            marginBottom: '1rem',
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
      {renderPageFilter()}

      {/* 音乐播放控制按钮 */}
      {audioManager.isAudioPlaying() && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '5px',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            zIndex: 1000
          }}
          onClick={() => toggleAudio()}
        >
          <FaPause size={16} style={{ marginRight: '8px' }} />
          <span>暂停音乐</span>
        </div>
      )}

      {/* Tab内容区域 */}
      <div
        style={{
          animation: 'fadeIn 0.5s ease-in-out',
          minHeight: '300px'
        }}
      >
        {Object.entries(filteredDirectory).length > 0 ? (
          // 在学科模式下只显示选中的学科
          categoryMode === 'subject' && selectedSubject ? (
            <div
              key={selectedSubject}
              style={{
                backgroundColor: '#fafafa',
                borderRadius: '8px',
                padding: '1.5rem',
                border: '1px solid #e9ecef'
              }}
            >
              <h3
                style={{
                  color: '#2c3e50',
                  borderBottom: '2px solid #3498db',
                  paddingBottom: '0.75rem',
                  marginBottom: '1.5rem',
                  fontSize: '1.25rem'
                }}
              >
                {language === 'zh'
                  ? selectedSubject
                  : translateCategory(selectedSubject)}
              </h3>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  justifyContent: 'center'
                }}
              >
                {(filteredDirectory[selectedSubject] || []).map(
                  (item, index) => (
                    <div key={index} style={{ marginBottom: '0.5rem' }}>
                      <button
                        onClick={() => {
                          onItemClick(item.term, item.pages)
                          // 如果有preview_url，则播放音乐
                          if (item.track?.preview_url) {
                            toggleAudio(item.track.preview_url)
                          }
                        }}
                        style={{
                          background:
                            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '20px',
                          padding: '0.75rem 1.5rem',
                          margin: '0.25rem',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '500',
                          transition: 'all 0.3s ease',
                          boxShadow:
                            '0 2px 8px rgba(0,0,0,0.15)' +
                            (item.preview_url
                              ? '; display: flex; align-items: center;'
                              : '')
                        }}
                      >
                        {item.term}
                        {item.preview_url && (
                          <FaPlay size={14} style={{ marginLeft: '8px' }} />
                        )}
                      </button>
                      {item.note && (
                        <span
                          style={{
                            fontSize: '12px',
                            color: '#7f8c8d',
                            marginLeft: '0.5rem'
                          }}
                        >
                          \ ({item.note})
                        </span>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          ) : (
            // 在页码模式下显示所有页码
            Object.entries(filteredDirectory).map(([page, items]) => (
              <div
                key={page}
                style={{
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1rem',
                  border: '1px solid #e9ecef'
                }}
              >
                <h3
                  style={{
                    color: '#2c3e50',
                    marginBottom: '1rem',
                    fontSize: '1.1rem'
                  }}
                >
                  {language === 'zh' ? `第${page}页` : `Page ${page}`}
                </h3>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.75rem'
                  }}
                >
                  {items.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        onItemClick(item.term, page)
                        // 如果有preview_url，则播放音乐
                        if (item.preview_url) {
                          toggleAudio(item.preview_url)
                        }
                      }}
                      style={{
                        background: 'white',
                        color: '#2c3e50',
                        border: '1px solid #ddd',
                        borderRadius: '16px',
                        padding: '0.5rem 1rem',
                        margin: '0.25rem',
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'all 0.3s ease',
                        display: item.preview_url ? 'flex' : 'inline-block',
                        alignItems: 'center'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = '#f0f8ff'
                        e.currentTarget.style.borderColor = '#3498db'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = 'white'
                        e.currentTarget.style.borderColor = '#ddd'
                      }}
                    >
                      {item.term}
                      {item.preview_url && (
                        <FaPlay size={14} style={{ marginLeft: '8px' }} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#6c757d',
              fontSize: '1.1rem'
            }}
          >
            {language === 'zh'
              ? '没有找到匹配的内容'
              : 'No matching content found'}
          </div>
        )}
      </div>
    </div>
  )
}

export default Directory
