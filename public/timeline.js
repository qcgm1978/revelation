let timelineData = []

window.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('timelineData.json')
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    timelineData = await response.json()
    generateTimeline()
    initializeEventHandlers()
  } catch (error) {
    console.error('Error fetching timeline data:', error)
  }
})

function generateTimeline() {
  const timelineItems = document.getElementById('timelineItems')
  timelineItems.innerHTML = ''

  timelineData.forEach(yearData => {
    const yearMarker = document.createElement('div')
    yearMarker.className = 'year-marker'
    yearMarker.textContent = yearData.year
    timelineItems.appendChild(yearMarker)

    yearData.events.forEach(event => {
      const item = document.createElement('div')
      item.className = 'timeline-item'

      const date = document.createElement('div')
      date.className = 'timeline-date'
      date.textContent = event.date

      const content = document.createElement('div')
      content.className = 'timeline-content'
      content.textContent = event.content

      item.appendChild(date)
      item.appendChild(content)
      timelineItems.appendChild(item)
    })
  })
}

function initializeEventHandlers() {
  const timelineItems = document.querySelectorAll('.timeline-item')
  const totalItems = timelineItems.length

  const playBtn = document.getElementById('playBtn')
  const pauseBtn = document.getElementById('pauseBtn')
  const resetBtn = document.getElementById('resetBtn')
  const progressBar = document.getElementById('progressBar')

  let currentIndex = 0
  let isPlaying = false
  let playInterval
  const animationDelay = 1500

  function initializeTimelineVisibility() {
    timelineItems.forEach(item => {
      item.classList.add('active')
    })
  }

  function playTimeline() {
    if (currentIndex >= totalItems) {
      stopTimeline()
      return
    }

    isPlaying = true
    playBtn.disabled = true
    pauseBtn.disabled = false

    timelineItems[currentIndex].classList.add('active')

    timelineItems[currentIndex].scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest'
    })

    updateProgressBar()

    playInterval = setTimeout(() => {
      currentIndex++
      playTimeline()
    }, animationDelay)
  }

  // 在playBtn点击事件中添加postMessage通知父元素播放随机音乐
  playBtn.addEventListener('click', () => {
    if (!isPlaying) {
      // 只有当currentIndex为0时才重置时间线显示，否则从当前位置继续
      if (currentIndex === 0) {
        resetTimelineDisplay()
      }
      playTimeline()
      // 通知父元素播放随机音乐
      window.parent.postMessage({ action: 'playRandomAudio' }, '*')
    }
  })
  
  // 在pauseTimeline函数中添加postMessage通知父元素停止音乐
  function pauseTimeline() {
    isPlaying = false
    playBtn.disabled = false
    pauseBtn.disabled = true
    clearTimeout(playInterval)
    // 通知父元素停止音乐
    window.parent.postMessage({ action: 'stopAudio' }, '*')
  }
  
  // 在resetTimeline函数中添加postMessage通知父元素停止音乐
  function resetTimeline() {
    stopTimeline()
    resetTimelineDisplay()
    updateProgressBar()
    initializeTimelineVisibility()
    // 通知父元素停止音乐
    window.parent.postMessage({ action: 'stopAudio' }, '*')
  }
  
  // 在stopTimeline函数中添加postMessage通知父元素停止音乐
  function stopTimeline() {
    isPlaying = false
    playBtn.disabled = false
    pauseBtn.disabled = true
    clearTimeout(playInterval)
    // 通知父元素停止音乐
    window.parent.postMessage({ action: 'stopAudio' }, '*')
  }

  function resetTimelineDisplay() {
    currentIndex = 0
    timelineItems.forEach(item => {
      item.classList.remove('active')
    })
    clearTimeout(playInterval)
  }

  function updateProgressBar() {
    const progress = (currentIndex / totalItems) * 100
    progressBar.style.width = `${progress}%`
  }

  pauseBtn.addEventListener('click', pauseTimeline)
  resetBtn.addEventListener('click', resetTimeline)

  updateProgressBar()
  initializeTimelineVisibility()
}