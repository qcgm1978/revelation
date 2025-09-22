import React from 'react'

interface HeaderProps {
  language: 'zh' | 'en'
  isOverflowMenuOpen: boolean
  setIsOverflowMenuOpen: (open: boolean) => void
  hasValidApiKey: boolean
  setIsApiKeyManagerOpen: (open: boolean) => void
  directoryData: any
  isUsingUploadedData: boolean
  currentBookId: string | null
  uploadedBooksMetadata: Array<{ id: string; title: string }>
  uploadErrorMessage: string | null
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSearch: (
    topic: string,
    page?: string[],
    category?: string,
    context?: string
  ) => void
  switchToDefaultBook: () => void
  switchToUploadedBook: (bookId: string) => void
}

const Header: React.FC<HeaderProps> = ({
  language,
  isOverflowMenuOpen,
  setIsOverflowMenuOpen,
  hasValidApiKey,
  setIsApiKeyManagerOpen,
  directoryData,
  isUsingUploadedData,
  currentBookId,
  uploadedBooksMetadata,
  uploadErrorMessage,
  handleFileUpload,
  handleSearch,
  switchToDefaultBook,
  switchToUploadedBook
}) => {
  return (
    <header>
      <div id='menu-wrapper'>
        <button
          id='menu-button'
          onClick={() => setIsOverflowMenuOpen(!isOverflowMenuOpen)}
          title={language === 'zh' ? '更多选项' : 'More Options'}
        >
          ⋮
        </button>

         {isOverflowMenuOpen && (
          <>
            <div 
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'transparent',
                zIndex: 999
              }}
              onClick={() => setIsOverflowMenuOpen(false)}
            />
            <div
              id='setting'
              style={{
                position: 'absolute',
                top: '3rem',
                right: '0.7rem',
                background: 'white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                borderRadius: '8px',
                padding: '0.5rem',
                width: '200px',
                zIndex: 1000
              }}
              onClick={e => e.stopPropagation()}
            >
            {/* 添加语言选择功能 */}
            <div style={{ marginBottom: '0.5rem', width: '100%' }}>
              <div
                style={{
                  background: '#34495e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem'
                }}
              >
                {language === 'zh' ? '语言选择' : 'Language Selection'}
              </div>
              <div
                style={{
                  display: 'flex',
                  border: '2px solid #e1e8ed',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  width: '100%'
                }}
              >
                <button
                  onClick={() => {
                    document.dispatchEvent(
                      new CustomEvent('languageChange', { detail: 'zh' })
                    )
                    setIsOverflowMenuOpen(false)
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    border: 'none',
                    background: language === 'zh' ? '#3498db' : '#f8f9fa',
                    color: language === 'zh' ? 'white' : '#666',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    width: '50%'
                  }}
                >
                  中文
                </button>
                <button
                  onClick={() => {
                    document.dispatchEvent(
                      new CustomEvent('languageChange', { detail: 'en' })
                    )
                    setIsOverflowMenuOpen(false)
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    border: 'none',
                    background: language === 'en' ? '#3498db' : '#f8f9fa',
                    color: language === 'en' ? 'white' : '#666',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    width: '50%'
                  }}
                >
                  English
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                setIsApiKeyManagerOpen(true)
                setIsOverflowMenuOpen(false)
              }}
              style={{
                background: hasValidApiKey ? '#27ae60' : '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'all 0.3s ease',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem'
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
              {language === 'zh' ? '语言模型' : 'Language Model'}
            </button>

            {/* 返回目录按钮 */}
            <button
              onClick={() => {
                const directoryTopic = language === 'zh' ? '目录' : 'Directory'
                handleSearch(directoryTopic)
                setIsOverflowMenuOpen(false)
              }}
              style={{
                background: '#1abc9c',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'all 0.3s ease',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem'
              }}
              title={language === 'zh' ? '返回目录页面' : 'Back to Directory'}
            >
              📑 {language === 'zh' ? '返回目录' : 'Back to Directory'}
            </button>

            {/* 书籍上传按钮 */}
            <input
              type='file'
              id='book-upload'
              accept='.json,.txt'
              onChange={e => {
                handleFileUpload(e)
                setTimeout(() => {
                  const directoryTopic =
                    language === 'zh' ? '目录' : 'Directory'
                  handleSearch(directoryTopic)
                }, 500)
                setIsOverflowMenuOpen(false)
              }}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => {
                document.getElementById('book-upload')?.click()
                setIsOverflowMenuOpen(false)
              }}
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
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem'
              }}
              title={
                language === 'zh' ? '上传书籍JSON文件' : 'Upload Book JSON File'
              }
            >
              📚 {language === 'zh' ? '上传书籍' : 'Upload Book'}
            </button>

            {/* 书籍选择器下拉菜单 */}
            <select
              value={isUsingUploadedData ? currentBookId || '' : 'default'}
              onChange={e => {
                if (e.target.value === 'default') {
                  switchToDefaultBook()
                } else {
                  switchToUploadedBook(e.target.value)
                }
                setIsOverflowMenuOpen(false)
              }}
              style={{
                background: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                width: '100%',
                marginBottom: '0.5rem'
              }}
            >
              {/* 默认书籍选项始终显示默认书籍的实际标题 */}
              <option value='default'>
                {/* 这里使用一个新的变量来获取默认书籍的标题 */}
                {typeof directoryData?.title === 'string'
                  ? directoryData.title
                  : language === 'zh'
                  ? '启示路'
                  : 'Revelation'}
              </option>
              {uploadedBooksMetadata.map(book => (
                <option key={book.id} value={book.id}>
                  {book.title}
                </option>
              ))}
            </select>

            {/* 如果没有下拉菜单但正在使用上传的书籍，显示返回默认书籍按钮 */}
            {uploadedBooksMetadata.length === 0 && isUsingUploadedData && (
              <button
                onClick={() => {
                  switchToDefaultBook()
                  setIsOverflowMenuOpen(false)
                }}
                style={{
                  background: '#e67e22',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                  width: '100%'
                }}
                title={
                  language === 'zh' ? '返回默认书籍' : 'Back to Default Book'
                }
              >
                🔙 {language === 'zh' ? '返回默认书籍' : 'Back to Default'}
              </button>
            )}
          </div>
          </>
        )}
      </div>

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
  )
}

export default Header
