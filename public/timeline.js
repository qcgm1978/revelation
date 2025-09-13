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

function generateTimeline () {
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

function initializeEventHandlers () {
  const timelineItems = document.querySelectorAll('.timeline-item')
  const totalItems = timelineItems.length

  const playBtn = document.getElementById('playBtn')
  const pauseBtn = document.getElementById('pauseBtn')
  const resetBtn = document.getElementById('resetBtn')
  const progressBar = document.getElementById('progressBar')

  let currentIndex = 0
  let isPlaying = false
  let playInterval
  const animationDelay = 3000

  function initializeTimelineVisibility () {
    timelineItems.forEach(item => {
      item.classList.add('active')
    })
  }

  function playTimeline () {
    if (currentIndex >= totalItems) {
      stopTimeline()
      return
    }

    isPlaying = true
    playBtn.disabled = true
    pauseBtn.disabled = false

    timelineItems[currentIndex].classList.add('active')

    // 修复Android WebView中的滚动问题
    scrollToElement(timelineItems[currentIndex])

    updateProgressBar()

    playInterval = setTimeout(() => {
      currentIndex++
      playTimeline()
    }, animationDelay)
  }

  // 跨平台兼容的滚动函数
  function scrollToElement (element) {
    if (element) {
      // 检查是否在Android环境中
      const isAndroid =
        navigator.userAgent.toLowerCase().indexOf('android') > -1

      if (isAndroid) {
        // 对于Android，使用更基础的滚动方法
        const elementRect = element.getBoundingClientRect()
        const scrollTop =
          window.pageYOffset || document.documentElement.scrollTop
        const scrollLeft =
          window.pageXOffset || document.documentElement.scrollLeft
        const targetTop = elementRect.top + scrollTop - 400

        // 禁用平滑滚动，直接设置位置
        window.scrollTo({
          top: targetTop,
          left: scrollLeft,
          behavior: 'auto' // 使用auto而不是smooth
        })

        // 强制重绘
        element.offsetHeight
      } else {
        // 非Android环境保持原有的平滑滚动
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        })
      }
    }
  }

  playBtn.addEventListener('click', () => {
    if (!isPlaying) {
      if (currentIndex === 0) {
        resetTimelineDisplay()
      }
      playTimeline()
      window.parent.postMessage({ action: 'playRandomAudio' }, '*')
    }
    if (!isInIframe()) {
      const controls = document.querySelector('.controls')
      if (controls) {
        controls.style.display = 'none'
        const audio = new Audio(
          'https://p.scdn.co/mp3-preview/775fb3a76182997499309b0868a003528391da8e'
        )
        audio.loop = true
        audio.volume = 0.3
        audio.play().catch(e => {
          console.log('Audio autoplay prevented:', e)
        })
      }
    }
  })
  function isInIframe () {
    try {
      return window.self !== window.top
    } catch (e) {
      return true
    }
  }
  function pauseTimeline () {
    isPlaying = false
    playBtn.disabled = false
    pauseBtn.disabled = true
    clearTimeout(playInterval)
    window.parent.postMessage({ action: 'stopAudio' }, '*')
  }

  function resetTimeline () {
    stopTimeline()
    resetTimelineDisplay()
    updateProgressBar()
    initializeTimelineVisibility()
    window.parent.postMessage({ action: 'stopAudio' }, '*')
  }

  function stopTimeline () {
    isPlaying = false
    playBtn.disabled = false
    pauseBtn.disabled = true
    clearTimeout(playInterval)
    window.parent.postMessage({ action: 'stopAudio' }, '*')
  }

  function resetTimelineDisplay () {
    currentIndex = 0
    timelineItems.forEach(item => {
      item.classList.remove('active')
    })
    clearTimeout(playInterval)
  }

  function updateProgressBar () {
    const progress = (currentIndex / totalItems) * 100
    progressBar.style.width = `${progress}%`
  }

  pauseBtn.addEventListener('click', pauseTimeline)
  resetBtn.addEventListener('click', resetTimeline)

  updateProgressBar()
  initializeTimelineVisibility()
}
