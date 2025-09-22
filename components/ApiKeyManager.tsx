import React, { useState, useEffect } from 'react'
import {
  ServiceProvider,
  getSelectedServiceProvider,
  setSelectedServiceProvider,
  setDeepSeekApiKey,
  setGeminiApiKey,
  setXunfeiApiKey,
  setXunfeiApiSecret,
  hasDeepSeekApiKey,
  hasGeminiApiKey,
  hasXunfeiApiKey,
  hasXunfeiApiSecret,
  hasYouChatApiKey
} from '../services/wikiService'

interface ApiKeyManagerProps {
  onSave: (apiKey: string) => void
  onClose: () => void
  onNavigateToWiki?: () => void
  isOpen: boolean
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({
  onSave,
  onClose,
  onNavigateToWiki,
  isOpen
}) => {
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider>(
    ServiceProvider.FREE
  )
  const [apiKey, setApiKey] = useState('')
  const [apiSecret, setApiSecret] = useState('')
  const [isValid, setIsValid] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const provider = getSelectedServiceProvider()
    setSelectedProvider(provider)

    if (provider === ServiceProvider.DEEPSEEK) {
      const key = localStorage.getItem('DEEPSEEK_API_KEY') || ''
      setApiKey(key)
      setIsValid(hasDeepSeekApiKey())
      setApiSecret('')
    } else if (provider === ServiceProvider.GEMINI) {
      const key = localStorage.getItem('GEMINI_API_KEY') || ''
      setApiKey(key)
      setIsValid(hasGeminiApiKey())
      setApiSecret('')
    } else if (provider === ServiceProvider.FREE) {
      const key = localStorage.getItem('XUNFEI_API_KEY') || ''
      const secret = localStorage.getItem('XUNFEI_API_SECRET') || ''
      setApiKey(key)
      setApiSecret(secret)
      setIsValid(hasXunfeiApiKey() && hasXunfeiApiSecret())
    } else if (provider === ServiceProvider.YOUCHAT) {
      setApiKey('')
      setApiSecret('')
      setIsValid(true)
    } else {
      setApiKey('')
      setApiSecret('')
      setIsValid(false)
    }
  }, [])

  const handleProviderChange = (provider: ServiceProvider) => {
    setSelectedProvider(provider)
    setSelectedServiceProvider(provider)

    if (provider === ServiceProvider.DEEPSEEK) {
      const key = localStorage.getItem('DEEPSEEK_API_KEY') || ''
      setApiKey(key)
      setApiSecret('')
      setIsValid(hasDeepSeekApiKey())
    } else if (provider === ServiceProvider.GEMINI) {
      const key = localStorage.getItem('GEMINI_API_KEY') || ''
      setApiKey(key)
      setApiSecret('')
      setIsValid(hasGeminiApiKey())
    } else if (provider === ServiceProvider.FREE) {
      const key = localStorage.getItem('XUNFEI_API_KEY') || ''
      const secret = localStorage.getItem('XUNFEI_API_SECRET') || ''
      setApiKey(key)
      setApiSecret(secret)
      setIsValid(hasXunfeiApiKey() && hasXunfeiApiSecret())
    } else if (provider === ServiceProvider.YOUCHAT) {
      setApiKey('')
      setApiSecret('')
      setIsValid(true)
      onSave('')
    } else {
      setApiKey('')
      setApiSecret('')
      setIsValid(false)
      onSave('')
    }
  }

  const handleSave = () => {
    if (selectedProvider === ServiceProvider.DEEPSEEK) {
      if (apiKey.trim()) {
        setDeepSeekApiKey(apiKey.trim())
        setIsValid(true)
        onSave(apiKey.trim())
      }
    } else if (selectedProvider === ServiceProvider.GEMINI) {
      if (apiKey.trim()) {
        setGeminiApiKey(apiKey.trim())
        setIsValid(true)
        onSave(apiKey.trim())
      }
    } else if (selectedProvider === ServiceProvider.FREE) {
      if (apiKey.trim() && apiSecret.trim()) {
        setXunfeiApiKey(apiKey.trim())
        setXunfeiApiSecret(apiSecret.trim())
        setIsValid(true)
        onSave(apiKey.trim())
      }
    }

    onClose()

    if (onNavigateToWiki) {
      setTimeout(() => {
        onNavigateToWiki()
      }, 100)
    }
  }

  const handleClear = () => {
    if (selectedProvider === ServiceProvider.DEEPSEEK) {
      setDeepSeekApiKey('')
    } else if (selectedProvider === ServiceProvider.GEMINI) {
      setGeminiApiKey('')
    } else if (selectedProvider === ServiceProvider.FREE) {
      setXunfeiApiKey('')
      setXunfeiApiSecret('')
    }
    setApiKey('')
    setApiSecret('')
    setIsValid(false)
    onSave('')
  }

  const handleKeyPress = (e: any) => {
    if (e.key === 'Enter') {
      handleSave()
    }
  }

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          maxWidth: '500px',
          width: '90%',
          position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#666'
          }}
        >
          ×
        </button>

        <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#2c3e50' }}>
          API 密钥配置
        </h2>

        <div style={{ marginBottom: '1.5rem' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: '#34495e'
            }}
          >
            服务提供商（讯飞星火/DeepSeek/Gemini/YouChat）
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleProviderChange(ServiceProvider.FREE)}
              style={{
                padding: '0.5rem 1rem',
                border:
                  selectedProvider === ServiceProvider.FREE
                    ? '2px solid #3498db'
                    : '2px solid #e1e8ed',
                backgroundColor:
                  selectedProvider === ServiceProvider.FREE
                    ? '#3498db'
                    : 'white',
                color:
                  selectedProvider === ServiceProvider.FREE
                    ? 'white'
                    : '#34495e',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.3s ease'
              }}
            >
              讯飞星火
            </button>
            <button
              onClick={() => handleProviderChange(ServiceProvider.DEEPSEEK)}
              style={{
                padding: '0.5rem 1rem',
                border:
                  selectedProvider === ServiceProvider.DEEPSEEK
                    ? '2px solid #3498db'
                    : '2px solid #e1e8ed',
                backgroundColor:
                  selectedProvider === ServiceProvider.DEEPSEEK
                    ? '#3498db'
                    : 'white',
                color:
                  selectedProvider === ServiceProvider.DEEPSEEK
                    ? 'white'
                    : '#34495e',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.3s ease'
              }}
            >
              DeepSeek
            </button>
            <button
              onClick={() => handleProviderChange(ServiceProvider.GEMINI)}
              style={{
                padding: '0.5rem 1rem',
                border:
                  selectedProvider === ServiceProvider.GEMINI
                    ? '2px solid #3498db'
                    : '2px solid #e1e8ed',
                backgroundColor:
                  selectedProvider === ServiceProvider.GEMINI
                    ? '#3498db'
                    : 'white',
                color:
                  selectedProvider === ServiceProvider.GEMINI
                    ? 'white'
                    : '#34495e',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.3s ease'
              }}
            >
              Gemini
            </button>
            <button
              onClick={() => handleProviderChange(ServiceProvider.YOUCHAT)}
              style={{
                padding: '0.5rem 1rem',
                border:
                  selectedProvider === ServiceProvider.YOUCHAT
                    ? '2px solid #3498db'
                    : '2px solid #e1e8ed',
                backgroundColor:
                  selectedProvider === ServiceProvider.YOUCHAT
                    ? '#3498db'
                    : 'white',
                color:
                  selectedProvider === ServiceProvider.YOUCHAT
                    ? 'white'
                    : '#34495e',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.3s ease'
              }}
            >
              YouChat
            </button>
          </div>
        </div>

        {(selectedProvider === ServiceProvider.DEEPSEEK ||
          selectedProvider === ServiceProvider.GEMINI ||
          selectedProvider === ServiceProvider.FREE) && (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <label
                htmlFor='apiKey'
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: '#34495e'
                }}
              >
                {selectedProvider === ServiceProvider.DEEPSEEK
                  ? 'DeepSeek API 密钥'
                  : selectedProvider === ServiceProvider.GEMINI
                  ? 'Gemini API 密钥'
                  : '讯飞 API Key'}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id='apiKey'
                  type={showPassword ? 'text' : 'password'}
                  value={apiKey}
                  onChange={e => {
                    setApiKey(e.target.value)
                    if (selectedProvider === ServiceProvider.FREE) {
                      setIsValid(e.target.value.length > 0 && apiSecret.length > 0)
                    } else {
                      setIsValid(e.target.value.length > 0)
                    }
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder={`请输入你的 ${selectedProvider === ServiceProvider.DEEPSEEK ? 'DeepSeek' : selectedProvider === ServiceProvider.GEMINI ? 'Gemini' : '讯飞'} ${selectedProvider === ServiceProvider.FREE ? 'API Key' : 'API 密钥'}`}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e1e8ed',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.3s ease'
                  }}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#666',
                    fontSize: '1rem'
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {selectedProvider === ServiceProvider.FREE && (
              <div style={{ marginBottom: '1rem' }}>
                <label
                  htmlFor='apiSecret'
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                    color: '#34495e'
                  }}
                >
                  讯飞 API Secret
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id='apiSecret'
                    type={showPassword ? 'text' : 'password'}
                    value={apiSecret}
                    onChange={e => {
                      setApiSecret(e.target.value)
                      setIsValid(apiKey.length > 0 && e.target.value.length > 0)
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder='请输入你的讯飞 API Secret'
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e1e8ed',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.3s ease'
                    }}
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#666',
                      fontSize: '1rem'
                    }}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#7f8c8d' }}>
                💡 获取 API 密钥：
                {selectedProvider === ServiceProvider.FREE ? (
                  <a
                    href='https://console.xfyun.cn/app/myapp'
                    target='_blank'
                    rel='noopener noreferrer'
                    style={{ color: '#3498db', textDecoration: 'none' }}
                  >
                    点击这里访问讯飞开放平台获取 API Key 和 Secret
                  </a>
                ) : (
                  <a
                    href={
                      selectedProvider === ServiceProvider.DEEPSEEK
                        ? 'https://platform.deepseek.com/'
                        : 'https://makersuite.google.com/app/apikey'
                    }
                    target='_blank'
                    rel='noopener noreferrer'
                    style={{ color: '#3498db', textDecoration: 'none' }}
                  >
                    点击这里访问{' '}
                    {selectedProvider === ServiceProvider.DEEPSEEK
                      ? 'DeepSeek'
                      : 'Gemini'}{' '}
                    平台
                  </a>
                )}
              </p>
            </div>
          </>
        )}

        <div
          style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}
        >
          {(selectedProvider !== ServiceProvider.FREE && selectedProvider !== ServiceProvider.YOUCHAT) && (
            <button
              onClick={handleClear}
              style={{
                padding: '0.75rem 1.5rem',
                border: '2px solid #e74c3c',
                backgroundColor: 'white',
                color: '#e74c3c',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#e74c3c'
                e.currentTarget.style.color = 'white'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'white'
                e.currentTarget.style.color = '#e74c3c'
              }}
            >
              清除
            </button>
          )}
          {selectedProvider !== ServiceProvider.FREE ? (
            <button
              onClick={handleSave}
              disabled={!isValid}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                backgroundColor: isValid ? '#3498db' : '#bdc3c7',
                color: 'white',
                borderRadius: '8px',
                cursor: isValid ? 'pointer' : 'not-allowed',
                fontSize: '1rem',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={e => {
                if (isValid) {
                  e.currentTarget.style.backgroundColor = '#2980b9'
                }
              }}
              onMouseLeave={e => {
                if (isValid) {
                  e.currentTarget.style.backgroundColor = '#3498db'
                }
              }}
            >
              保存
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={!isValid}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                backgroundColor: isValid ? '#3498db' : '#bdc3c7',
                color: 'white',
                borderRadius: '8px',
                cursor: isValid ? 'pointer' : 'not-allowed',
                fontSize: '1rem',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={e => {
                if (isValid) {
                  e.currentTarget.style.backgroundColor = '#2980b9'
                }
              }}
              onMouseLeave={e => {
                if (isValid) {
                  e.currentTarget.style.backgroundColor = '#3498db'
                }
              }}
            >
              保存
            </button>
          )}
        </div>

        {(selectedProvider !== ServiceProvider.FREE || selectedProvider === ServiceProvider.FREE) && isValid && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.75rem',
              backgroundColor: '#d4edda',
              border: '1px solid #c3e6cb',
              borderRadius: '6px',
              color: '#155724',
              fontSize: '0.9rem'
            }}
          >
            ✅{' '}
            {selectedProvider === ServiceProvider.DEEPSEEK
              ? 'DeepSeek'
              : selectedProvider === ServiceProvider.GEMINI
              ? 'Gemini'
              : selectedProvider === ServiceProvider.YOUCHAT
              ? 'YouChat'
              : '讯飞'}{' '}
            API 密钥已配置，应用可以正常使用
          </div>
        )}
      </div>
    </div>
  )
}

export default ApiKeyManager
