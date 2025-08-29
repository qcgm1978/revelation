let currentAudio: HTMLAudioElement | null = null;
let isPlaying = false;
let isPreparing = false;
let currentTrackUrl: string | null = null;
let availableTracks: string[] = [];
// 添加当前歌曲信息
let currentTrackInfo: { name: string; artist: string } | null = {
  name: '天空没有極限 (粤)',
  artist: '邓紫棋',
};

// 默认背景音乐URL
const DEFAULT_BACKGROUND_MUSIC = 'https://p.scdn.co/mp3-preview/775fb3a76182997499309b0868a003528391da8e';

const audioManager = {
  // 初始化音频管理器
  init: () => {
    audioManager.bindSpacebarEvent();
  },


  // 创建播放器UI组件
  createPlayerComponents: () => {
    const playButton = document.createElement('button');
    playButton.id = 'playPauseButton';
    playButton.textContent = '播放';
    playButton.style.backgroundColor = '#27ae60';
    playButton.style.color = 'white';
    playButton.style.border = 'none';
    playButton.style.borderRadius = '3px';
    playButton.style.padding = '5px 10px';
    playButton.style.cursor = 'pointer';
    playButton.style.fontSize = '12px';

    const randomButton = document.createElement('button');
    randomButton.id = 'randomButton';
    randomButton.textContent = '随机';
    randomButton.style.backgroundColor = '#3498db';
    randomButton.style.color = 'white';
    randomButton.style.border = 'none';
    randomButton.style.borderRadius = '3px';
    randomButton.style.padding = '5px 10px';
    randomButton.style.cursor = 'pointer';
    randomButton.style.fontSize = '12px';

    const statusText = document.createElement('span');
    statusText.id = 'audioStatus';
    statusText.textContent = '音乐已停止';
    statusText.style.fontSize = '1rem';

    playButton.addEventListener('click', () => {
      if (isPlaying) {
        audioManager.stopAudio();
      } else {
        if (currentTrackUrl) {
          audioManager.toggleAudio(currentTrackUrl, currentTrackInfo);
        } else {
          audioManager.toggleAudio(DEFAULT_BACKGROUND_MUSIC, currentTrackInfo);
        }
      }
    });

    randomButton.addEventListener('click', () => {
      if (availableTracks.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableTracks.length);
        const randomTrack = availableTracks[randomIndex];
        audioManager.toggleAudio(randomTrack, currentTrackInfo);
      }
    });

    return { playButton, randomButton, statusText };
  },

  // 将播放器UI添加到指定容器
  addPlayerToContainer: (container: HTMLElement) => {
    if (!container) return;
    
    // 清除容器内已有的播放器组件
    const existingPlayer = container.querySelector('#audioPlayer');
    if (existingPlayer) {
      container.removeChild(existingPlayer);
    }
  
    // 设置容器样式
    container.style.display = 'flex';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';
    container.style.padding = '10px 0';
  
    const { playButton, randomButton, statusText } = audioManager.createPlayerComponents();
  
    const playerDiv = document.createElement('div');
    playerDiv.id = 'audioPlayer';
    playerDiv.style.display = 'flex';
    playerDiv.style.alignItems = 'center';
    playerDiv.style.gap = '10px';
  
    playerDiv.appendChild(playButton);
    playerDiv.appendChild(randomButton);
    playerDiv.appendChild(statusText);
  
    container.appendChild(playerDiv);
  },


  // 更新播放器UI状态
  updatePlayerUI: () => {
    const playButton = document.getElementById('playPauseButton') as HTMLButtonElement;
    const statusText = document.getElementById('audioStatus') as HTMLSpanElement;

    if (playButton && statusText) {
      if (isPlaying) {
        playButton.textContent = '暂停';
        playButton.style.backgroundColor = '#e74c3c';
        // 显示歌曲和艺术家信息
        if (currentTrackInfo) {
          statusText.textContent = `${currentTrackInfo.artist} - ${currentTrackInfo.name}`;
        } else {
          statusText.textContent = '音乐播放中';
        }
      } else {
        playButton.textContent = '播放';
        playButton.style.backgroundColor = '#27ae60';
        if (currentTrackInfo) {
          statusText.textContent = `${currentTrackInfo.artist} - ${currentTrackInfo.name} (已暂停)`;
        } else {
          statusText.textContent = currentTrackUrl ? '音乐已暂停' : '音乐已停止';
        }
      }
    }
  },

  // 绑定空格键事件
  bindSpacebarEvent: () => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        // 检查当前活动元素是否是搜索框
        const activeElement = document.activeElement;
        if (!(activeElement && activeElement.tagName === 'INPUT' && activeElement.type === 'text')) {
          e.preventDefault();
          if (isPlaying) {
            audioManager.stopAudio();
          } else {
            if (currentTrackUrl) {
              audioManager.toggleAudio(currentTrackUrl,currentTrackInfo);
            } else {
              audioManager.toggleAudio(DEFAULT_BACKGROUND_MUSIC, currentTrackInfo);
            }
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeydown);

    // 清理函数
    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  },

  // 设置可用的音频轨道列表
  setAvailableTracks: (tracks: string[]) => {
    availableTracks = tracks;
  },

  // 修改toggleAudio函数，增加trackInfo参数
  toggleAudio: (url?: string, trackInfo?: { name: string; artist: string }) => {
    // 如果正在准备播放，不执行任何操作
    if (isPreparing) return;

    // 停止当前播放的音频
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
      isPlaying = false;
    }

    // 播放新音频
    if (url) {
      currentTrackUrl = url;
      // 存储歌曲信息
      currentTrackInfo = trackInfo || null;
      isPreparing = true;
      currentAudio = new Audio(url);
      currentAudio.loop = true;
      currentAudio.play()
        .then(() => {
          isPlaying = true;
          audioManager.updatePlayerUI();
        })
        .catch(error => {
          console.error('Failed to play audio:', error);
          currentAudio = null;
          audioManager.updatePlayerUI();
        })
        .finally(() => {
          isPreparing = false;
        });
    } else if (currentTrackUrl) {
      // 如果没有提供新的URL但有当前URL，则切换播放状态
      if (isPlaying) {
        audioManager.stopAudio();
      } else {
        audioManager.toggleAudio(currentTrackUrl, currentTrackInfo);
      }
    }
  },

  // 修改stopAudio函数，清除当前歌曲信息
  stopAudio: () => {
    // 如果正在准备播放，等待准备完成后再停止
    if (isPreparing) {
      setTimeout(() => audioManager.stopAudio(), 100);
      return;
    }

    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
      isPlaying = false;
      // 不清除currentTrackInfo，以便暂停时仍能显示歌曲信息
      audioManager.updatePlayerUI();
    }
  },

  // 检查音频是否正在播放
  isAudioPlaying: () => isPlaying,

  // 播放指定词条的音频
  playTermAudio: (url?: string, trackInfo?: { name: string; artist: string }) => {
    if (url) {
      audioManager.toggleAudio(url, trackInfo);
    }
  }
};


export default audioManager;