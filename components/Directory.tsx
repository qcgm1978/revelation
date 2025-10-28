// @ts-nocheck
import { useState, useEffect } from "react";
import { DirectoryData } from "../types/directory";
import audioManager from "../utils/audioManager";
import { stopSpeaking } from "../utils/ttsAdapter";
import { versionInfo } from "../config";
import {
  CategoryTabs,
  SubjectTabs,
  PageFilter,
  AudioControl,
  DirectoryItemsRenderer,
  getPageBasedDirectory,
} from "./DirectoryUtils";
import TimelineVisualization from "./TimelineVisualization";

interface DirectoryProps {
  directoryData: DirectoryData;
  onItemClick: (term: string, pageInfo?: string[] | string) => void;
  language: "zh" | "en";
  currentTopic?: string;
  currentBookTitle: string | null;
}

const Directory: React.FC<DirectoryProps> = ({
  directoryData,
  language,
  currentTopic,
  onItemClick,
  currentBookTitle,
}) => {
  const [categoryMode, setCategoryMode] = useState<
    "subject" | "page" | "timeline"
  >(() => {
    const cachedState = localStorage.getItem("directoryState");
    if (cachedState) {
      try {
        const parsedState = JSON.parse(cachedState);
        return parsedState.categoryMode || "subject";
      } catch (e) {
        console.error("Failed to parse cached directory state", e);
      }
    }
    return "subject";
  });
  const [pageFilter, setPageFilter] = useState<string>(() => {
    const cachedState = localStorage.getItem("directoryState");
    if (cachedState) {
      try {
        const parsedState = JSON.parse(cachedState);
        return parsedState.pageFilter || "";
      } catch (e) {
        console.error("Failed to parse cached directory state", e);
      }
    }
    return "";
  });
  const [selectedSubject, setSelectedSubject] = useState<string>(() => {
    const cachedState = localStorage.getItem("directoryState");
    if (cachedState) {
      try {
        const parsedState = JSON.parse(cachedState);
        return parsedState.selectedSubject || "";
      } catch (e) {
        console.error("Failed to parse cached directory state", e);
      }
    }
    return "";
  });

  useEffect(() => {
    audioManager.stopAudio();
    stopSpeaking();

    return () => {
      if (currentTopic !== "目录" && currentTopic !== "Directory") {
        audioManager.stopAudio();
        stopSpeaking();
      }
    };
  }, [currentTopic]);

  useEffect(() => {
    const handleStateUpdate = (event: Event) => {
      if (event.type === "directoryStateUpdated") {
        const { detail } = event as CustomEvent<{
          categoryMode: "subject" | "page";
          pageFilter: string;
          selectedSubject: string;
        }>;
        setCategoryMode(detail.categoryMode);
        setPageFilter(detail.pageFilter);
        setSelectedSubject(detail.selectedSubject);
      }
    };

    document.addEventListener("directoryStateUpdated", handleStateUpdate);

    return () => {
      document.removeEventListener("directoryStateUpdated", handleStateUpdate);
    };
  }, []);

  useEffect(() => {
    const stateToCache = {
      categoryMode,
      pageFilter,
      selectedSubject,
    };
    localStorage.setItem("directoryState", JSON.stringify(stateToCache));
    document.dispatchEvent(
      new CustomEvent("updateDirectoryCache", {
        detail: stateToCache,
      })
    );
  }, [categoryMode, pageFilter, selectedSubject]);

  useEffect(() => {
    if (categoryMode === "subject" && Object.keys(directoryData).length > 0) {
      const isValidSubject =
        selectedSubject && Object.keys(directoryData).includes(selectedSubject);

      if (!isValidSubject) {
        setSelectedSubject(Object.keys(directoryData)[0]);
      }
    }
  }, [categoryMode, directoryData, selectedSubject]);

  const directoryToRender =
    categoryMode === "subject"
      ? directoryData
      : categoryMode === "page"
      ? getPageBasedDirectory(directoryData, pageFilter)
      : {};

  const filteredDirectory = Object.entries(
    directoryToRender as DirectoryData
  ).reduce((acc, [category, items]) => {
    const processedItems = items.map((item) => ({
      ...item,
      pages: item.pages || [],
    }));
    acc[category] = processedItems;
    return acc;
  }, {} as DirectoryData);

  return (
    <div id="directory-container">
      <CategoryTabs
        categoryMode={categoryMode}
        setCategoryMode={setCategoryMode}
        directoryData={directoryData}
        setSelectedSubject={setSelectedSubject}
        language={language}
        currentBookTitle={currentBookTitle}
      />
      <SubjectTabs
        categoryMode={categoryMode}
        directoryData={directoryData}
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        language={language}
      />
      {categoryMode === "page" && (
        <div
          style={{
            textAlign: "center",
            margin: "0.5rem",
            color: "#666",
            fontSize: "14px",
            fontStyle: "italic",
          }}
        >
          {versionInfo[language]}
        </div>
      )}
      {categoryMode === "page" && (
        <PageFilter
          pageFilter={pageFilter}
          setPageFilter={setPageFilter}
          language={language}
        />
      )}

      <AudioControl />

      {/* Tab内容区域 */}
      <div
        style={{
          animation: "fadeIn 0.5s ease-in-out",
          minHeight: "300px",
        }}
      >
        {categoryMode === "timeline" ? (
          <div
            id="timeline-container"
            style={{ width: "100%", height: "100%" }}
          >
            <TimelineVisualization language={language} />
          </div>
        ) : (
          <DirectoryItemsRenderer
            filteredDirectory={filteredDirectory}
            categoryMode={categoryMode}
            selectedSubject={selectedSubject}
            onItemClick={onItemClick}
            language={language}
            currentBookTitle={currentBookTitle}
          />
        )}
      </div>
    </div>
  );
};

export default Directory;
