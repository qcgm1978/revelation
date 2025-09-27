import { useState, useEffect, useRef } from 'react'
import audioManager from '../utils/audioManager'

interface TimelineData {
  year: string
  events: {
    date: string
    content: string
  }[]
}

const TimelineVisualization: React.FC = () => {
  const [jsonName, setJsonName] = useState<string>('timelineData.json')
  const [audioUrl, setAudioUrl] = useState<string>(
    'https://p.scdn.co/mp3-preview/775fb3a76182997499309b0868a003528391da8e'
  )
  const [timelineData, setTimelineData] = useState<TimelineData[]>([])
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)
  const [activeItems, setActiveItems] = useState<number[]>([])

  const playInterval = useRef<NodeJS.Timeout | null>(null)
  const timelineAudio = useRef<HTMLAudioElement | null>(null)
  const timelineItemsRef = useRef<(HTMLDivElement | null)[]>([])
  const animationDelay = 3000

  useEffect(() => {
    loadTimelineData()
  }, [jsonName])

  useEffect(() => {
    if (timelineData.length > 0) {
      initializeTimelineVisibility()
    }
  }, [timelineData])

  const loadTimelineData = async () => {
    try {
      const response = await fetch(jsonName)
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data = await response.json()
      setTimelineData(data)
      resetTimelineDisplay()
    } catch (error) {
      console.error('Error fetching timeline data:', error)
    }
  }

  const handleTimelineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value
    if (selectedValue === 'novel') {
      setJsonName('timelineData.json')
      setAudioUrl(
        'https://p.scdn.co/mp3-preview/775fb3a76182997499309b0868a003528391da8e'
      )
    } else if (selectedValue === 'gem') {
      setJsonName('gem.json')
      setAudioUrl('All About You-G.E.M.邓紫棋.mp3')
    }
    stopAudio()
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
    // 开始播放时先清空所有活动项
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
    // 重置后重新初始化，显示所有元素
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
    timelineAudio.current.volume = 0.3
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
          defaultValue='novel'
        >
          <option value='novel'>小说时间线</option>
          <option value='gem'>邓紫棋时间线</option>
        </select>
        <button id='playBtn' onClick={playTimeline} disabled={isPlaying}>
          播放
        </button>
        <button id='pauseBtn' onClick={pauseTimeline} disabled={!isPlaying}>
          暂停
        </button>
        <button id='resetBtn' onClick={resetTimeline}>
          重置
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
