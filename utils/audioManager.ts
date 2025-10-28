import { Browser } from '@capacitor/browser'
import { setPopupOpen } from './gestureHandler' 
import { loadData } from '../services/dataService'
import { timelineConfig } from '../config'

let currentAudio: HTMLAudioElement | null = null
let isPlaying = false
let isPreparing = false
let availableTracks = []
let currentTrackInfo = {
  name: '金刚经',
  artists: [{ name: '王菲' }],
  preview_url: `/${timelineConfig.sources.json.audioUrl}`
}
let currentLanguage: 'zh' | 'en' = 'zh'

const loadTracksFromJson = async () => {
  try {
    const data = await loadData()
    if (data.tracks && Array.isArray(data.tracks)) {
      availableTracks = data.tracks.map((track: any) => ({
        url: track.preview_url,
        name: track.name,
        artist: track.artists
          ? track.artists.map((a: any) => a.name).join(', ')
          : '未知艺术家'
      }))
    } else if (data.track) {
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

const audioManager = {
  init: async () => {
    await loadTracksFromJson()
    audioManager.bindSpacebarEvent()
  },

  setLanguage: (language: 'zh' | 'en') => {
    currentLanguage = language
    audioManager.updatePlayerUI()
  },

  createPlayerComponents: () => {
    const playButton = document.createElement('button')
    playButton.id = 'playPauseButton'
    playButton.textContent = currentLanguage === 'zh' ? '播放' : 'Play'

    const randomButton = document.createElement('button')
    randomButton.id = 'randomButton'
    randomButton.textContent = currentLanguage === 'zh' ? '随机' : 'Random'

    const statusText = document.createElement('span')
    statusText.id = 'audioStatus'
    statusText.textContent = `${currentTrackInfo?.name} - ${currentTrackInfo?.artists[0]?.name}`

   
    const createTrackInfoPopup = (trackInfo: any) => {
      const existingPopup = document.getElementById('trackInfoPopup')
      if (existingPopup) {
        existingPopup.remove()
         setPopupOpen(false)
      } else {
       
         setPopupOpen(true)
      }

      const popup = document.createElement('div')
      popup.id = 'trackInfoPopup'

      const closeButton = document.createElement('button')
      closeButton.textContent = '关闭'
      closeButton.addEventListener('touchend', e => {
        e.stopPropagation()
        e.preventDefault()
        popup.style.transition = 'opacity 0.3s ease-out'
        popup.style.opacity = '0'
        setTimeout(() => {
          popup.remove()
          setPopupOpen(false) 
        }, 300)
      })

     
      popup.addEventListener('click', e => {
        if (e.target === popup) {
         
          popup.style.transition = 'opacity 0.3s ease-out'
          popup.style.opacity = '0'
          setTimeout(() => {
            popup.remove()
            setPopupOpen(false) 
          }, 300)
        }
      })

     
      const content = document.createElement('div')

     
      if (
        trackInfo.album &&
        trackInfo.album.images &&
        trackInfo.album.images.length > 0
      ) {
        const albumImage = document.createElement('img')
       
        const smallestImage =
          trackInfo.album.images[trackInfo.album.images.length - 1]
        albumImage.src = smallestImage.url
        albumImage.alt = `${trackInfo.album.name} 专辑封面`
        albumImage.style.maxWidth = '100%'
        albumImage.style.borderRadius = '4px'
        albumImage.style.marginBottom = '15px'
       
        albumImage.style.cursor = 'pointer'
        albumImage.addEventListener('click', () => {
         
          const overlay = document.createElement('div')
          overlay.style.position = 'fixed'
          overlay.style.top = '0'
          overlay.style.left = '0'
          overlay.style.width = '100%'
          overlay.style.height = '100%'
          overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)'
          overlay.style.zIndex = '1000'
          overlay.style.display = 'flex'
          overlay.style.alignItems = 'center'
          overlay.style.justifyContent = 'center'

         
          const largeImage = document.createElement('img')
         
          const largestImage = trackInfo.album.images[0]
          largeImage.src = largestImage.url
          largeImage.alt = albumImage.alt
          largeImage.style.maxWidth = '90%'
          largeImage.style.maxHeight = '90%'

         
          const closeButton = document.createElement('button')
          closeButton.textContent = '×'
          closeButton.style.position = 'absolute'
          closeButton.style.top = '20px'
          closeButton.style.right = '30px'
          closeButton.style.fontSize = '40px'
          closeButton.style.color = 'white'
          closeButton.style.backgroundColor = 'transparent'
          closeButton.style.border = 'none'
          closeButton.style.cursor = 'pointer'

          const closeOverlay = () => {
            document.body.removeChild(overlay)
          }

          closeButton.addEventListener('click', closeOverlay)
          overlay.addEventListener('click', e => {
            if (e.target === overlay) {
              closeOverlay()
            }
          })

          overlay.appendChild(largeImage)
          overlay.appendChild(closeButton)

         
          document.body.appendChild(overlay)
        })
        content.appendChild(albumImage)
      }

     
      const songName = document.createElement('h3')
      songName.textContent = trackInfo.name || '未知歌曲'
      content.appendChild(songName)

      if (trackInfo.artists && trackInfo.artists.length > 0) {
        const artistsText = trackInfo.artists
          .map((artist: any) => artist.name)
          .join(', ')
        const artistName = document.createElement('p')
        artistName.textContent = '艺术家: ' + artistsText

       
        if (trackInfo.artists[0]?.external_urls?.spotify) {
          artistName.style.cursor = 'pointer'
          artistName.style.textDecoration = 'underline'
          artistName.style.color = 'blue'

          const openArtistUrl = async (e: Event) => {
            e.stopPropagation()
            e.preventDefault()
            const artistSpotifyUrl = trackInfo.artists[0].external_urls.spotify
            try {
              if (typeof window !== 'undefined' && 'Capacitor' in window) {
                
                await Browser.open({
                  url: artistSpotifyUrl,
                  presentationStyle: 'fullscreen'
                })
              } else {
                
                window.open(artistSpotifyUrl, '_blank')
              }
            } catch (error) {
              console.error('无法打开Spotify应用，尝试在浏览器中打开:', error)
              if (typeof window !== 'undefined') {
                window.open(artistSpotifyUrl, '_blank')
              }
            }
          }
          
          artistName.addEventListener('touchend', openArtistUrl)
          artistName.addEventListener('mousedown', openArtistUrl)
        }

        content.appendChild(artistName)
      }

     
      if (trackInfo.album && trackInfo.album.name) {
        const albumName = document.createElement('p')
        albumName.textContent = '专辑: ' + trackInfo.album.name
        content.appendChild(albumName)
      }

     
      if (trackInfo.album && trackInfo.album.release_date) {
        const releaseDate = document.createElement('p')
        releaseDate.textContent = '发行日期: ' + trackInfo.album.release_date
        content.appendChild(releaseDate)
      }

     
      if (trackInfo.duration_ms) {
        const minutes = Math.floor(trackInfo.duration_ms / 60000)
        const seconds = Math.floor((trackInfo.duration_ms % 60000) / 1000)
        const durationStr = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
        const duration = document.createElement('p')
        duration.textContent = '时长: ' + durationStr
        content.appendChild(duration)
      }

     
      if (trackInfo.popularity !== undefined) {
        const popularity = document.createElement('p')
        popularity.textContent = '流行度: ' + trackInfo.popularity + '/100'
        content.appendChild(popularity)
      }

     
      if (trackInfo.external_urls?.spotify) {
        if (typeof window !== 'undefined' && 'Capacitor' in window) {
          const spotifyLink = document.createElement('button')
          spotifyLink.textContent = '在Spotify应用中打开'
          spotifyLink.className = 'url-info'
          spotifyLink.addEventListener('touchend', async e => {
            e.stopPropagation()
            e.preventDefault()
            try {
             
              await Browser.open({
                url: trackInfo.external_urls!.spotify,
                presentationStyle: 'fullscreen'
              })
            } catch (error) {
              console.error('无法打开Spotify应用，尝试在浏览器中打开:', error)
              window.open(trackInfo.external_urls!.spotify, '_blank')
            }
          })
          content.appendChild(spotifyLink)
        } else {
         
          const spotifyLink = document.createElement('a')
          spotifyLink.href = trackInfo.external_urls.spotify
          spotifyLink.textContent = '在Spotify上打开'
          spotifyLink.className = 'url-info'
          spotifyLink.target = '_blank'
          spotifyLink.rel = 'noopener noreferrer'
          content.appendChild(spotifyLink)
        }
      }

     
      popup.appendChild(closeButton)
      popup.appendChild(content)

      closeButton.addEventListener('touchend', () => {
        popup.remove()
      })

      popup.addEventListener('click', e => {
        if (e.target === popup) {
          popup.remove()
        }
      })

      document.body.appendChild(popup)
    }

   
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

 
  addPlayerToContainer: (container: HTMLElement) => {
    if (!container) return

   
    const existingPlayer = container.querySelector('#audioPlayer')
    if (existingPlayer) {
      container.removeChild(existingPlayer)
    }

   
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

 
  updatePlayerUI: () => {
    const playButton = document.getElementById(
      'playPauseButton'
    ) as HTMLButtonElement
    const randomButton = document.getElementById(
      'randomButton'
    ) as HTMLButtonElement
    const statusText = document.getElementById('audioStatus') as HTMLSpanElement

    if (playButton && statusText) {
      if (isPlaying) {
        playButton.textContent = currentLanguage === 'zh' ? '暂停' : 'Pause'
        playButton.classList.add('pause')
        if (currentTrackInfo) {
          statusText.textContent = `${currentTrackInfo.artists[0]?.name}-${currentTrackInfo.name}`
        } else {
          statusText.textContent = currentLanguage === 'zh' ? '音乐播放中' : 'Playing'
        }
      } else {
        playButton.textContent = currentLanguage === 'zh' ? '播放' : 'Play'
        playButton.classList.remove('pause')
        if (randomButton) {
          randomButton.textContent = currentLanguage === 'zh' ? '随机' : 'Random'
        }
        if (currentTrackInfo) {
          statusText.textContent = `${currentTrackInfo.artists[0]?.name} - ${currentTrackInfo.name}`
        } else {
          statusText.textContent = currentTrackInfo
            ? (currentLanguage === 'zh' ? '音乐已暂停' : 'Paused')
            : (currentLanguage === 'zh' ? '音乐已停止' : 'Stopped')
        }
      }
    }
  },

 
  bindSpacebarEvent: () => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
       
        const activeElement = document.activeElement
        if (
          !(
            activeElement &&
            activeElement.tagName === 'INPUT' &&
            (activeElement as HTMLInputElement).type === 'text'
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

   
    return () => {
      document.removeEventListener('keydown', handleKeydown)
    }
  },

 
  setAvailableTracks: (
    tracks: Array<{ url: string; name: string; artist: string }>
  ) => {
    availableTracks = tracks
  },

  toggleAudio: (trackInfo, isLoop = false) => {
   
    if (isPreparing) return

   
    if (currentAudio) {
      currentAudio.pause()
      currentAudio = null
      isPlaying = false
    }

   
    if (trackInfo?.preview_url) {
      isPreparing = true
      currentAudio = new Audio(trackInfo.preview_url)
      if (isLoop) {
        currentAudio.loop = true
      } else {
        currentAudio.loop = false
      }
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
     
      if (isPlaying) {
        audioManager.stopAudio()
      } else {
        audioManager.toggleAudio(trackInfo)
      }
    }
  },

 
  stopAudio: () => {
   
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

 
  isAudioPlaying: () => isPlaying,

 
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
