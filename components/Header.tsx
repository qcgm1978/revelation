import React from 'react'

interface HeaderProps {
  hasValidApiKey: boolean
  setIsApiKeyManagerOpen: () => void
  language: string
  directoryData: any
  isUsingUploadedData: boolean
  currentBookId: string | null
  uploadedBooksMetadata: Array<{ id: string; title: string }>
  uploadErrorMessage: string | null
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSearch: (topic: string) => void
  switchToDefaultBook: () => void
  switchToUploadedBook: (bookId: string) => void
}

const Header: React.FC<HeaderProps> = ({
  hasValidApiKey,
  setIsApiKeyManagerOpen,
  language,
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
    <header style={{
      marginTop: '2.5rem',
      paddingBottom: '0.5rem',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <button
        onClick={setIsApiKeyManagerOpen}
        style={{
          position: 'absolute',
          top: '0.7rem',
          right: '0.7rem',
          background: hasValidApiKey ? '#27ae60' : '#e74c3c',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '0.5rem 1rem',
          cursor: 'pointer',
          fontSize: '0.9rem',
          fontWeight: '500',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
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
        {hasValidApiKey
          ? language === 'zh'
            ? '已配置'
            : 'Configured'
          : language === 'zh'
          ? '配置'
          : 'Configure'}
      </button>

      <div
        style={{
          position: 'absolute',
          top: '0.7rem',
          left: '0.7rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap'
        }}
      >
        <input
          type='file'
          id='book-upload'
          accept='.json,.txt'
          onChange={e => {
            handleFileUpload(e)
            setTimeout(() => {
              const directoryTopic = language === 'zh' ? '目录' : 'Directory'
              handleSearch(directoryTopic)
            }, 500)
          }}
          style={{ display: 'none' }}
        />
        <button
          onClick={() => document.getElementById('book-upload')?.click()}
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
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          title={
            language === 'zh' ? '上传书籍JSON文件' : 'Upload Book JSON File'
          }
        >
          📚 {language === 'zh' ? '上传书籍' : 'Upload Book'}
        </button>

        <div style={{ position: 'relative', display: 'flex' }}>
          <select
            value={isUsingUploadedData ? currentBookId || '' : 'default'}
            onChange={e => {
              if (e.target.value === 'default') {
                switchToDefaultBook()
              } else {
                switchToUploadedBook(e.target.value)
              }
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
              maxWidth: '5rem'
            }}
          >
            <option value='default'>
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
        </div>

        {uploadedBooksMetadata.length === 0 && isUsingUploadedData && (
          <button
            onClick={switchToDefaultBook}
            style={{
              background: '#e67e22',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }}
            title={
              language === 'zh' ? '返回默认书籍' : 'Back to Default Book'
            }
          >
            🔙
          </button>
        )}
      </div>

      {uploadErrorMessage && (
        <div
          style={{
            color: '#e74c3c',
            marginTop: '1rem',
            fontSize: '0.9rem',
            paddingHorizontal: '1rem'
          }}
        >
          {uploadErrorMessage}
        </div>
      )}
    </header>
  )
}

export default Header