import React, { useState } from "react";

interface ContentDisplayProps {
  content: string;
  isLoading: boolean;
  onWordClick: (word: string) => void;
}

// 中文分词函数
const segmentChineseText = (text: string): string[] => {
  // 简单的中文分词规则
  const segments: string[] = [];
  let currentSegment = "";

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    // 检查是否为中文字符
    const isChinese = /[\u4e00-\u9fff]/.test(char);
    const isNextChinese = nextChar && /[\u4e00-\u9fff]/.test(nextChar);

    if (isChinese) {
      currentSegment += char;

      // 如果下一个字符不是中文，或者到达文本末尾，则结束当前分词
      if (!isNextChinese || i === text.length - 1) {
        if (currentSegment.length > 0) {
          segments.push(currentSegment);
          currentSegment = "";
        }
      }
    } else {
      // 非中文字符，如果有累积的中文分词，先添加
      if (currentSegment.length > 0) {
        segments.push(currentSegment);
        currentSegment = "";
      }

      // 处理英文单词和标点符号
      if (/[a-zA-Z]/.test(char)) {
        let englishWord = char;
        let j = i + 1;
        while (j < text.length && /[a-zA-Z]/.test(text[j])) {
          englishWord += text[j];
          j++;
        }
        segments.push(englishWord);
        i = j - 1; // 跳过已处理的字符
      } else if (/[^\s]/.test(char)) {
        // 标点符号
        segments.push(char);
      } else {
        // 空白字符
        segments.push(char);
      }
    }
  }

  return segments;
};

const InteractiveContent: React.FC<{
  content: string;
  onWordClick: (word: string) => void;
}> = ({ content, onWordClick,  }) => {
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);

  // 使用中文分词函数处理内容
  const segments = segmentChineseText(content);

  const handleWordClick = (segment: string, cleanSegment: string) => {
    if (isMultiSelectMode) {
      // 多选模式：切换词汇选中状态
      setSelectedWords((prev) => {
        if (prev.includes(cleanSegment)) {
          return prev.filter((w) => w !== cleanSegment);
        } else {
          return [...prev, cleanSegment];
        }
      });
    } else {
      // 单选模式：直接搜索
      onWordClick(cleanSegment);
    }
  };


  // 判断是否为可点击的词汇
  const isClickableSegment = (segment: string): boolean => {
    // 中文字符（2个或以上）
    if (/[\u4e00-\u9fff]/.test(segment) && segment.length >= 2) {
      return true;
    }
    // 英文单词（2个或以上字母）
    if (/^[a-zA-Z]{2,}$/.test(segment)) {
      return true;
    }
    return false;
  };

  // 清理词汇（去除标点符号）
  const cleanSegment = (segment: string): string => {
    return segment.replace(/[.,!?;:()"'，。！？；：（）""'']/g, "");
  };

  // 将button元素替换为span元素
  return (
    <div>
      {/* 内容显示 */}
      <p style={{ margin: 0 }}>
        {segments.map((segment, index) => {
          const cleanSegmentText = cleanSegment(segment);
  
          if (isClickableSegment(segment)) {
            const isSelected = selectedWords.includes(cleanSegmentText);
            return (
              <span
                key={index}
                onClick={() => handleWordClick(segment, cleanSegmentText)}
                className={`interactive-word word-span ${isSelected ? "selected" : ""}`}
                aria-label={`了解更多关于 ${cleanSegmentText} 的信息`}
                style={{
                  padding: "2px 4px",
                  margin: "0 1px",
                  cursor: "pointer",
                  borderRadius: "4px",
                  transition: "all 0.2s ease",
                  color: isSelected ? "#fff" : "#007bff",
                  backgroundColor: isSelected ? "#007bff" : "transparent",
                  textDecoration: "underline",
                  textDecorationColor: isSelected ? "transparent" : "#007bff",
                  display: 'inline',
                  userSelect: 'none' // 防止选中文本
                }}
                onMouseEnter={(e) => {
                  if (!isSelected && e.currentTarget instanceof HTMLElement) {
                    e.currentTarget.style.backgroundColor = "#f0f8ff";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected && e.currentTarget instanceof HTMLElement) {
                    e.currentTarget.style.backgroundColor = isSelected
                      ? "#007bff"
                      : "transparent";
                  }
                }}
              >
                {segment}
              </span>
            );
          } else {
            // 非可点击内容（标点符号、空白等）
            return <span key={index}>{segment}</span>;
          }
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
}) => {
  if (isLoading) {
    return <StreamingContent content={content} />;
  }

  if (content) {
    return (
      <InteractiveContent
        content={content}
        onWordClick={onWordClick}
      />
    );
  }

  return null;
};

export default ContentDisplay;
