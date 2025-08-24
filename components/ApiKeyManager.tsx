import React, { useState, useEffect } from "react";

interface ApiKeyManagerProps {
  onApiKeyChange: (apiKey: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({
  onApiKeyChange,
  isOpen,
  onClose,
}) => {
  const [apiKey, setApiKey] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // 从 localStorage 加载保存的 API 密钥
    const savedApiKey = localStorage.getItem("DEEPSEEK_API_KEY");
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setIsValid(savedApiKey.length > 0);
      onApiKeyChange(savedApiKey);
    }
  }, [onApiKeyChange]);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem("DEEPSEEK_API_KEY", apiKey.trim());
      setIsValid(true);
      onApiKeyChange(apiKey.trim());
      onClose();
    }
  };

  const handleClear = () => {
    localStorage.removeItem("DEEPSEEK_API_KEY");
    setApiKey("");
    setIsValid(false);
    onApiKeyChange("");
    onClose();
  };

  const handleUseDefaultService = () => {
    // 清除现有的API密钥
    localStorage.removeItem("DEEPSEEK_API_KEY");
    setApiKey("");
    setIsValid(false);
    // 通知父组件API密钥已更改
    onApiKeyChange("");
    // 关闭弹窗
    onClose();
  };

  const handleKeyPress = (e: any) => {
    if (e.key === "Enter") {
      handleSave();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
          maxWidth: "500px",
          width: "90%",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "none",
            border: "none",
            fontSize: "1.5rem",
            cursor: "pointer",
            color: "#666",
          }}
        >
          ×
        </button>

        <h2 style={{ marginTop: 0, marginBottom: "1.5rem", color: "#2c3e50" }}>
          DeepSeek API 密钥配置
        </h2>

        <div style={{ marginBottom: "1rem" }}>
          <label
            htmlFor="apiKey"
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "500",
              color: "#34495e",
            }}
          >
            API 密钥
          </label>
          <div style={{ position: "relative" }}>
            <input
              id="apiKey"
              type={showPassword ? "text" : "password"}
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setIsValid(e.target.value.length > 0);
              }}
              onKeyPress={handleKeyPress}
              placeholder="请输入你的 DeepSeek API 密钥"
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "2px solid #e1e8ed",
                borderRadius: "8px",
                fontSize: "1rem",
                boxSizing: "border-box",
                transition: "border-color 0.3s ease",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#666",
                fontSize: "1rem",
              }}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "#7f8c8d" }}>
            💡 获取 API 密钥：
            <a
              href="https://platform.deepseek.com/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#3498db", textDecoration: "none" }}
            >
              点击这里访问 DeepSeek 平台
            </a>
          </p>
        </div>

        <div
          style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}
        >
          {/* <button
            onClick={handleUseDefaultService}
            style={{
              padding: "0.75rem 1.5rem",
              border: "2px solid #27ae60",
              backgroundColor: "white",
              color: "#27ae60",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "500",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#27ae60";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "white";
              e.currentTarget.style.color = "#27ae60";
            }}
          >
            使用默认服务
          </button> */}
          <button
            onClick={handleClear}
            style={{
              padding: "0.75rem 1.5rem",
              border: "2px solid #e74c3c",
              backgroundColor: "white",
              color: "#e74c3c",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "500",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#e74c3c";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "white";
              e.currentTarget.style.color = "#e74c3c";
            }}
          >
            清除
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid}
            style={{
              padding: "0.75rem 1.5rem",
              border: "none",
              backgroundColor: isValid ? "#3498db" : "#bdc3c7",
              color: "white",
              borderRadius: "8px",
              cursor: isValid ? "pointer" : "not-allowed",
              fontSize: "1rem",
              fontWeight: "500",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              if (isValid) {
                e.currentTarget.style.backgroundColor = "#2980b9";
              }
            }}
            onMouseLeave={(e) => {
              if (isValid) {
                e.currentTarget.style.backgroundColor = "#3498db";
              }
            }}
          >
            保存
          </button>
        </div>

        {isValid && (
          <div
            style={{
              marginTop: "1rem",
              padding: "0.75rem",
              backgroundColor: "#d4edda",
              border: "1px solid #c3e6cb",
              borderRadius: "6px",
              color: "#155724",
              fontSize: "0.9rem",
            }}
          >
            ✅ API 密钥已配置，应用可以正常使用
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiKeyManager;
