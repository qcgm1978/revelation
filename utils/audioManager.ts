let currentAudio: HTMLAudioElement | null = null;
let isPlaying = false;
let isPreparing = false; // 添加标志跟踪是否正在准备播放

const audioManager = {
  toggleAudio: (url?: string) => {
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
      isPreparing = true;
      currentAudio = new Audio(url);
      currentAudio.play()
        .then(() => {
          isPlaying = true;
        })
        .catch(error => {
          console.error('Failed to play audio:', error);
          currentAudio = null;
        })
        .finally(() => {
          isPreparing = false;
        });
    }
  },

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
    }
  },

  isAudioPlaying: () => isPlaying
};

export default audioManager;