import React, { useState } from "react";

interface ContentDisplayProps {
  content: string;
  isLoading: boolean;
  onWordClick: (word: string) => void;
  onMultiSearch: (words: string[]) => void;
}

const InteractiveContent: React.FC<{
  content: string;
  onWordClick: (word: string) => void;
  onMultiSearch: (words: string[]) => void;
}> = ({ content, onWordClick, onMultiSearch }) => {
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);

  const words = content.split(/(\s+)/).filter(Boolean); // Keep whitespace for spacing

  const handleWordClick = (word: string, cleanWord: string) => {
    if (isMultiSelectMode) {
      // 多选模式：切换单词选中状态
      setSelectedWords((prev) => {
        if (prev.includes(cleanWord)) {
          return prev.filter((w) => w !== cleanWord);
        } else {
          return [...prev, cleanWord];
        }
      });
    } else {
      // 单选模式：直接搜索
      onWordClick(cleanWord);
    }
  };

  const handleMultiSearch = () => {
    console.log("handleMultiSearch clicked, selectedWords:", selectedWords);
    console.log("onMultiSearch function:", onMultiSearch);
    if (selectedWords.length > 0 && onMultiSearch) {
      console.log("Calling onMultiSearch with:", selectedWords);
      onMultiSearch(selectedWords);
      setSelectedWords([]); // 清空选择
      setIsMultiSelectMode(false); // 退出多选模式
    } else {
      console.log("Cannot call onMultiSearch:", {
        selectedWordsLength: selectedWords.length,
        hasOnMultiSearch: !!onMultiSearch,
      });
    }
  };

  const toggleMultiSelectMode = () => {
    setIsMultiSelectMode(!isMultiSelectMode);
    if (isMultiSelectMode) {
      setSelectedWords([]); // 退出多选模式时清空选择
    }
  };

  return (
    <div>
      {/* 多选控制栏 */}
      <div className="multi-select-controls">
        <button
          onClick={toggleMultiSelectMode}
          className={`multi-select-button ${
            isMultiSelectMode ? "primary" : "secondary"
          }`}
        >
          {isMultiSelectMode ? "退出多选" : "多选模式"}
        </button>

        {isMultiSelectMode && (
          <>
            <span style={{ marginRight: "1rem", color: "#666" }}>
              已选择 {selectedWords.length} 个单词
            </span>
            {selectedWords.length > 0 && (
              <button
                onClick={handleMultiSearch}
                className="multi-select-button success"
              >
                搜索组合词组
              </button>
            )}
          </>
        )}
      </div>

      {/* 选中的单词显示 */}
      {isMultiSelectMode && selectedWords.length > 0 && (
        <div className="selected-words-display">
          <strong>已选择：</strong>
          {selectedWords.map((word, index) => (
            <span key={index} className="selected-word-tag">
              {word}
            </span>
          ))}
        </div>
      )}

      {/* 内容显示 */}
      <p style={{ margin: 0 }}>
        {words.map((word, index) => {
          // Only make non-whitespace words clickable
          if (/\S/.test(word)) {
            const cleanWord = word.replace(/[.,!?;:()"']/g, "");
            if (cleanWord) {
              const isSelected = selectedWords.includes(cleanWord);
              return (
                <button
                  key={index}
                  onClick={() => handleWordClick(word, cleanWord)}
                  className={`interactive-word word-button ${
                    isSelected ? "selected" : ""
                  }`}
                  aria-label={`Learn more about ${cleanWord}`}
                >
                  {word}
                </button>
              );
            }
          }
          // Render whitespace as-is
          return <span key={index}>{word}</span>;
        })}
      </p>
    </div>
  );
};

const StreamingContent: React.FC<{ content: string }> = ({ content }) => (
  <p style={{ margin: 0 }}>
    {content}
    <span className="blinking-cursor">|</span>
  </p>
);

const ContentDisplay: React.FC<ContentDisplayProps> = ({
  content,
  isLoading,
  onWordClick,
  onMultiSearch,
}) => {
  if (isLoading) {
    return <StreamingContent content={content} />;
  }

  if (content) {
    return (
      <InteractiveContent
        content={content}
        onWordClick={onWordClick}
        onMultiSearch={onMultiSearch}
      />
    );
  }

  return null;
};

export default ContentDisplay;
