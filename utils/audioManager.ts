import defMusic from '../public/def_music.json'
let currentAudio: HTMLAudioElement | null = null
let isPlaying = false
let isPreparing = false
let availableTracks: Array<{
  preview_url: string
  name: string
  artist: string
}> = []
let currentTrackInfo = defMusic

// 从JSON文件加载歌曲数据
const loadTracksFromJson = async () => {
  try {
    const response = await fetch('/extraction_results_data.json')
    const data = await response.json()
    // 假设JSON数据中的tracks字段包含歌曲列表
    if (data.tracks && Array.isArray(data.tracks)) {
      availableTracks = data.tracks.map((track: any) => ({
        url: track.preview_url,
        name: track.name,
        artist: track.artists
          ? track.artists.map((a: any) => a.name).join(', ')
          : '未知艺术家'
      }))
    } else if (data.track) {
      // 如果只有单个track对象
      const track = data.track
      availableTracks.push({
        url: track.preview_url,
        name: track.name,
        artist: track.artists
          ? track.artists.map((a: any) => a.name).join(', ')
          : '未知艺术家'
      })
    }
  } catch (error) {
    console.error('Failed to load tracks from JSON:', error)
  }
}

// 在init函数中调用加载函数
const audioManager = {
  // 初始化音频管理器
  init: async () => {
    await loadTracksFromJson()
    audioManager.bindSpacebarEvent()
  },

  // 创建播放器UI组件
  createPlayerComponents: () => {
    const playButton = document.createElement('button')
    playButton.id = 'playPauseButton'
    playButton.textContent = '播放'

    const randomButton = document.createElement('button')
    randomButton.id = 'randomButton'
    randomButton.textContent = '随机'

    const statusText = document.createElement('span')
    statusText.id = 'audioStatus'
    statusText.textContent = `${currentTrackInfo?.name} - ${currentTrackInfo?.artists[0]?.name}`

    // 创建弹出层函数
    const createTrackInfoPopup = (trackInfo: any) => {
      // 检查是否已存在弹出层，存在则移除
      const existingPopup = document.getElementById('trackInfoPopup')
      if (existingPopup) {
        existingPopup.remove()
      }

      // 创建弹出层容器
      const popup = document.createElement('div')
      popup.id = 'trackInfoPopup'

      // 创建关闭按钮
      const closeButton = document.createElement('button')
      closeButton.textContent = '关闭'

      // 创建信息内容
      const content = document.createElement('div')

      // 添加专辑封面图片（如果有）
      if (
        trackInfo.album &&
        trackInfo.album.images &&
        trackInfo.album.images.length > 0
      ) {
        const albumImage = document.createElement('img')
        // 选择最小尺寸的图片以获得更快的加载速度
        const smallestImage =
          trackInfo.album.images[trackInfo.album.images.length - 1]
        albumImage.src = smallestImage.url
        albumImage.alt = `${trackInfo.album.name} 专辑封面`
        albumImage.style.maxWidth = '100%'
        albumImage.style.borderRadius = '4px'
        albumImage.style.marginBottom = '15px'
        content.appendChild(albumImage)
      }

      // 歌曲名称
      const songName = document.createElement('h3')
      songName.textContent = trackInfo.name || '未知歌曲'
      content.appendChild(songName)

      // 艺术家
      if (trackInfo.artists && trackInfo.artists.length > 0) {
        const artistsText = trackInfo.artists
          .map((artist: any) => artist.name)
          .join(', ')
        const artistName = document.createElement('p')
        artistName.textContent = '艺术家: ' + artistsText
        content.appendChild(artistName)
      }

      // 专辑名称
      if (trackInfo.album && trackInfo.album.name) {
        const albumName = document.createElement('p')
        albumName.textContent = '专辑: ' + trackInfo.album.name
        content.appendChild(albumName)
      }

      // 发行日期
      if (trackInfo.album && trackInfo.album.release_date) {
        const releaseDate = document.createElement('p')
        releaseDate.textContent = '发行日期: ' + trackInfo.album.release_date
        content.appendChild(releaseDate)
      }

      // 歌曲时长
      if (trackInfo.duration_ms) {
        const minutes = Math.floor(trackInfo.duration_ms / 60000)
        const seconds = Math.floor((trackInfo.duration_ms % 60000) / 1000)
        const durationStr = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
        const duration = document.createElement('p')
        duration.textContent = '时长: ' + durationStr
        content.appendChild(duration)
      }

      // 流行度
      if (trackInfo.popularity !== undefined) {
        const popularity = document.createElement('p')
        popularity.textContent = '流行度: ' + trackInfo.popularity + '/100'
        content.appendChild(popularity)
      }

      // 音频URL（如果有）
      if (trackInfo.external_urls?.spotify) {
        const spotifyLink = document.createElement('a')
        spotifyLink.href = trackInfo.external_urls.spotify
        spotifyLink.textContent = '在Spotify上打开'
        spotifyLink.className = 'url-info'
        spotifyLink.target = '_blank'
        spotifyLink.rel = 'noopener noreferrer'
        content.appendChild(spotifyLink)
      }

      // 组装内容
      popup.appendChild(closeButton)
      popup.appendChild(content)

      // 添加关闭事件
      closeButton.addEventListener('click', () => {
        popup.remove()
      })

      // 点击弹出层外部关闭
      popup.addEventListener('click', e => {
        if (e.target === popup) {
          popup.remove()
        }
      })

      document.body.appendChild(popup)
    }

    // 添加点击事件
    statusText.addEventListener('click', () => {
      if (currentTrackInfo) {
        createTrackInfoPopup(currentTrackInfo)
      }
    })

    playButton.addEventListener('click', () => {
      if (isPlaying) {
        audioManager.stopAudio()
      } else {
        audioManager.toggleAudio(currentTrackInfo)
      }
    })

    randomButton.addEventListener('click', () => {
      if (availableTracks.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableTracks.length)
        const randomTrack = availableTracks[randomIndex]
        audioManager.toggleAudio(randomTrack)
      }
    })

    return { playButton, randomButton, statusText }
  },

  // 将播放器UI添加到指定容器
  addPlayerToContainer: (container: HTMLElement) => {
    if (!container) return

    // 清除容器内已有的播放器组件
    const existingPlayer = container.querySelector('#audioPlayer')
    if (existingPlayer) {
      container.removeChild(existingPlayer)
    }

    // 设置容器样式
    container.id = 'audioPlayerContainer'
    container.style.display = 'flex'
    container.style.justifyContent = 'center'
    container.style.alignItems = 'center'
    container.style.padding = '10px 0'

    const { playButton, randomButton, statusText } =
      audioManager.createPlayerComponents()

    const playerDiv = document.createElement('div')
    playerDiv.id = 'audioPlayer'
    playerDiv.style.display = 'flex'
    playerDiv.style.alignItems = 'center'
    playerDiv.style.gap = '10px'
    playerDiv.style.flexWrap = 'nowrap'
    playerDiv.style.justifyContent = 'center'

    playerDiv.appendChild(playButton)
    playerDiv.appendChild(randomButton)
    playerDiv.appendChild(statusText)

    container.appendChild(playerDiv)
  },

  // 更新播放器UI状态
  updatePlayerUI: () => {
    const playButton = document.getElementById(
      'playPauseButton'
    ) as HTMLButtonElement
    const statusText = document.getElementById('audioStatus') as HTMLSpanElement

    if (playButton && statusText) {
      if (isPlaying) {
        playButton.textContent = '暂停'
        playButton.classList.add('pause')
        // 显示歌曲和艺术家信息
        if (currentTrackInfo) {
          statusText.textContent = `${currentTrackInfo.artists[0]?.name}-${currentTrackInfo.name}`
        } else {
          statusText.textContent = '音乐播放中'
        }
      } else {
        playButton.textContent = '播放'
        playButton.classList.remove('pause')
        if (currentTrackInfo) {
          statusText.textContent = `${currentTrackInfo.artists[0]?.name} - ${currentTrackInfo.name}`
        } else {
          statusText.textContent = currentTrackInfo
            ? '音乐已暂停'
            : '音乐已停止'
        }
      }
    }
  },

  // 绑定空格键事件
  bindSpacebarEvent: () => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        // 检查当前活动元素是否是搜索框
        const activeElement = document.activeElement
        if (
          !(
            activeElement &&
            activeElement.tagName === 'INPUT' &&
            activeElement.type === 'text'
          )
        ) {
          e.preventDefault()
          if (isPlaying) {
            audioManager.stopAudio()
          } else {
            audioManager.toggleAudio(currentTrackInfo)
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeydown)

    // 清理函数
    return () => {
      document.removeEventListener('keydown', handleKeydown)
    }
  },

  // 设置可用的音频轨道列表
  setAvailableTracks: (
    tracks: Array<{ url: string; name: string; artist: string }>
  ) => {
    availableTracks = tracks
  },

  toggleAudio: trackInfo => {
    // 如果正在准备播放，不执行任何操作
    if (isPreparing) return

    // 停止当前播放的音频
    if (currentAudio) {
      currentAudio.pause()
      currentAudio = null
      isPlaying = false
    }

    // 播放新音频
    if (trackInfo?.preview_url) {
      isPreparing = true
      currentAudio = new Audio(trackInfo.preview_url)
      currentAudio.loop = true
      currentTrackInfo = trackInfo
      currentAudio
        .play()
        .then(() => {
          isPlaying = true
          audioManager.updatePlayerUI()
        })
        .catch(error => {
          console.error('Failed to play audio:', error)
          currentAudio = null
          audioManager.updatePlayerUI()
        })
        .finally(() => {
          isPreparing = false
        })
    } else if (trackInfo) {
      // 如果没有提供新的URL但有当前URL，则切换播放状态
      if (isPlaying) {
        audioManager.stopAudio()
      } else {
        audioManager.toggleAudio(trackInfo)
      }
    }
  },

  // 修改stopAudio函数，清除当前歌曲信息
  stopAudio: () => {
    // 如果正在准备播放，等待准备完成后再停止
    if (isPreparing) {
      setTimeout(() => audioManager.stopAudio(), 100)
      return
    }

    if (currentAudio) {
      currentAudio.pause()
      currentAudio = null
      isPlaying = false
      audioManager.updatePlayerUI()
    }
  },

  // 检查音频是否正在播放
  isAudioPlaying: () => isPlaying,

  // 播放指定词条的音频
  playTermAudio: (
    url?: string,
    trackInfo?: { name: string; artist: string }
  ) => {
    if (url) {
      audioManager.toggleAudio(trackInfo)
    }
  }
}

export default audioManager
