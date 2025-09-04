import React, { useState, useEffect } from "react";
import { 
  ServiceProvider, 
  getSelectedServiceProvider, 
  setSelectedServiceProvider,
  setDeepSeekApiKey, 
  setGeminiApiKey,
  hasDeepSeekApiKey,
  hasGeminiApiKey,
  shouldShowApiKeyPrompt
} from '../services/wikiService';

// 修改ApiKeyManagerProps接口
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
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider>(ServiceProvider.FREE);
  const [apiKey, setApiKey] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 初始化状态
  useEffect(() => {
    const provider = getSelectedServiceProvider();
    setSelectedProvider(provider);
    
    // 加载对应服务的API密钥
    if (provider === ServiceProvider.DEEPSEEK) {
      const key = localStorage.getItem('DEEPSEEK_API_KEY') || '';
      setApiKey(key);
      setIsValid(hasDeepSeekApiKey());
    } else if (provider === ServiceProvider.GEMINI) {
      const key = localStorage.getItem('GEMINI_API_KEY') || '';
      setApiKey(key);
      setIsValid(hasGeminiApiKey());
    } else {
      setApiKey('');
      setIsValid(false);
    }
  }, []);

  // 当服务提供商改变时，更新密钥显示
  const handleProviderChange = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setSelectedServiceProvider(provider);
    
    if (provider === ServiceProvider.DEEPSEEK) {
      const key = localStorage.getItem('DEEPSEEK_API_KEY') || '';
      setApiKey(key);
      setIsValid(hasDeepSeekApiKey());
    } else if (provider === ServiceProvider.GEMINI) {
      const key = localStorage.getItem('GEMINI_API_KEY') || '';
      setApiKey(key);
      setIsValid(hasGeminiApiKey());
    } else {
      setApiKey('');
      setIsValid(false);
      onSave('');
    }
  };

  // 保存API密钥
  const handleSave = () => {
    if (apiKey.trim() && selectedProvider !== ServiceProvider.FREE) {
      if (selectedProvider === ServiceProvider.DEEPSEEK) {
        setDeepSeekApiKey(apiKey.trim());
      } else if (selectedProvider === ServiceProvider.GEMINI) {
        setGeminiApiKey(apiKey.trim());
      }
      setIsValid(true);
      onSave(apiKey.trim());
      
      // 修复：无论是否有onNavigateToWiki，都立即调用onClose关闭窗口
      onClose();
      
      if (onNavigateToWiki) {
        // 使用setTimeout确保窗口关闭后再导航
        setTimeout(() => {
          onNavigateToWiki();
        }, 100);
      }
    } else if (selectedProvider === ServiceProvider.FREE) {
      onSave('');
      onClose();
    }
  };

  // 清除API密钥
  const handleClear = () => {
    if (selectedProvider === ServiceProvider.DEEPSEEK) {
      setDeepSeekApiKey('');
    } else if (selectedProvider === ServiceProvider.GEMINI) {
      setGeminiApiKey('');
    }
    setApiKey('');
    setIsValid(false);
    onSave('');
  };

  // 使用免费服务
  const handleUseFreeService = () => {
    handleProviderChange(ServiceProvider.FREE);
  };

  // 键盘事件处理
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
          API 密钥配置
        </h2>

        {/* 服务提供商选择 */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "500",
              color: "#34495e",
            }}
          >
            服务提供商
          </label>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button
              onClick={() => handleProviderChange(ServiceProvider.FREE)}
              style={{
                padding: "0.5rem 1rem",
                border: selectedProvider === ServiceProvider.FREE ? 
                  "2px solid #3498db" : "2px solid #e1e8ed",
                backgroundColor: selectedProvider === ServiceProvider.FREE ? 
                  "#3498db" : "white",
                color: selectedProvider === ServiceProvider.FREE ? 
                  "white" : "#34495e",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.9rem",
                transition: "all 0.3s ease",
              }}
            >
              免费服务
            </button>
            <button
              onClick={() => handleProviderChange(ServiceProvider.DEEPSEEK)}
              style={{
                padding: "0.5rem 1rem",
                border: selectedProvider === ServiceProvider.DEEPSEEK ? 
                  "2px solid #3498db" : "2px solid #e1e8ed",
                backgroundColor: selectedProvider === ServiceProvider.DEEPSEEK ? 
                  "#3498db" : "white",
                color: selectedProvider === ServiceProvider.DEEPSEEK ? 
                  "white" : "#34495e",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.9rem",
                transition: "all 0.3s ease",
              }}
            >
              DeepSeek
            </button>
            <button
              onClick={() => handleProviderChange(ServiceProvider.GEMINI)}
              style={{
                padding: "0.5rem 1rem",
                border: selectedProvider === ServiceProvider.GEMINI ? 
                  "2px solid #3498db" : "2px solid #e1e8ed",
                backgroundColor: selectedProvider === ServiceProvider.GEMINI ? 
                  "#3498db" : "white",
                color: selectedProvider === ServiceProvider.GEMINI ? 
                  "white" : "#34495e",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.9rem",
                transition: "all 0.3s ease",
              }}
            >
              Gemini
            </button>
          </div>
        </div>

        {/* API密钥输入框 - 仅在选择DeepSeek或Gemini时显示 */}
        {(selectedProvider === ServiceProvider.DEEPSEEK || selectedProvider === ServiceProvider.GEMINI) && (
          <>
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
                {selectedProvider === ServiceProvider.DEEPSEEK ? "DeepSeek API 密钥" : "Gemini API 密钥"}
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
                  placeholder={`请输入你的 ${selectedProvider === ServiceProvider.DEEPSEEK ? "DeepSeek" : "Gemini"} API 密钥`}
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
                  href={selectedProvider === ServiceProvider.DEEPSEEK ? "https://platform.deepseek.com/" : "https://makersuite.google.com/app/apikey"}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#3498db", textDecoration: "none" }}
                >
                  点击这里访问 {selectedProvider === ServiceProvider.DEEPSEEK ? "DeepSeek" : "Gemini"} 平台
                </a>
              </p>
            </div>
          </>
        )}

        <div
          style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}
        >
          {(selectedProvider !== ServiceProvider.FREE) && (
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
          )}
          {(selectedProvider !== ServiceProvider.FREE) ? (
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
          ) : (
            <button
              onClick={handleSave}
              style={{
                padding: "0.75rem 1.5rem",
                border: "none",
                backgroundColor: "#3498db",
                color: "white",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: "500",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#2980b9";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#3498db";
              }}
            >
              确定
            </button>
          )}
        </div>

        {(selectedProvider !== ServiceProvider.FREE && isValid) && (
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
            ✅ {selectedProvider === ServiceProvider.DEEPSEEK ? "DeepSeek" : "Gemini"} API 密钥已配置，应用可以正常使用
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiKeyManager;
