import React, { useState, useEffect, useCallback } from "react";
import {
  streamDefinition,
  generateAsciiArt,
  AsciiArtData,
} from "./services/deepseekService";
import ContentDisplay from "./components/ContentDisplay";
import SearchBar from "./components/SearchBar";
import LoadingSkeleton from "./components/LoadingSkeleton";
import AsciiArtDisplay from "./components/AsciiArtDisplay";
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
 * @returns An AsciiArtData object with the generated art.
 */
const createFallbackArt = (topic: string): AsciiArtData => {
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
  const [directoryData, setDirectoryData] = useState<DirectoryData>({});

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

  // 处理目录项点击
  const handleDirectoryItemClick = (term: string) => {
    setCurrentTopic(term);
  };

  // 渲染目录内容
  const renderDirectory = () => {
    if (Object.keys(directoryData).length === 0) {
      return <div>目录加载中...</div>;
    }

    return (
      <div style={{ fontFamily: "sans-serif" }}>
        {Object.entries(directoryData).map(([category, items]) => (
          <div key={category} style={{ marginBottom: "2rem" }}>
            <h3
              style={{
                color: "#2c3e50",
                borderBottom: "2px solid #3498db",
                paddingBottom: "0.5rem",
                marginBottom: "1rem",
              }}
            >
              {category}
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
                    {item.pages.length > 0 && (
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
    if (currentTopic === "目录") {
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

    let isCancelled = false;

    const fetchContentAndArt = async () => {
      // Set initial state for a clean page load
      setIsLoading(true);
      setError(null);
      setContent(""); // Clear previous content immediately
      setAsciiArt(null);
      setGenerationTime(null);
      const startTime = performance.now();

      // Kick off ASCII art generation, but don't wait for it.
      // It will appear when it's ready, without blocking the definition.
      generateAsciiArt(currentTopic)
        .then((art) => {
          if (!isCancelled) {
            setAsciiArt(art);
          }
        })
        .catch((err) => {
          if (!isCancelled) {
            console.error("Failed to generate ASCII art:", err);
            // Generate a simple fallback ASCII art box on failure
            const fallbackArt = createFallbackArt(currentTopic);
            setAsciiArt(fallbackArt);
          }
        });

      let accumulatedContent = "";
      try {
        for await (const chunk of streamDefinition(currentTopic)) {
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
          setGenerationTime(endTime - startTime);
          setIsLoading(false);
        }
      }
    };

    fetchContentAndArt();

    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTopic]);

  const handleWordClick = useCallback(
    (word: string) => {
      const newTopic = word.trim();
      if (newTopic && newTopic.toLowerCase() !== currentTopic.toLowerCase()) {
        setCurrentTopic(newTopic);
      }
    },
    [currentTopic]
  );

  const handleSearch = useCallback(
    (topic: string) => {
      const newTopic = topic.trim();
      if (newTopic && newTopic.toLowerCase() !== currentTopic.toLowerCase()) {
        setCurrentTopic(newTopic);
      }
    },
    [currentTopic]
  );

  const handleMultiSearch = useCallback((words: string[]) => {
    console.log("handleMultiSearch called with words:", words);
    if (words.length > 0) {
      // 将选中的单词组合成一个词组，用空格连接
      const combinedTopic = words.join(" ");
      console.log("Combined topic:", combinedTopic);
      setCurrentTopic(combinedTopic);
    }
  }, []);

  const handleRandom = useCallback(() => {
    setIsLoading(true); // Disable UI immediately
    setError(null);
    setContent("");
    setAsciiArt(null);

    const randomIndex = Math.floor(Math.random() * UNIQUE_WORDS.length);
    const randomWord = UNIQUE_WORDS[randomIndex];

    // Prevent picking the same word twice in a row
    if (randomWord.toLowerCase() === currentTopic.toLowerCase()) {
      const nextIndex = (randomIndex + 1) % UNIQUE_WORDS.length;
      setCurrentTopic(UNIQUE_WORDS[nextIndex]);
    } else {
      setCurrentTopic(randomWord);
    }
  }, [currentTopic]);

  return (
    <div>
      <SearchBar
        onSearch={handleSearch}
        onRandom={handleRandom}
        isLoading={isLoading}
      />

      <header style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 style={{ letterSpacing: "0.2em", textTransform: "uppercase" }}>
          INFINITE WIKI
        </h1>
        <AsciiArtDisplay artData={asciiArt} topic={currentTopic} />
      </header>

      <main>
        <div>
          <h2 style={{ marginBottom: "2rem", textTransform: "capitalize" }}>
            {currentTopic}
          </h2>

          {error && (
            <div
              style={{
                border: "1px solid #cc0000",
                padding: "1rem",
                color: "#cc0000",
              }}
            >
              <p style={{ margin: 0 }}>An Error Occurred</p>
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
          {content.length > 0 && !error && !isDirectory && (
            <ContentDisplay
              content={content}
              isLoading={isLoading}
              onWordClick={handleWordClick}
              onMultiSearch={handleMultiSearch}
            />
          )}

          {/* Show empty state if fetch completes with no content and is not loading */}
          {!isLoading && !error && content.length === 0 && !isDirectory && (
            <div style={{ color: "#888", padding: "2rem 0" }}>
              <p>Content could not be generated.</p>
            </div>
          )}
        </div>
      </main>

      <footer className="sticky-footer">
        <p className="footer-text" style={{ margin: 0 }}>
          Infinite Wiki by{" "}
          <a
            href="https://x.com/dev_valladares"
            target="_blank"
            rel="noopener noreferrer"
          >
            Dev Valladares
          </a>{" "}
          · Generated by Gemini 2.5 Flash Lite
          {generationTime && ` · ${Math.round(generationTime)}ms`}
        </p>
      </footer>
    </div>
  );
};

export default App;
