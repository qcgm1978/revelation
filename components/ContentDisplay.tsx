// @ts-nocheck
import React, { useState, useEffect } from "react";

interface ContentDisplayProps {
  content: string;
  isLoading: boolean;
  onWordClick: (word: string) => void;
}


const segmentChineseText = (text: string): string[] => {
 
  const segments: string[] = [];
  let currentSegment = "";

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

   
    const isChinese = /[\u4e00-\u9fff]/.test(char);
    const isNextChinese = nextChar && /[\u4e00-\u9fff]/.test(nextChar);

    if (isChinese) {
      currentSegment += char;

     
      if (!isNextChinese || i === text.length - 1) {
        if (currentSegment.length > 0) {
          segments.push(currentSegment);
          currentSegment = "";
        }
      }
    } else {
     
      if (currentSegment.length > 0) {
        segments.push(currentSegment);
        currentSegment = "";
      }

     
      if (/[a-zA-Z]/.test(char)) {
        let englishWord = char;
        let j = i + 1;
        while (j < text.length && /[a-zA-Z]/.test(text[j])) {
          englishWord += text[j];
          j++;
        }
        segments.push(englishWord);
        i = j - 1;
      } else if (/[^\s]/.test(char)) {
       
        segments.push(char);
      } else {
       
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

 
  const segments = segmentChineseText(content);

  const handleWordClick = (segment: string, cleanSegment: string) => {
    if (isMultiSelectMode) {
     
      setSelectedWords((prev) => {
        if (prev.includes(cleanSegment)) {
          return prev.filter((w) => w !== cleanSegment);
        } else {
          return [...prev, cleanSegment];
        }
      });
    } else {
     
      onWordClick(cleanSegment);
    }
  };


 
  const isClickableSegment = (segment: string): boolean => {
   
    if (/[\u4e00-\u9fff]/.test(segment) && segment.length >= 2) {
      return true;
    }
   
    if (/^[a-zA-Z]{2,}$/.test(segment)) {
      return true;
    }
    return false;
  };

 
  const cleanSegment = (segment: string): string => {
    return segment.replace(/[.,!?;:()"'，。！？；：（）""'']/g, "");
  };

 
  return (
    <div>
      {/* 内容显示 */}
      <p className="content-paragraph">
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
                  userSelect: 'none'
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
