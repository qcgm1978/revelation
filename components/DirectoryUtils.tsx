import { FaPlay } from 'react-icons/fa6'
import { DirectoryData, DirectoryItem } from '../types/directory'
import audioManager from '../utils/audioManager'
import categoryTranslations from '../public/extraction_results_category.json'
import { appNames } from '../config'


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


export const translateCategory = (category: string, language: 'zh' | 'en'): string => {
  return language === 'zh' ? category : categoryTranslations[category] || category
}

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
        marginBottom: '1rem',
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
            ? '输入页码、章节筛选...'
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
  
 
  const isRevelationBook = typeof currentBookTitle === 'string' && 
    (currentBookTitle === appNames.zh || currentBookTitle === appNames.en);

  return (
    <div id='nav-div'>
      <button
        onClick={() => {
          setCategoryMode('subject')
          if (Object.keys(directoryData).length > 0) {
            setSelectedSubject(Object.keys(directoryData)[0])
          }
        }}
        className={categoryMode === 'subject' ? 'active' : ''}
      >
        {language === 'zh' ? '主题' : 'Subject'}
      </button>
      {hasPageData && (
        <button
          onClick={() => {
            setCategoryMode('page')
          }}
          className={categoryMode === 'page' ? 'active' : ''}
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
          className={categoryMode === 'timeline' ? 'active' : ''}
        >
          {language === 'zh' ? '时间线' : 'Timeline'}
        </button>
      )}
    </div>
  )
}


export const SubjectTabs = ({ 
  categoryMode, 
  directoryData, 
  selectedSubject, 
  setSelectedSubject, 
  language 
}: {
  categoryMode: 'subject' | 'page' | 'timeline'
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
        marginBottom: '1rem',
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


const toggleAudio = (trackInfo) => {
  audioManager.toggleAudio(trackInfo)
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


export const DirectoryItemsRenderer = ({
  filteredDirectory,
  categoryMode,
  selectedSubject,
  onItemClick,
  language,
}: {
  filteredDirectory: DirectoryData
  categoryMode: 'subject' | 'page'
  selectedSubject: string
  onItemClick: (term: string, pageInfo?: string[] | string,category?: string) => void
  language: 'zh' | 'en'
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

  
  if (categoryMode === 'subject' && selectedSubject) {
    return (
      <div
        key={selectedSubject}
        id='category-wrapper'
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
                  className="directory-item-button"
                  onClick={() => {
                    onItemClick(language === 'en' && item.term_en ? item.term_en : item.term, item.pages, selectedSubject)
                    
                    if (item.track?.preview_url) {
                      toggleAudio(item.track)
                    }
                  }}
                  style={{
                    background:
                     item.color_value ? 'linear-gradient(135deg, #ff512f 0%, #dd2476 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: item.color_value ? item.color_value : '#ffffff',
                  }}
                >
                  {language === 'en' && item.term_en ? item.term_en : item.term}
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

  return (
    Object.entries(filteredDirectory).map(([page_chapter, items]) => {
      const num = page_chapter.slice(1)
      const txt = page_chapter[0]=='c' ? '章' : '页'
      let text_num = `第${num}${txt}`;
      let en_text_num = `num ${num}`;
      if (num === '0') {
        text_num='序'
        en_text_num='Prologue'
      }
      return <div
        key={`${page_chapter}`}
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
          {language === 'zh' ? text_num : en_text_num}
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
                onItemClick(language === 'en' && item.term_en ? item.term_en : item.term, item)
                if (item.track?.preview_url) {
                  let artistName = '未知艺术家'
                  if (item.track.artists && item.track.artists.length > 0) {
                    artistName = item.track.artists[0].name || artistName
                  }
                  audioManager.toggleAudio(item.track)
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
              {language === 'en' && item.term_en ? item.term_en : item.term}
              {item.track?.preview_url && (
                <FaPlay size={14} className="play-icon-small" />
              )}
            </button>
          ))}
        </div>
      </div>
})
  )
}