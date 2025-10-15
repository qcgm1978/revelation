// @ts-nocheck
import { useState, useEffect, useCallback } from "react";
import { streamDefinition } from "llm-service-provider";
import ContentDisplay from "./ContentDisplay";
import LoadingSkeleton from "./LoadingSkeleton";
import SearchBar from "./SearchBar";
import {
  getSelectedServiceProvider,
  ServiceProvider,
} from "llm-service-provider";
import audioManager from "../utils/audioManager";
import { speakText, stopSpeaking } from "../utils/ttsAdapter";

interface ContentGeneratorProps {
  currentTopic: string;
  language: "zh" | "en";
  hasValidApiKey: boolean;
  onWordClick: (word: string) => void;
  directoryData?: Record<string, any>;

  onSearch: (query: string) => void;
  onRandom: () => void;
  setIsApiKeyManagerOpen: (open: boolean) => void;
}

const ContentGenerator = ({
  currentTopic,
  language,
  hasValidApiKey,
  onWordClick,
  directoryData,
  onSearch,
  onRandom,
  setIsApiKeyManagerOpen,
}: ContentGeneratorProps) => {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generationTime, setGenerationTime] = useState<number | null>(null);
  const [contentCache, setContentCache] = useState<
    Record<
      string,
      {
        content: string;
        generationTime: number | null;
      }
    >
  >({});
  const [isFromCache, setIsFromCache] = useState<boolean>(false);
  const [isDirectory, setIsDirectory] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const synth = window.speechSynthesis;

  const hasSpeechSupport =
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof SpeechSynthesisUtterance !== "undefined";

  const handleTextToSpeech = async () => {
    if (isPlaying) {
      await stopSpeaking();
      setIsPlaying(false);
    } else {
      if (audioManager.isAudioPlaying()) {
        audioManager.stopAudio();
      }

      await stopSpeaking();

      setIsPlaying(true);

      if (hasSpeechSupport) {
        try {
          const utterance = new SpeechSynthesisUtterance(content);
          utterance.lang = language;
          utterance.onend = () => {
            setIsPlaying(false);
          };
          utterance.onerror = () => {
            setIsPlaying(false);
          };

          window.speechSynthesis.speak(utterance);
        } catch (error) {
          console.error("Web Speech API failed:", error);
          const success = await speakText(content, language);
          if (success) {
            setIsPlaying(true);
            setTimeout(() => {
              setIsPlaying(false);
            }, content.length * 80); // 估算朗读时间
          } else {
            alert(
              "朗读失败，请检查：\n1. 设备音量是否开启\n2. 应用是否有音频权限\n3. 设备是否安装了中文语音包"
            );
            setIsPlaying(false);
          }
        }
      } else {
        try {
          const success = await speakText(content, language);
          if (success) {
            setIsPlaying(true);
            // 因为原生TTS没有回调，设置一个定时器来重置状态
            setTimeout(() => {
              setIsPlaying(false);
            }, content.length * 80); // 估算朗读时间
          } else {
            alert("朗读失败，请检查TTS设置");
          }
        } catch (error) {
          console.error("TTS failed:", error);
          alert("朗读失败，请检查TTS设置");
        }
      }
    }
  };

  // 只在支持的情况下显示朗读按钮

  useEffect(() => {
    if (content && content.length > 0) {
      document.dispatchEvent(
        new CustomEvent("contentUpdated", {
          detail: content,
        })
      );
    }
  }, [content]);
  useEffect(() => {
    if (!currentTopic) return;

    if (currentTopic === "目录" || currentTopic === "Directory") {
      setIsDirectory(true);
      setContent("");
      setIsLoading(false);
      setError(null);
      setGenerationTime(null);
      return;
    }

    setIsDirectory(false);

    const cacheKey = `${currentTopic}-${language}-${
      getSelectedServiceProvider() === ServiceProvider.DEEPSEEK
        ? "deepseek"
        : getSelectedServiceProvider() === ServiceProvider.GEMINI
        ? "gemini"
        : getSelectedServiceProvider() === ServiceProvider.YOUCHAT
        ? "youchat"
        : getSelectedServiceProvider() === ServiceProvider.GROQ
        ? "groq"
        : "xunfei"
    }`;

    if (contentCache[cacheKey]) {
      console.log(`从缓存加载内容: ${cacheKey}`);
      const cachedData = contentCache[cacheKey];
      setContent(cachedData.content);
      setGenerationTime(cachedData.generationTime);
      setIsLoading(false);
      setError(null);
      setIsFromCache(true);
      return;
    }

    setIsFromCache(false);

    let isCancelled = false;

    const fetchContentAndArt = async () => {
      setIsLoading(true);
      setContent("");
      setGenerationTime(null);
      const startTime = performance.now();

      let accumulatedContent = "";
      try {
        let category = sessionStorage.getItem(`category_for_${currentTopic}`);

        if (!category && directoryData) {
          const categories = Object.keys(directoryData);
          for (const cat of categories) {
            const items = directoryData[cat];
            if (items && Array.isArray(items)) {
              const foundItem = items.find(
                (item) => item.term && item.term.includes(currentTopic)
              );
              if (foundItem) {
                category = cat;
                break;
              }
            }
          }
        }

        for await (const chunk of streamDefinition(
          currentTopic,
          language,
          category,
          content
        )) {
          if (isCancelled) break;

          if (chunk.startsWith("Error:")) {
            throw new Error(chunk);
          }
          accumulatedContent += chunk;
          if (!isCancelled) {
            setContent(accumulatedContent);
          }
        }
      } catch (e: unknown) {
        if (!isCancelled) {
          const errorMessage =
            e instanceof Error ? e.message : "An unknown error occurred";
          setError(errorMessage);
          setContent("");
          console.error(e);
        }
      } finally {
        if (!isCancelled) {
          const endTime = performance.now();
          const genTime = endTime - startTime;
          setGenerationTime(genTime);
          setIsLoading(false);

          if (accumulatedContent && !isCancelled) {
            setContentCache((prevCache) => ({
              ...prevCache,
              [cacheKey]: {
                content: accumulatedContent,
                generationTime: genTime,
              },
            }));
            console.log(`内容已缓存: ${cacheKey}`);
          }
        }
      }
    };

    fetchContentAndArt();

    return () => {
      isCancelled = true;
    };
  }, [currentTopic, language, hasValidApiKey]);

  const handleRefreshContent = useCallback(() => {
    const cacheKey = `${currentTopic}-${language}-${
      hasValidApiKey ? "deepseek" : "wiki"
    }`;
    setContentCache((prevCache) => {
      const newCache = { ...prevCache };
      delete newCache[cacheKey];
      return newCache;
    });

    setIsFromCache(false);

    setContent("");
    setIsLoading(true);

    setTimeout(() => {
      if (currentTopic) {
        let isCancelled = false;

        const fetchContentAndArt = async () => {
          const startTime = performance.now();
          let accumulatedContent = "";
          try {
            for await (const chunk of streamDefinition(
              currentTopic,
              language
            )) {
              if (isCancelled) break;

              if (chunk.startsWith("Error:")) {
                throw new Error(chunk);
              }
              accumulatedContent += chunk;
              if (!isCancelled) {
                setContent(accumulatedContent);
              }
            }
          } catch (e: unknown) {
            if (!isCancelled) {
              const errorMessage =
                e instanceof Error ? e.message : "An unknown error occurred";
              setError(errorMessage);
              setContent("");
              console.error(e);
            }
          } finally {
            if (!isCancelled) {
              const endTime = performance.now();
              const genTime = endTime - startTime;
              setGenerationTime(genTime);
              setIsLoading(false);

              if (accumulatedContent && !isCancelled) {
                setContentCache((prevCache) => ({
                  ...prevCache,
                  [`${currentTopic}-${language}-${
                    getSelectedServiceProvider() === ServiceProvider.DEEPSEEK
                      ? "deepseek"
                      : getSelectedServiceProvider() === ServiceProvider.GEMINI
                      ? "gemini"
                      : "xunfei"
                  }`]: {
                    content: accumulatedContent,
                    generationTime: genTime,
                  },
                }));
              }
            }
          }
        };

        fetchContentAndArt();

        return () => {
          isCancelled = true;
        };
      }
    }, 100);
  }, [currentTopic, language, hasValidApiKey]);

  if (isDirectory) {
    return null;
  }

  const err_msg = (
    <div
      onClick={() => setIsApiKeyManagerOpen(true)}
      style={{
        border: "2px solid #f39c12",
        padding: "1.5rem",
        color: "#d68910",
        backgroundColor: "#fef9e7",
        borderRadius: "8px",
        textAlign: "center",
        marginBottom: "2rem",
      }}
    >
      <h3 style={{ margin: "0 0 1rem 0", color: "#d68910" }}>
        🔑 {language === "zh" ? "推荐配置 API 密钥" : "API Key Recommended"}
      </h3>
      <p style={{ margin: "0 0 1rem 0", fontSize: "1rem", cursor: "pointer" }}>
        {language === "zh"
          ? '点击此处或右上角的"⋮"进入语言模型菜单，输入模型密钥以获得更好的内容生成体验。或选择YouChat直接可用(开启VPN)。'
          : 'Click here or the "Configure" button in the top right corner to enter your DeepSeek API key for better content generation. Currently using Wikipedia service.'}
      </p>
    </div>
  );
  const enable_error_msg = !isLoading && (error && content.length === 0);
  return (
    <div>
      {
        <div id="content-container">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              alignSelf: "flex-end",
            }}
          >
            <button
              onClick={handleTextToSpeech}
              style={{
                fontSize: "1rem",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                marginRight: "0.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title={
                language === "zh"
                  ? isPlaying
                    ? "停止朗读"
                    : "朗读内容"
                  : isPlaying
                  ? "Stop reading"
                  : "Read content"
              }
            >
              {isPlaying ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="black">
                  <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
                  <path d="M19 12h-2v-2h2v2z" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="black">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              )}
            </button>
            <button
              onClick={handleRefreshContent}
              style={{
                fontSize: "1rem",
                padding: "0 0.5rem",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
              title={language === "zh" ? "刷新内容" : "Refresh content"}
            >
              🔄
            </button>
          </div>
          <ContentDisplay
            content={content}
            isLoading={isLoading}
            onWordClick={onWordClick}
          />
        </div>
      }
      {enable_error_msg && err_msg}
      {enable_error_msg && (
        <div
          style={{
            border: "1px solid #cc0000",
            padding: "1rem",
            color: "#cc0000",
          }}
        >
          <p style={{ margin: 0 }}>
            {language === "zh" ? "发生错误" : "An Error Occurred"}
          </p>
          <p style={{ marginTop: "0.5rem", margin: 0 }}>{error}</p>
        </div>
      )}
      {isLoading && content.length === 0 && !error && <LoadingSkeleton />}

      {/* 先放置搜索框 */}
      <SearchBar
        onSearch={onSearch}
        onRandom={onRandom}
        isLoading={isLoading}
        showRandomButton={!isDirectory}
        language={language}
      />
    </div>
  );
};

export default ContentGenerator;
