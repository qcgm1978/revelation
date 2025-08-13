import React, { useState, useEffect, useCallback } from 'react'
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'

// 定义目录项的类型
interface DirectoryItem {
  term: string
  pages: string[]
  note?: string
}

export interface DirectoryData {
  [category: string]: DirectoryItem[]
}

interface DirectoryProps {
  directoryData: DirectoryData
  onItemClick: (term: string) => void
  language: 'zh' | 'en'
}

const Directory: React.FC<DirectoryProps> = ({ directoryData, onItemClick, language }) => {
  const [categoryMode, setCategoryMode] = useState<'subject' | 'page'>('subject')
  const [pageFilter, setPageFilter] = useState<string>('')

  // 翻译目录类别
  const translateCategory = (category: string): string => {
    // 添加目录类别的中英文对照
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

    // 遍历所有学科
    ;(Object.values(directoryData) as DirectoryItem[][]).forEach(items => {
      // 遍历每个条目
      items.forEach(item => {
        // 遍历每个页码
        item.pages.forEach(page => {
          if (!pageMap[page]) {
            pageMap[page] = []
          }
          // 添加条目到对应页码
          pageMap[page].push(item)
        })
      })
    })

    // 应用页码筛选
    let filteredPages = Object.keys(pageMap)
    if (filter) {
      filteredPages = filteredPages.filter(page => page.includes(filter))
    }

    // 按页码排序
    const sortedPageMap: Record<string, DirectoryItem[]> = {}
    filteredPages
      .sort((a, b) => {
        // 提取页码数字进行比较
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
      <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
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
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid #ddd',
            width: '200px',
            marginRight: '0.5rem'
          }}
        />
        <button
          onClick={() => setPageFilter('')}
          style={{
            background: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '0.5rem 1rem',
            cursor: 'pointer'
          }}
        >
          {language === 'zh' ? '清除' : 'Clear'}
        </button>
      </div>
    )
  }

  // 切换分类模式的按钮
  const renderCategoryToggle = () => (
    <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
      <button
        onClick={() => setCategoryMode('subject')}
        style={{
          background: categoryMode === 'subject' ? '#3498db' : '#e0e0e0',
          color: categoryMode === 'subject' ? 'white' : '#333',
          border: 'none',
          borderRadius: '4px 0 0 4px',
          padding: '0.5rem 1rem',
          cursor: 'pointer',
          fontWeight: categoryMode === 'subject' ? 'bold' : 'normal'
        }}
      >
        {language === 'zh' ? '按学科分类' : 'By Subject'}
      </button>
      <button
        onClick={() => setCategoryMode('page')}
        style={{
          background: categoryMode === 'page' ? '#3498db' : '#e0e0e0',
          color: categoryMode === 'page' ? 'white' : '#333',
          border: 'none',
          borderRadius: '0 4px 4px 0',
          padding: '0.5rem 1rem',
          cursor: 'pointer',
          fontWeight: categoryMode === 'page' ? 'bold' : 'normal'
        }}
      >
        {language === 'zh' ? '按书页分类' : 'By Page'}
      </button>
    </div>
  )

  // 决定使用哪个目录数据
  const directoryToRender = 
    categoryMode === 'subject'
      ? directoryData
      : getPageBasedDirectory(pageFilter)

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      {renderCategoryToggle()}
      {renderPageFilter()}
      {Object.entries(directoryToRender as DirectoryData).map(
        ([category, items]) => (
          <div key={category} style={{ marginBottom: '2rem' }}>
            <h3
              style={{
                color: '#2c3e50',
                borderBottom: '2px solid #3498db',
                paddingBottom: '0.5rem',
                marginBottom: '1rem'
              }}
            >
              {categoryMode === 'subject'
                ? language === 'zh'
                  ? category
                  : translateCategory(category)
                : language === 'zh'
                ? `第 ${category.replace('p', '')} 页`
                : `Page ${category.replace('p', '')}`}
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {items.map((item, index) => (
                <div key={index} style={{ marginBottom: '0.5rem' }}>
                  <button
                    onClick={() => onItemClick(item.term)}
                    style={{
                      background:
                        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '20px',
                      padding: '0.5rem 1rem',
                      margin: '0.25rem',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow =
                        '0 4px 8px rgba(0,0,0,0.2)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow =
                        '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    <span>{item.term}</span>
                    {categoryMode === 'subject' && item.pages.length > 0 && (
                      <span
                        style={{
                          fontSize: '12px',
                          opacity: '0.8',
                          background: 'rgba(255,255,255,0.2)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '10px'
                        }}
                      >
                        {item.pages.join(', ')}
                      </span>
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
                      ({item.note})
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  )
}

export default Directory