import React from 'react';
import ContentGenerator from './ContentGenerator';
import Directory from './Directory';

interface DocumentRendererProps {
  currentTopic: string;
  language: string;
  hasValidApiKey: boolean;
  history: string[];
  onHistoryChange: (history: string[]) => void;
  contentCache: Record<string, any>;
  onCacheClear: () => void;
  isUsingUploadedData: boolean;
  uploadedBookName: string | null;
  onTopicChange: (topic: string) => void;
  onRequestApiKey: () => void;
  directoryData?: Record<string, any>;
  getCurrentDirectoryData?: () => Record<string, any> | undefined;
}

const DocumentRenderer: React.FC<DocumentRendererProps> = ({
  currentTopic,
  language,
  hasValidApiKey,
  history,
  onHistoryChange,
  contentCache,
  onCacheClear,
  isUsingUploadedData,
  uploadedBookName,
  onTopicChange,
  onRequestApiKey,
  directoryData,
  getCurrentDirectoryData
}) => {
  const handleForward = () => {
    const currentIndex = history.indexOf(currentTopic);
    if (currentIndex < history.length - 1) {
      onTopicChange(history[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const currentIndex = history.indexOf(currentTopic);
    if (currentIndex > 0) {
      onTopicChange(history[currentIndex - 1]);
    }
  };

  const handleClearCacheAndRefresh = () => {
    onCacheClear();
    onTopicChange(currentTopic);
  };

  const isAtFirstTopic = history.indexOf(currentTopic) === 0;
  const isAtLastTopic = history.indexOf(currentTopic) === history.length - 1;

  const handleDirectoryItemClick = (topic: string) => {
    if (!hasValidApiKey && currentTopic === '目录') {
      onRequestApiKey();
    } else {
      onTopicChange(topic);
    }
  };

  return (
    <div className="app-container">
      <div className="main-content">
        {/* 导航按钮 */}
        <div className="navigation-buttons" style={{ display: 'flex', gap: '12px', marginBottom: '20px', justifyContent: 'center' }}>
          <button 
            onClick={handleBack} 
            disabled={isAtFirstTopic} 
            className="nav-button" 
            style={{
              padding: '10px 20px',
              backgroundColor: isAtFirstTopic ? '#e0e0e0' : '#3498db',
              color: isAtFirstTopic ? '#a0a0a0' : 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isAtFirstTopic ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: isAtFirstTopic ? 'none' : '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => {
              if (!isAtFirstTopic) {
                e.currentTarget.style.backgroundColor = '#2980b9';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isAtFirstTopic) {
                e.currentTarget.style.backgroundColor = '#3498db';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }
            }}
            onMouseDown={(e) => {
              if (!isAtFirstTopic) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
              }
            }}
          >
            ← 上一个
          </button>
          <button 
            onClick={handleForward} 
            disabled={isAtLastTopic} 
            className="nav-button" 
            style={{
              padding: '10px 20px',
              backgroundColor: isAtLastTopic ? '#e0e0e0' : '#3498db',
              color: isAtLastTopic ? '#a0a0a0' : 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isAtLastTopic ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: isAtLastTopic ? 'none' : '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => {
              if (!isAtLastTopic) {
                e.currentTarget.style.backgroundColor = '#2980b9';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isAtLastTopic) {
                e.currentTarget.style.backgroundColor = '#3498db';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }
            }}
            onMouseDown={(e) => {
              if (!isAtLastTopic) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
              }
            }}
          >
            下一个 →
          </button>
        </div>

        {/* 当前主题和缓存状态 */}
        <div className="current-topic-container">
          <h2>{currentTopic}</h2>
          <div className="topic-actions">
            {contentCache[currentTopic] && (
              <button 
                onClick={handleClearCacheAndRefresh} 
                className="clear-cache-button"
              >
                🗑️ 清除缓存并刷新
              </button>
            )}
            {/* <span className={contentCache[currentTopic] ? 'cached-indicator' : 'not-cached-indicator'}>
              {contentCache[currentTopic] ? '已缓存' : '未缓存'}
            </span> */}
          </div>
        </div>

        {/* 书籍使用状态显示 */}
        {isUsingUploadedData && uploadedBookName && (
          <div className="uploaded-book-indicator">
            当前正在使用上传的书籍: <strong>{uploadedBookName}</strong>
          </div>
        )}

        {/* 目录 - 修改为始终显示目录 */}
        {(currentTopic === '目录' || currentTopic === 'Directory') && (
          <Directory
            directoryData={getCurrentDirectoryData ? getCurrentDirectoryData() : directoryData}
            language={language}
            currentTopic={currentTopic}
            onItemClick={handleDirectoryItemClick}
          />
        )}

        {/* 主内容区域 */}
        <div className="content-area">
          <ContentGenerator
            currentTopic={currentTopic}
            language={language}
            hasValidApiKey={hasValidApiKey}
          />
        </div>

        {/* 无API密钥提示 */}
        {!hasValidApiKey && currentTopic !== '目录' && currentTopic !== 'Directory' && (
          <div className="no-api-key-prompt">
            <div className="prompt-content">
              <h3>当前正在使用维基百科服务</h3>
              <p>为了获得更丰富的内容生成体验，建议配置API密钥。</p>
              <button 
                onClick={onRequestApiKey} 
                className="configure-button"
              >
                立即配置
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentRenderer;