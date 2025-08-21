import React from 'react';

interface MultiSelectControlProps {
  language: 'zh' | 'en';
  isMultiSelectMode: boolean;
  selectedWords: string[];
  toggleMultiSelectMode: () => void;
  handleMultiSearch: () => void;
}

const MultiSelectControl: React.FC<MultiSelectControlProps> = ({ 
  language, 
  isMultiSelectMode, 
  selectedWords, 
  toggleMultiSelectMode, 
  handleMultiSearch 
}) => {
  return (
    <div style={{ width: '100%' }}>
      {/* 多选控制栏 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <button
          onClick={toggleMultiSelectMode}
          style={{
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '4px',
            background: isMultiSelectMode ? '#3498db' : '#f8f9fa',
            color: isMultiSelectMode ? 'white' : '#666',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            transition: 'all 0.3s ease',
          }}
        >
          {isMultiSelectMode ? (language === 'zh' ? '退出词汇选择' : 'Exit Word Selection') : (language === 'zh' ? '词汇选择模式' : 'Word Selection Mode')}
        </button>

        {isMultiSelectMode && (
          <>
            <span style={{ marginRight: '1rem', color: '#666' }}>
              {language === 'zh' ? '已选择' : 'Selected'} {selectedWords.length} {language === 'zh' ? '个词汇' : 'words'}
            </span>
            {selectedWords.length > 0 && (
              <button
                onClick={handleMultiSearch}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '4px',
                  background: '#27ae60',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                }}
              >
                {language === 'zh' ? '搜索组合词组' : 'Search Combined Phrase'}
              </button>
            )}
          </>
        )}
      </div>

      {/* 选中的词汇显示 */}
      {isMultiSelectMode && selectedWords.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginTop: '0.5rem',
          marginBottom: '1rem'
        }}>
          <strong>{language === 'zh' ? '已选择：' : 'Selected: '}</strong>
          {selectedWords.map((word, index) => (
            <span key={index} style={{
              backgroundColor: '#e3f2fd',
              color: '#1565c0',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              fontSize: '0.8rem'
            }}>
              {word}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelectControl;