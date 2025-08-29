import React from 'react';

interface LanguageSelectorProps {
  language: "zh" | "en";
  onLanguageChange: (language: "zh" | "en") => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  language, 
  onLanguageChange, 
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <span
          style={{
            fontSize: "0.9rem",
            color: "#666",
            fontWeight: "500",
          }}
        >
          {/* {language === "zh" ? "语言" : "Language"}: */}
        </span>

        <div
          style={{
            display: "flex",
            border: "2px solid #e1e8ed",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <button
            onClick={() => onLanguageChange("zh")}
            style={{
              padding: "0.5rem 1rem",
              border: "none",
              background: language === "zh" ? "#3498db" : "#f8f9fa",
              color: language === "zh" ? "white" : "#666",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: "500",
              transition: "all 0.3s ease",
              minWidth: "60px",
            }}
            onMouseEnter={(e) => {
              if (language !== "zh") {
                e.currentTarget.style.background = "#e9ecef";
              }
            }}
            onMouseLeave={(e) => {
              if (language !== "zh") {
                e.currentTarget.style.background = "#f8f9fa";
              }
            }}
          >
            中文
          </button>

          <button
            onClick={() => onLanguageChange("en")}
            style={{
              padding: "0.5rem 1rem",
              border: "none",
              background: language === "en" ? "#3498db" : "#f8f9fa",
              color: language === "en" ? "white" : "#666",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: "500",
              transition: "all 0.3s ease",
              minWidth: "60px",
            }}
            onMouseEnter={(e) => {
              if (language !== "en") {
                e.currentTarget.style.background = "#e9ecef";
              }
            }}
            onMouseLeave={(e) => {
              if (language !== "en") {
                e.currentTarget.style.background = "#f8f9fa";
              }
            }}
          >
            English
          </button>
        </div>
      </div>

      {/* <MultiSelectControl
        language={language}
        isMultiSelectMode={isMultiSelectMode}
        selectedWords={selectedWords}
        toggleMultiSelectMode={toggleMultiSelectMode}
        handleMultiSearch={handleMultiSearch}
      /> */}
    </div>
  );
};

export default LanguageSelector;
