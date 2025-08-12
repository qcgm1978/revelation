import React, { useState, useEffect, useCallback } from "react";
import {
  streamDefinition,
  generateAsciiArt,
  AsciiArtData,
  hasApiKey,
} from "./services/deepseekService";
import ContentDisplay from "./components/ContentDisplay";
import SearchBar from "./components/SearchBar";
import LoadingSkeleton from "./components/LoadingSkeleton";
import AsciiArtDisplay from "./components/AsciiArtDisplay";
import ApiKeyManager from "./components/ApiKeyManager";
import LanguageSelector from "./components/LanguageSelector";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
// 读取目录内容统一使用 fetch，兼容 Web/Electron/Capacitor

// A curated list of "banger" words and phrases for the random button.
const PREDEFINED_WORDS = [
  // List 1
  "Balance",
  "Harmony",
  "Discord",
  "Unity",
  "Fragmentation",
  "Clarity",
  "Ambiguity",
  "Presence",
  "Absence",
  "Creation",
  "Destruction",
  "Light",
  "Shadow",
  "Beginning",
  "Ending",
  "Rising",
  "Falling",
  "Connection",
  "Isolation",
  "Hope",
  "Despair",
  // Complex phrases from List 1
  "Order and chaos",
  "Light and shadow",
  "Sound and silence",
  "Form and formlessness",
  "Being and nonbeing",
  "Presence and absence",
  "Motion and stillness",
  "Unity and multiplicity",
  "Finite and infinite",
  "Sacred and profane",
  "Memory and forgetting",
  "Question and answer",
  "Search and discovery",
  "Journey and destination",
  "Dream and reality",
  "Time and eternity",
  "Self and other",
  "Known and unknown",
  "Spoken and unspoken",
  "Visible and invisible",
  // List 2
  "Zigzag",
  "Waves",
  "Spiral",
  "Bounce",
  "Slant",
  "Drip",
  "Stretch",
  "Squeeze",
  "Float",
  "Fall",
  "Spin",
  "Melt",
  "Rise",
  "Twist",
  "Explode",
  "Stack",
  "Mirror",
  "Echo",
  "Vibrate",
  // List 3
  "Gravity",
  "Friction",
  "Momentum",
  "Inertia",
  "Turbulence",
  "Pressure",
  "Tension",
  "Oscillate",
  "Fractal",
  "Quantum",
  "Entropy",
  "Vortex",
  "Resonance",
  "Equilibrium",
  "Centrifuge",
  "Elastic",
  "Viscous",
  "Refract",
  "Diffuse",
  "Cascade",
  "Levitate",
  "Magnetize",
  "Polarize",
  "Accelerate",
  "Compress",
  "Undulate",
  // List 4
  "Liminal",
  "Ephemeral",
  "Paradox",
  "Zeitgeist",
  "Metamorphosis",
  "Synesthesia",
  "Recursion",
  "Emergence",
  "Dialectic",
  "Apophenia",
  "Limbo",
  "Flux",
  "Sublime",
  "Uncanny",
  "Palimpsest",
  "Chimera",
  "Void",
  "Transcend",
  "Ineffable",
  "Qualia",
  "Gestalt",
  "Simulacra",
  "Abyssal",
  // List 5
  "Existential",
  "Nihilism",
  "Solipsism",
  "Phenomenology",
  "Hermeneutics",
  "Deconstruction",
  "Postmodern",
  "Absurdism",
  "Catharsis",
  "Epiphany",
  "Melancholy",
  "Nostalgia",
  "Longing",
  "Reverie",
  "Pathos",
  "Ethos",
  "Logos",
  "Mythos",
  "Anamnesis",
  "Intertextuality",
  "Metafiction",
  "Stream",
  "Lacuna",
  "Caesura",
  "Enjambment",
];
const UNIQUE_WORDS = [...new Set(PREDEFINED_WORDS)];

/**
 * Creates a simple ASCII art bounding box as a fallback.
 * @param topic The text to display inside the box.
 * @param language The language for the fallback text.
 * @returns An AsciiArtData object with the generated art.
 */
const createFallbackArt = (
  topic: string,
  language: "zh" | "en" = "zh"
): AsciiArtData => {
  const displayableTopic =
    topic.length > 20 ? topic.substring(0, 17) + "..." : topic;
  const paddedTopic = ` ${displayableTopic} `;
  const topBorder = `┌${"─".repeat(paddedTopic.length)}┐`;
  const middle = `│${paddedTopic}│`;
  const bottomBorder = `└${"─".repeat(paddedTopic.length)}┘`;
  return {
    art: `${topBorder}\n${middle}\n${bottomBorder}`,
  };
};

// 定义目录项的类型
interface DirectoryItem {
  term: string;
  pages: string[];
  note?: string;
}

interface DirectoryData {
  [category: string]: DirectoryItem[];
}

const App: React.FC = () => {
  const [currentTopic, setCurrentTopic] = useState<string>("目录");
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [asciiArt, setAsciiArt] = useState<AsciiArtData | null>(null);
  const [generationTime, setGenerationTime] = useState<number | null>(null);
  const [isDirectory, setIsDirectory] = useState<boolean>(true);
  const [categoryMode, setCategoryMode] = useState<'subject' | 'page'>('subject');
  const [pageFilter, setPageFilter] = useState<string>('');
  
  // 历史记录状态
  const [history, setHistory] = useState<string[]>(["目录"]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  
  // 内容缓存状态
  const [contentCache, setContentCache] = useState<Record<string, {content: string, asciiArt: AsciiArtData | null, generationTime: number | null}>>({});
  const [isFromCache, setIsFromCache] = useState<boolean>(false);
  const [directoryData, setDirectoryData] = useState<DirectoryData>({});
  const [isApiKeyManagerOpen, setIsApiKeyManagerOpen] =
    useState<boolean>(false);
  const [hasValidApiKey, setHasValidApiKey] = useState<boolean>(false);
  const [language, setLanguage] = useState<"zh" | "en">('zh');
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);

  // 检查 API 密钥状态
  useEffect(() => {
    setHasValidApiKey(hasApiKey());
  }, []);

  // 加载目录内容
  useEffect(() => {
    const loadDirectoryContent = async () => {
      try {
        const url = `${import.meta.env.BASE_URL}revelation.json`;
        const response = await fetch(url, { cache: "no-cache" });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = (await response.json()) as DirectoryData;
        setDirectoryData(data);
      } catch (error) {
        console.error("Error loading revelation.json:", error);
        setDirectoryData({});
      }
    };

    loadDirectoryContent();
  }, []);

  // 处理 API 密钥变化
  const handleApiKeyChange = (apiKey: string) => {
    setHasValidApiKey(!!apiKey);
  };

  // 处理语言变化
  const handleLanguageChange = useCallback(
    (newLanguage: "zh" | "en") => {
      setLanguage(newLanguage);
      
      // 如果是目录页面且切换到英文，将标题也切换为英文
      if (currentTopic === "目录" && newLanguage === "en") {
        // 更新当前主题但不添加到历史记录中
        setCurrentTopic("Directory");
        // 更新历史记录中当前位置的值
        const newHistory = [...history];
        newHistory[currentIndex] = "Directory";
        setHistory(newHistory);
        return;
      } else if (currentTopic === "Directory" && newLanguage === "zh") {
        // 更新当前主题但不添加到历史记录中
        setCurrentTopic("目录");
        // 更新历史记录中当前位置的值
        const newHistory = [...history];
        newHistory[currentIndex] = "目录";
        setHistory(newHistory);
        return;
      }
      
      // 对于非目录页面，强制重新生成内容
      if (!isDirectory) {
        // 先清空当前内容，触发加载状态
        setContent("");
        setIsLoading(true);
        setAsciiArt(null);
        
        // 使用setTimeout确保状态更新后再触发重新生成
        setTimeout(() => {
          // 通过设置相同的主题来触发useEffect重新获取内容
          setCurrentTopic(prev => prev);
        }, 100);
      }
    },
    [currentTopic, history, currentIndex]
  );

  // 处理目录项点击 - 暂时使用直接更新方式，后面会重新定义
  const handleDirectoryItemClick = useCallback(
    (term: string) => {
      // 直接设置当前主题
      setCurrentTopic(term);
      // 更新历史记录
      const newHistory = history.slice(0, currentIndex + 1);
      newHistory.push(term);
      setHistory(newHistory);
      setCurrentIndex(newHistory.length - 1);
    },
    [currentTopic, history, currentIndex]
  );

  // 翻译目录类别
  const translateCategory = (category: string): string => {
    // 添加目录类别的中英文对照
    const categoryTranslations: Record<string, string> = {
      "基础概念": "Basic Concepts",
      "哲学思想": "Philosophical Thoughts",
      "科学理论": "Scientific Theories",
      "艺术表达": "Artistic Expression",
      "文学概念": "Literary Concepts",
      "心理学": "Psychology",
      "社会学": "Sociology",
      "宗教与信仰": "Religion & Belief",
      "历史事件": "Historical Events",
      "数学与逻辑": "Mathematics & Logic",
      "物理现象": "Physical Phenomena",
      "生物学": "Biology",
      "技术与创新": "Technology & Innovation",
      "经济学": "Economics",
      "政治理论": "Political Theories",
      "环境与生态": "Environment & Ecology",
      "语言学": "Linguistics",
      "音乐理论": "Music Theory",
      "电影艺术": "Film Arts",
      "建筑设计": "Architectural Design",
    };
    
    return categoryTranslations[category] || category;
  };

  // 按书页组织目录数据
  const getPageBasedDirectory = (filter?: string): Record<string, DirectoryItem[]> => {
    const pageMap: Record<string, DirectoryItem[]> = {};
    
    // 遍历所有学科
    (Object.values(directoryData) as DirectoryItem[][]).forEach(items => {
      // 遍历每个条目
      items.forEach(item => {
        // 遍历每个页码
        item.pages.forEach(page => {
          if (!pageMap[page]) {
            pageMap[page] = [];
          }
          // 添加条目到对应页码
          pageMap[page].push(item);
        });
      });
    });
    
    // 应用页码筛选
    let filteredPages = Object.keys(pageMap);
    if (filter) {
      filteredPages = filteredPages.filter(page => page.includes(filter));
    }

    // 按页码排序
    const sortedPageMap: Record<string, DirectoryItem[]> = {};
    filteredPages.sort((a, b) => {
      // 提取页码数字进行比较
      const numA = parseInt(a.replace(/\D/g, ''), 10);
      const numB = parseInt(b.replace(/\D/g, ''), 10);
      return numA - numB;
    }).forEach(page => {
      sortedPageMap[page] = pageMap[page];
    });
    
    return sortedPageMap;
  };

  // 渲染目录内容
  const renderDirectory = () => {
    if (Object.keys(directoryData).length === 0) {
      return (
        <div>
          {language === "zh" ? "目录加载中..." : "Loading directory..."}
        </div>
      );
    }

    // 页码筛选输入框
  const renderPageFilter = () => {
    if (categoryMode !== 'page') return null;
    
    return (
      <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
        <input
          type="text"
          placeholder={language === "zh" ? "输入页码筛选..." : "Enter page number to filter..."}
          value={pageFilter}
          onChange={(e) => setPageFilter(e.target.value)}
          style={{
            padding: "0.5rem",
            borderRadius: "4px",
            border: "1px solid #ddd",
            width: "200px",
            marginRight: "0.5rem",
          }}
        />
        <button
          onClick={() => setPageFilter('')}
          style={{
            background: "#e74c3c",
            color: "white",
            border: "none",
            borderRadius: "4px",
            padding: "0.5rem 1rem",
            cursor: "pointer",
          }}
        >
          {language === "zh" ? "清除" : "Clear"}
        </button>
      </div>
    );
  };

  // 切换分类模式的按钮
  const renderCategoryToggle = () => (
      <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
        <button
          onClick={() => setCategoryMode('subject')}
          style={{
            background: categoryMode === 'subject' ? "#3498db" : "#e0e0e0",
            color: categoryMode === 'subject' ? "white" : "#333",
            border: "none",
            borderRadius: "4px 0 0 4px",
            padding: "0.5rem 1rem",
            cursor: "pointer",
            fontWeight: categoryMode === 'subject' ? "bold" : "normal",
          }}
        >
          {language === "zh" ? "按学科分类" : "By Subject"}
        </button>
        <button
          onClick={() => setCategoryMode('page')}
          style={{
            background: categoryMode === 'page' ? "#3498db" : "#e0e0e0",
            color: categoryMode === 'page' ? "white" : "#333",
            border: "none",
            borderRadius: "0 4px 4px 0",
            padding: "0.5rem 1rem",
            cursor: "pointer",
            fontWeight: categoryMode === 'page' ? "bold" : "normal",
          }}
        >
          {language === "zh" ? "按书页分类" : "By Page"}
        </button>
      </div>
    );

    // 决定使用哪个目录数据
    const directoryToRender = categoryMode === 'subject'
      ? directoryData
      : getPageBasedDirectory(pageFilter);

    return (
      <div style={{ fontFamily: "sans-serif" }}>
        {renderCategoryToggle()}
        {renderPageFilter()}
        {Object.entries(directoryToRender as DirectoryData).map(([category, items]) => (
          <div key={category} style={{ marginBottom: "2rem" }}>
            <h3
              style={{
                color: "#2c3e50",
                borderBottom: "2px solid #3498db",
                paddingBottom: "0.5rem",
                marginBottom: "1rem",
              }}
            >
              {categoryMode === 'subject'
                ? (language === "zh" ? category : translateCategory(category))
                : (language === "zh" ? `第 ${category.replace('p', '')} 页` : `Page ${category.replace('p', '')}`)}
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {items.map((item, index) => (
                <div key={index} style={{ marginBottom: "0.5rem" }}>
                  <button
                    onClick={() => handleDirectoryItemClick(item.term)}
                    style={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: "20px",
                      padding: "0.5rem 1rem",
                      margin: "0.25rem",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                      transition: "all 0.3s ease",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 8px rgba(0,0,0,0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 4px rgba(0,0,0,0.1)";
                    }}
                  >
                    <span>{item.term}</span>
                    {categoryMode === 'subject' && item.pages.length > 0 && (
                      <span
                        style={{
                          fontSize: "12px",
                          opacity: "0.8",
                          background: "rgba(255,255,255,0.2)",
                          padding: "0.2rem 0.5rem",
                          borderRadius: "10px",
                        }}
                      >
                        {item.pages.join(", ")}
                      </span>
                    )}
                  </button>
                  {item.note && (
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#7f8c8d",
                        marginLeft: "0.5rem",
                      }}
                    >
                      ({item.note})
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  useEffect(() => {
    if (!currentTopic) return;

    // 如果是目录页面，直接显示目录内容
    if (currentTopic === "目录" || currentTopic === "Directory") {
      setIsDirectory(true);
      setContent("");
      setIsLoading(false);
      setError(null);
      setAsciiArt(null);
      setGenerationTime(null);
      return;
    }

    // 如果不是目录，设置为非目录状态
    setIsDirectory(false);

    // 检查是否有有效的 API 密钥
    if (!hasValidApiKey) {
      setError(language === "zh" ? "请先配置 DeepSeek API 密钥" : "Please configure DeepSeek API key first");
      setIsLoading(false);
      return;
    }

    // 生成缓存键，包含主题和语言
    const cacheKey = `${currentTopic}-${language}`;
    
    // 检查缓存中是否有该主题的内容
    if (contentCache[cacheKey]) {
      console.log(`从缓存加载内容: ${cacheKey}`);
      const cachedData = contentCache[cacheKey];
      setContent(cachedData.content);
      setAsciiArt(cachedData.asciiArt);
      setGenerationTime(cachedData.generationTime);
      setIsLoading(false);
      setError(null);
      setIsFromCache(true); // 标记内容来自缓存
      return;
    }
    
    // 不是从缓存加载，重置缓存标记
    setIsFromCache(false);

    let isCancelled = false;

    const fetchContentAndArt = async () => {
      // Set initial state for a clean page load
      setIsLoading(true);
      setError(null);
      setContent(""); // Clear previous content immediately
      setAsciiArt(null);
      setGenerationTime(null);
      const startTime = performance.now();

      let artData: AsciiArtData | null = null;

      // Kick off ASCII art generation, but don't wait for it.
      // It will appear when it's ready, without blocking the definition.
      generateAsciiArt(currentTopic, language)
        .then((art) => {
          if (!isCancelled) {
            artData = art;
            setAsciiArt(art);
          }
        })
        .catch((err) => {
          if (!isCancelled) {
            console.error("Failed to generate ASCII art:", err);
            // Generate a simple fallback ASCII art box on failure
            const fallbackArt = createFallbackArt(currentTopic, language);
            artData = fallbackArt;
            setAsciiArt(fallbackArt);
          }
        });

      let accumulatedContent = "";
      try {
        for await (const chunk of streamDefinition(currentTopic, language)) {
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
          setContent(""); // Ensure content is clear on error
          console.error(e);
        }
      } finally {
        if (!isCancelled) {
          const endTime = performance.now();
          const genTime = endTime - startTime;
          setGenerationTime(genTime);
          setIsLoading(false);
          
          // 将内容存入缓存
          if (accumulatedContent && !isCancelled) {
            setContentCache(prevCache => ({
              ...prevCache,
              [cacheKey]: {
                content: accumulatedContent,
                asciiArt: artData,
                generationTime: genTime
              }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTopic, language, contentCache, hasValidApiKey]);

  // 更新当前主题并添加到历史记录中的通用函数
  const updateTopicAndHistory = useCallback(
    (newTopic: string) => {
      if (newTopic && newTopic.toLowerCase() !== currentTopic.toLowerCase()) {
        // 设置新主题
        setCurrentTopic(newTopic);
        
        // 更新历史记录
        // 如果当前不是在历史记录的最后，则删除当前位置之后的所有记录
        const newHistory = history.slice(0, currentIndex + 1);
        newHistory.push(newTopic);
        setHistory(newHistory);
        setCurrentIndex(newHistory.length - 1);
      }
    },
    [currentTopic, history, currentIndex]
  );
  
  // 前进到历史记录中的下一个主题
  const handleForward = useCallback(() => {
    if (currentIndex < history.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextTopic = history[nextIndex];
      
      // 更新索引和主题
      setCurrentIndex(nextIndex);
      setCurrentTopic(nextTopic);
      
      // 如果是目录页面，设置目录状态
      if (nextTopic === "目录" || nextTopic === "Directory") {
        setIsDirectory(true);
        setContent("");
        setError(null);
        setAsciiArt(null);
        setGenerationTime(null);
      }
    }
  }, [currentIndex, history]);
  
  // 后退到历史记录中的上一个主题
  const handleBack = useCallback(() => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      const prevTopic = history[prevIndex];
      
      // 更新索引和主题
      setCurrentIndex(prevIndex);
      setCurrentTopic(prevTopic);
      
      // 如果是目录页面，设置目录状态
      if (prevTopic === "目录" || prevTopic === "Directory") {
        setIsDirectory(true);
        setContent("");
        setError(null);
        setAsciiArt(null);
        setGenerationTime(null);
      }
    }
  }, [currentIndex, history]);

  const handleWordClick = useCallback(
    (word: string) => {
      const newTopic = word.trim();
      updateTopicAndHistory(newTopic);
    },
    [updateTopicAndHistory]
  );

  const handleSearch = useCallback(
    (topic: string) => {
      const newTopic = topic.trim();
      updateTopicAndHistory(newTopic);
    },
    [updateTopicAndHistory]
  );

  const handleMultiSearch = useCallback(
    (words: string[]) => {
      console.log("handleMultiSearch called with words:", words);
      if (words.length > 0) {
        // 将选中的单词组合成一个词组，用空格连接
        const combinedTopic = words.join(" ");
        console.log("Combined topic:", combinedTopic);
        updateTopicAndHistory(combinedTopic);
      }
    },
    [updateTopicAndHistory]
  );

  const toggleMultiSelectMode = () => {
    setIsMultiSelectMode(!isMultiSelectMode);
    if (isMultiSelectMode) {
      setSelectedWords([]);
    }
  };

  const handleRandom = useCallback(() => {
    setIsLoading(true); // Disable UI immediately
    setError(null);
    setContent("");
    setAsciiArt(null);

    // 从目录数据中收集所有术语
    const allTerms: string[] = [];
    if (directoryData) {
      (Object.values(directoryData) as DirectoryItem[][]).forEach(categoryItems => {
        categoryItems.forEach(item => {
          if (item.term) {
            allTerms.push(item.term);
          }
        });
      });
    }

    // 如果没有目录项，回退到原来的UNIQUE_WORDS
    if (allTerms.length === 0) {
      const randomIndex = Math.floor(Math.random() * UNIQUE_WORDS.length);
      const randomWord = UNIQUE_WORDS[randomIndex];

      // Prevent picking the same word twice in a row
      if (randomWord.toLowerCase() === currentTopic.toLowerCase()) {
        const nextIndex = (randomIndex + 1) % UNIQUE_WORDS.length;
        updateTopicAndHistory(UNIQUE_WORDS[nextIndex]);
      } else {
        updateTopicAndHistory(randomWord);
      }
      return;
    }

    // 从目录术语中随机选择一个
    const randomIndex = Math.floor(Math.random() * allTerms.length);
    const randomTerm = allTerms[randomIndex];

    // Prevent picking the same term twice in a row
    if (randomTerm.toLowerCase() === currentTopic.toLowerCase()) {
      const nextIndex = (randomIndex + 1) % allTerms.length;
      updateTopicAndHistory(allTerms[nextIndex]);
    } else {
      updateTopicAndHistory(randomTerm);
    }
  }, [currentTopic, updateTopicAndHistory, directoryData]);

  return (
    <div>
      <SearchBar
        onSearch={handleSearch}
        onRandom={handleRandom}
        isLoading={isLoading}
      />

      <header
        style={{
          textAlign: "center",
          marginBottom: "2rem",
          position: "relative",
        }}
      >
        <button
          onClick={() => setIsApiKeyManagerOpen(true)}
          style={{
            position: "absolute",
            top: "0",
            right: "0",
            background: hasValidApiKey ? "#27ae60" : "#e74c3c",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "0.5rem 1rem",
            cursor: "pointer",
            fontSize: "0.9rem",
            fontWeight: "500",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
          title={
            hasValidApiKey
              ? language === "zh"
                ? "API 密钥已配置"
                : "API Key Configured"
              : language === "zh"
              ? "配置 API 密钥"
              : "Configure API Key"
          }
        >
          {hasValidApiKey ? "🔑" : "⚙️"}
          {hasValidApiKey
            ? language === "zh"
              ? "已配置"
              : "Configured"
            : language === "zh"
            ? "配置"
            : "Configure"}
        </button>

        <h1 style={{ letterSpacing: "0.2em", textTransform: "uppercase" }}>
          启示路
        </h1>
        <AsciiArtDisplay artData={asciiArt} topic={currentTopic} />
      </header>

      <main>
        <div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "2rem" }}>
            {/* 导航按钮 */}
            <div style={{ display: "flex", marginRight: "1rem" }}>
              <button
                onClick={handleBack}
                disabled={currentIndex <= 0}
                style={{
                  background: currentIndex <= 0 ? "#e0e0e0" : "#3498db",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  padding: "0.5rem",
                  marginRight: "0.5rem",
                  cursor: currentIndex <= 0 ? "not-allowed" : "pointer",
                  opacity: currentIndex <= 0 ? 0.5 : 1,
                  transition: "all 0.3s ease",
                }}
                title={language === "zh" ? "返回" : "Back"}
              >
                <FaArrowLeft />
              </button>
              <button
                onClick={handleForward}
                disabled={currentIndex >= history.length - 1}
                style={{
                  background: currentIndex >= history.length - 1 ? "#e0e0e0" : "#3498db",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  padding: "0.5rem",
                  cursor: currentIndex >= history.length - 1 ? "not-allowed" : "pointer",
                  opacity: currentIndex >= history.length - 1 ? 0.5 : 1,
                  transition: "all 0.3s ease",
                }}
                title={language === "zh" ? "前进" : "Forward"}
              >
                <FaArrowRight />
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <h2 style={{ margin: 0, textTransform: "capitalize" }}>
                {currentTopic}
              </h2>
              {isFromCache && !isDirectory && (
                <div style={{ display: "flex", alignItems: "center", marginLeft: "1rem" }}>
                  <span 
                    style={{
                      fontSize: "0.8rem",
                      padding: "0.2rem 0.5rem",
                      backgroundColor: "#27ae60",
                      color: "white",
                      borderRadius: "4px",
                      fontWeight: "bold",
                      marginRight: "0.5rem"
                    }}
                    title={language === "zh" ? "内容从缓存加载" : "Content loaded from cache"}
                  >
                    {language === "zh" ? "缓存" : "Cached"}
                  </span>
                  <button
                    onClick={() => {
                      // 清除当前主题的缓存
                      const cacheKey = `${currentTopic}-${language}`;
                      setContentCache(prevCache => {
                        const newCache = { ...prevCache };
                        delete newCache[cacheKey];
                        return newCache;
                      });
                      // 重置缓存标记
                      setIsFromCache(false);
                      // 重新加载内容
                      setCurrentTopic(prev => prev);
                    }}
                    style={{
                      fontSize: "0.7rem",
                      padding: "0.2rem 0.4rem",
                      backgroundColor: "#e74c3c",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                    title={language === "zh" ? "刷新内容" : "Refresh content"}
                  >
                    {language === "zh" ? "刷新" : "Refresh"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 语言选择器和内容显示在同一行 */}
          {!isDirectory && hasValidApiKey && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
              <LanguageSelector
                language={language}
                onLanguageChange={handleLanguageChange}
              />
              {content.length > 0 && !error && !isDirectory && (
                <ContentDisplay
                  content={content}
                  isLoading={isLoading}
                  onWordClick={handleWordClick}
                  onMultiSearch={handleMultiSearch}
                />
              )}
            </div>
          )}

          {!hasValidApiKey && (
            <div
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
                🔑{" "}
                {language === "zh" ? "需要配置 API 密钥" : "API Key Required"}
              </h3>
              <p style={{ margin: "0 0 1rem 0", fontSize: "1rem" }}>
                {language === "zh"
                  ? '请点击右上角的"配置"按钮，输入你的 DeepSeek API 密钥以开始使用应用。'
                  : 'Please click the "Configure" button in the top right corner to enter your DeepSeek API key to start using the application.'}
              </p>
              <button
                onClick={() => setIsApiKeyManagerOpen(true)}
                style={{
                  background:
                    "linear-gradient(135deg, #f39c12 0%, #e67e22 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "0.75rem 1.5rem",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "500",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                🚀 {language === "zh" ? "立即配置" : "Configure Now"}
              </button>
            </div>
          )}

          {error && (
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

          {/* 目录页面特殊显示 */}
          {isDirectory && (
            <div
              style={{
                padding: "1rem",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                border: "1px solid #e9ecef",
              }}
            >
              {renderDirectory()}
            </div>
          )}

          {/* Show skeleton loader when loading and no content is yet available */}
          {isLoading && content.length === 0 && !error && !isDirectory && (
            <LoadingSkeleton />
          )}

          {/* Show content as it streams or when it's interactive */}
          {/* {content.length > 0 && !error && !isDirectory && (
            <ContentDisplay
              content={content}
              isLoading={isLoading}
              onWordClick={handleWordClick}
              onMultiSearch={handleMultiSearch}
            />
          )} */}

          {/* Show empty state if fetch completes with no content and is not loading */}
          {!isLoading && !error && content.length === 0 && !isDirectory && (
            <div style={{ color: "#888", padding: "2rem 0" }}>
              <p>
                {language === "zh"
                  ? "无法生成内容。"
                  : "Content could not be generated."}
              </p>
            </div>
          )}
        </div>
      </main>

      <footer className="sticky-footer">
        <p className="footer-text" style={{ margin: 0 }}>
          {language === "zh" ? "按空格键停止/播放音乐" : "Press Spacebar to stop/play music"}
        </p>
      </footer>

      {/* API 密钥管理器 */}
      <ApiKeyManager
        isOpen={isApiKeyManagerOpen}
        onClose={() => setIsApiKeyManagerOpen(false)}
        onApiKeyChange={handleApiKeyChange}
      />
    </div>
  );
};

export default App;
