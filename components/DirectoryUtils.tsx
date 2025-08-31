import { FaPlay } from 'react-icons/fa6'
import { DirectoryData, DirectoryItem } from '../types/directory'
import audioManager from '../utils/audioManager'

// 添加全局样式
const styleElement = document.createElement('style');
styleElement.textContent = `
  .play-icon {
    margin-right: 8px;
    transform: rotate(90deg);
  }
  .play-icon-small {
    margin-left: 8px;
  }
`;
document.head.appendChild(styleElement);

// 翻译目录类别
export const translateCategory = (category: string, language: 'zh' | 'en'): string => {
  const categoryTranslations: Record<string, string> = {
    '基础概念': 'Basic Concepts',
    '哲学思想': 'Philosophical Thoughts',
    '科学理论': 'Scientific Theories',
    '艺术表达': 'Artistic Expression',
    '文学概念': 'Literary Concepts',
    '心理学': 'Psychology',
    '社会学': 'Sociology',
    '宗教与信仰': 'Religion & Belief',
    '历史事件': 'Historical Events',
    '数学与逻辑': 'Mathematics & Logic',
    '物理现象': 'Physical Phenomena',
    '生物学': 'Biology',
    '技术与创新': 'Technology & Innovation',
    '经济学': 'Economics',
    '政治理论': 'Political Theories',
    '环境与生态': 'Environment & Ecology',
    '语言学': 'Linguistics',
    '音乐理论': 'Music Theory',
    '电影艺术': 'Film Arts',
    '建筑设计': 'Architectural Design'
  }

  return language === 'zh' ? category : categoryTranslations[category] || category
}

// 按书页组织目录数据
export const getPageBasedDirectory = (
  directoryData: DirectoryData,
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

// 页码筛选输入框组件
export const PageFilter = ({ 
  pageFilter, 
  setPageFilter, 
  language 
}: {
  pageFilter: string
  setPageFilter: (value: string) => void
  language: 'zh' | 'en'
}) => {
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
          marginTop: '0.4rem',
          padding: '0.25rem 1.5rem',
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

// 切换分类模式的Tab组件
export const CategoryTabs = ({ 
  categoryMode, 
  setCategoryMode, 
  directoryData, 
  setSelectedSubject, 
  language,
  currentBookTitle
}: {
  categoryMode: 'subject' | 'page' | 'timeline'
  setCategoryMode: (mode: 'subject' | 'page' | 'timeline') => void
  directoryData: DirectoryData
  setSelectedSubject: (subject: string) => void
  language: 'zh' | 'en'
  currentBookTitle: string | null
}) => {
  const hasPageData = Object.values(directoryData).some(categoryItems =>
    categoryItems.some(
      item => Array.isArray(item.pages) && item.pages.length > 0
    )
  )
  
  // 检查当前书籍是否为启示录
  const isRevelationBook = typeof currentBookTitle === 'string' && 
    (currentBookTitle === '启示路' || currentBookTitle === 'Revelation');

  return (
    <div
      style={{
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
        {language === 'zh' ? '主题' : 'Subject'}
      </button>
      {hasPageData && (
        <button
          onClick={() => {
            setCategoryMode('page')
          }}
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
            transition: 'all 0.3s ease'
          }}
        >
          {language === 'zh' ? '书页' : 'Page'}
        </button>
      )}
      
      {/* 仅当书籍为启示录时显示时间线标签 */}
      {isRevelationBook && (
        <button
          onClick={() => {
            setCategoryMode('timeline')
          }}
          style={{
            background: 'none',
            color: categoryMode === 'timeline' ? '#3498db' : '#6c757d',
            border: 'none',
            borderBottom:
              categoryMode === 'timeline'
                ? '3px solid #3498db'
                : '3px solid transparent',
            borderRadius: '8px 8px 0 0',
            padding: '1rem 2rem',
            cursor: 'pointer',
            fontWeight: categoryMode === 'timeline' ? 'bold' : 'normal',
            fontSize: '1rem',
            transition: 'all 0.3s ease'
          }}
        >
          {language === 'zh' ? '时间线' : 'Timeline'}
        </button>
      )}
    </div>
  )
}

// 渲染学科Tab组件
export const SubjectTabs = ({ 
  categoryMode, 
  directoryData, 
  selectedSubject, 
  setSelectedSubject, 
  language 
}: {
  categoryMode: 'subject' | 'page'
  directoryData: DirectoryData
  selectedSubject: string
  setSelectedSubject: (subject: string) => void
  language: 'zh' | 'en'
}) => {
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
          {language === 'zh' ? category : translateCategory(category, language)}
        </button>
      ))}
    </div>
  )
}

// 音乐播放控制按钮组件
const toggleAudio = (url?: string, trackInfo?: { name: string; artist: string }) => {
  audioManager.toggleAudio(url, trackInfo)
}
export const AudioControl = () => {

  if (!audioManager.isAudioPlaying()) return null

  return (
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
      onClick={toggleAudio}
    >
      <FaPlay size={16} className="play-icon" />
      <span>暂停音乐</span>
    </div>
  )
}

// 目录项渲染组件
export const DirectoryItemsRenderer = ({
  filteredDirectory,
  categoryMode,
  selectedSubject,
  onItemClick,
  language,
  currentBookTitle
}: {
  filteredDirectory: DirectoryData
  categoryMode: 'subject' | 'page'
  selectedSubject: string
  onItemClick: (term: string, pageInfo?: string[] | string,category?: string) => void
  language: 'zh' | 'en'
  currentBookTitle: string | null
}) => {
  if (Object.entries(filteredDirectory).length === 0) {
    return (
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
    )
  }

  // 在学科模式下只显示选中的学科
  if (categoryMode === 'subject' && selectedSubject) {
    return (
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
            : translateCategory(selectedSubject, language)}
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
                    onItemClick(item.term, item.pages,selectedSubject)
                    // 如果有preview_url，则播放音乐
                    if (item.track?.preview_url) {
                      toggleAudio(item.track.preview_url, {
                        name: item.track.name || item.term,
                        artist: item.track.artists?.[0]?.name || '未知艺术家'
                      })
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
                      '0 2px 8px rgba(0,0,0,0.15)'
                  }}
                >
                  {item.term}
                  {item.track?.preview_url && (
                    <FaPlay size={14} className="play-icon-small" />
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
    )
  }

  // 在页码模式下显示所有页码
  return (
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
                // 如果有preview_url，则播放音乐并传递歌曲信息
                if (item.track?.preview_url) {
                  // 提取歌曲名称和艺术家信息
                  const trackName = item.track.name || item.term
                  // 尝试从item.track.artists中获取艺术家信息
                  let artistName = '未知艺术家'
                  if (item.track.artists && item.track.artists.length > 0) {
                    artistName = item.track.artists[0].name || artistName
                  }
                  audioManager.toggleAudio(item.track.preview_url, { name: trackName, artist: artistName })
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
                display: item.track?.preview_url ? 'flex' : 'inline-block',
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
              {item.track?.preview_url && (
                <FaPlay size={14} className="play-icon-small" />
              )}
            </button>
          ))}
        </div>
      </div>
    ))
  )
}