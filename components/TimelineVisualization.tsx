// @ts-ignore
import { useState, useEffect, useRef } from 'react'
import audioManager from '../utils/audioManager'
import { timelineConfig } from '../config'

// 定义更灵活的时间线数据类型
interface TimelineYear {
  [key: string]: any;
}

// 动态导入timeline数据模块
let gemTimelineData: any = null;
let novelTimelineData: any = null;

// 条件导入gem-timeline-data模块
const importTimelineData = async (): Promise<boolean> => {
  try {
    // 使用动态导入，这样只有在需要时才会加载这个包
    const dataModule = await import('gem-timeline-data');
    gemTimelineData = dataModule.gemTimelineData;
    novelTimelineData = dataModule.novelTimelineData;
    console.log('Timeline data module imported successfully');
    return true;
  } catch (error) {
    console.error('Failed to import timeline data module:', error);
    return false;
  }
};

// 从JSON文件获取timeline数据
const fetchTimelineData = async (jsonPath: string): Promise<any[] | null> => {
  try {
    // 尝试直接路径（适合开发环境）
    let response = await fetch(jsonPath);
    
    // 如果直接路径失败，尝试添加public前缀（作为后备）
    if (!response.ok) {
      console.warn(`Failed to load ${jsonPath}, trying with /public prefix`);
      response = await fetch(`/public/${jsonPath}`);
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Timeline data loaded from ${jsonPath}`);
    return Array.isArray(data) ? data : null;
  } catch (error) {
    console.error(`Error fetching timeline data from ${jsonPath}:`, error);
    return null;
  }
};
const TimelineVisualization: React.FC<{ language: 'zh' | 'en' }> = ({ language }) => {
  // 初始音频URL使用配置中的值，添加空值检查
  const [audioUrl, setAudioUrl] = useState<string>(
    timelineConfig.sources.novel?.audioUrl || ''
  )
  // 使用更灵活的类型以适应实际数据结构
  const [timelineData, setTimelineData] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)
  const [activeItems, setActiveItems] = useState<number[]>([])
  const [timelineModuleLoaded, setTimelineModuleLoaded] = useState<boolean>(false)

  const playInterval = useRef<NodeJS.Timeout | null>(null)
  const timelineAudio = useRef<HTMLAudioElement | null>(null)
  const timelineItemsRef = useRef<(HTMLDivElement | null)[]>([])
  
  // 使用配置中的动画延迟
  const animationDelay = timelineConfig.animationDelay

  // 初始化：加载模块和默认时间线数据
  useEffect(() => {
    const initialize = async () => {
      // 加载timeline数据模块
      const moduleImported = await importTimelineData();
      setTimelineModuleLoaded(moduleImported);
      
      // 即使模块加载失败，也尝试加载默认时间线数据
      // 它可能从JSON文件获取
      await loadTimelineData(timelineConfig.defaultType);
      
      resetTimelineDisplay();
    };
    
    initialize();
  }, []);

  useEffect(() => {
    if (timelineData.length > 0) {
      initializeTimelineVisibility();
    }
  }, [timelineData]);
  
  // 根据类型加载时间线数据
  const loadTimelineData = async (type: string) => {
    const sourceConfig = timelineConfig.sources[type];
    if (!sourceConfig) {
      console.error(`Timeline source configuration not found for type: ${type}`);
      return;
    }
    
    try {
      let data = null;
      
      // 首先尝试使用包数据（如果配置了并且模块已加载）
      if (sourceConfig.usePackageData) {
        if (type === 'gem' && gemTimelineData) {
          data = gemTimelineData;
        } else if (type === 'novel' && novelTimelineData) {
          data = novelTimelineData;
        }
      }
      
      // 如果没有包数据或者失败，尝试从JSON文件加载
      if (!data && sourceConfig.jsonPath) {
        data = await fetchTimelineData(sourceConfig.jsonPath);
      }
      
      // 如果成功加载了数据，更新状态
      if (data && Array.isArray(data) && data.length > 0) {
        setTimelineData(data);
        setAudioUrl(sourceConfig.audioUrl);
      } else {
        console.warn(`Failed to load timeline data for type: ${type}`);
        // 尝试使用默认后备数据
        if (novelTimelineData && Array.isArray(novelTimelineData) && novelTimelineData.length > 0) {
          setTimelineData(novelTimelineData);
          setAudioUrl(timelineConfig.sources.novel?.audioUrl || '');
        }
      }
    } catch (error) {
      console.error(`Error loading timeline data for type ${type}:`, error);
    }
  };

  const handleTimelineChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    await loadTimelineData(selectedValue);
    stopAudio();
  }

  const initializeTimelineVisibility = () => {
    const totalItems = timelineData.reduce(
      (acc, yearData) => acc + yearData.events.length,
      0
    )
    const allIndices = Array.from({ length: totalItems }, (_, i) => i)
    setActiveItems(allIndices)
  }

  const playTimeline = () => {
    if (currentIndex >= getTotalItems() || isPlaying) return

    setIsPlaying(true)
    setActiveItems([])

    const updateTimeline = (index: number) => {
      if (index >= getTotalItems()) {
        stopTimeline()
        return
      }

      setActiveItems(prev => [...prev, index])
      scrollToElement(timelineItemsRef.current[index])

      playInterval.current = setTimeout(() => {
        const nextIndex = index + 1
        updateTimeline(nextIndex)
      }, animationDelay)
    }

    updateTimeline(currentIndex)
    startAudio()
  }

  const resetTimeline = () => {
    stopTimeline()
    resetTimelineDisplay()
    setTimeout(() => {
      initializeTimelineVisibility()
    }, 0)
    audioManager.stopAudio()
    stopAudio()
  }

  const scrollToElement = (element: HTMLDivElement | null) => {
    if (!element) return

    const isAndroid = navigator.userAgent.toLowerCase().indexOf('android') > -1

    if (isAndroid) {
      const elementRect = element.getBoundingClientRect()
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollLeft =
        window.pageXOffset || document.documentElement.scrollLeft
      const targetTop = elementRect.top + scrollTop - 400

      window.scrollTo({
        top: targetTop,
        left: scrollLeft,
        behavior: 'auto'
      })

      element.offsetHeight
    } else {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      })
    }
  }

  const pauseTimeline = () => {
    setIsPlaying(false)
    if (playInterval.current) {
      clearTimeout(playInterval.current)
      playInterval.current = null
    }
    audioManager.stopAudio()
    stopAudio()
  }

  const stopTimeline = () => {
    setIsPlaying(false)
    if (playInterval.current) {
      clearTimeout(playInterval.current)
      playInterval.current = null
    }
    audioManager.stopAudio()
    stopAudio()
  }

  const resetTimelineDisplay = () => {
    setCurrentIndex(0)
    setActiveItems([])
    setProgress(0)
    if (playInterval.current) {
      clearTimeout(playInterval.current)
      playInterval.current = null
    }
  }

  const updateProgressBar = (index: number) => {
    const total = getTotalItems()
    const newProgress = total > 0 ? (index / total) * 100 : 0
    setProgress(newProgress)
  }

  const getTotalItems = () => {
    return timelineData.reduce(
      (acc, yearData) => acc + yearData.events.length,
      0
    )
  }

  const startAudio = () => {
    if (timelineAudio.current) {
      timelineAudio.current.pause()
    }
    timelineAudio.current = new Audio(audioUrl)
    timelineAudio.current.loop = true
    // 使用配置中的音量
    timelineAudio.current.volume = timelineConfig.audioVolume
    timelineAudio.current.play().catch(e => {
      console.log('Audio autoplay prevented:', e)
    })
  }

  const stopAudio = () => {
    if (timelineAudio.current) {
      timelineAudio.current.pause()
      timelineAudio.current = null
    }
  }

  const registerItemRef = (el: HTMLDivElement | null, index: number) => {
    timelineItemsRef.current[index] = el
  }

  return (
    <div className='timeline-container'>
      {/* <div className='progress-container'>
        <div className='progress-bar' style={{ width: `${progress}%` }} />
      </div> */}

      <div className='controls'>
        <select
          id='timelineSelector'
          onChange={handleTimelineChange}
          defaultValue={timelineConfig.defaultType}
        >
          {Object.entries(timelineConfig.sources).map(([key, source]) => (
            <option key={key} value={key}>
              {source.name[language] || key}
            </option>
          ))}
        </select>
        <button id='playBtn' onClick={playTimeline} disabled={isPlaying}>
          {language === 'zh' ? '播放' : 'Play'}
        </button>
        <button id='pauseBtn' onClick={pauseTimeline} disabled={!isPlaying}>
          {language === 'zh' ? '暂停' : 'Pause'}
        </button>
        <button id='resetBtn' onClick={resetTimeline}>
          {language === 'zh' ? '重置' : 'Reset'}
        </button>
      </div>

      <div className='timeline'>
        <div className='timeline-line'></div>
        <div className='timeline-items'>
          {timelineData.flatMap((yearData, yearIndex) => [
            <div key={`year-${yearIndex}`} className='year-marker'>
              {yearData.year}
            </div>,
            ...yearData.events.map((event, eventLocalIndex) => {
              const globalIndex =
                timelineData
                  .slice(0, yearIndex)
                  .reduce((acc, year) => acc + year.events.length, 0) +
                eventLocalIndex
              const isActive = activeItems.includes(globalIndex)

              return (
                <div
                  key={`event-${yearIndex}-${eventLocalIndex}`}
                  className={`timeline-item ${isActive ? 'active' : ''}`}
                  ref={el => registerItemRef(el, globalIndex)}
                >
                  <div className='timeline-date'>{event.date}</div>
                  <div className='timeline-content'>{event.content}</div>
                </div>
              )
            })
          ])}
        </div>
      </div>
    </div>
  )
}

export default TimelineVisualization
