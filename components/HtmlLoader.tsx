import React, { useState, useEffect } from 'react'

interface HtmlLoaderProps {
  src: string
  title?: string
  style?: React.CSSProperties
  containerStyle?: React.CSSProperties
}

const HtmlLoader: React.FC<HtmlLoaderProps> = ({ 
  src, 
  title, 
  style, 
  containerStyle 
}) => {
  const [htmlContent, setHtmlContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHtml = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const response = await fetch(src)
        if (!response.ok) {
          throw new Error(`Failed to load ${src}: ${response.status} ${response.statusText}`)
        }
        const html = await response.text()
        setHtmlContent(html)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load HTML content')
        console.error('Error loading HTML:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHtml()
  }, [src])

  return (
    <div 
      style={{
        width: '100%',
        height: '600px',
        overflow: 'hidden',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        ...containerStyle
      }}
    >
      {isLoading && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          backgroundColor: '#f5f5f5'
        }}>
          <div>加载中...</div>
        </div>
      )}
      
      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          backgroundColor: '#ffebee',
          color: '#c62828',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div>{error}</div>
        </div>
      )}
      
      {!isLoading && !error && (
        <div 
          style={{
            width: '100%',
            height: '100%',
            ...style
          }}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
          title={title || ''}
        />
      )}
    </div>
  )
}

export default HtmlLoader