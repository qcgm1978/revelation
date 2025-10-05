// utils/ttsAdapter.ts
// 移除之前添加的isSpeaking状态变量
import { TextToSpeech } from "@capacitor-community/text-to-speech";

// 改进检测逻辑，确保能正确识别Capacitor环境
export const useNativeTTS = typeof window !== "undefined" && ("capacitor" in window || "Capacitor" in window);

// 添加实际的支持检查函数
export const checkSupport = async (): Promise<boolean> => {
  if (useNativeTTS) {
    try {
      const { supported } = await TextToSpeech.isSupported();
      return supported;
    } catch (error) {
      alert('TTS支持检查失败：可能是原生TTS插件未正确安装或设备不支持TTS功能');
      return false;
    }
  }
  return typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== 'undefined';
};

// 获取当前使用的语音引擎名称
export const getVoiceEngineName = (): string => {
  if (useNativeTTS) {
    return 'Capacitor TTS';
  } else if (typeof window !== "undefined" && "speechSynthesis" in window) {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      // 查找中文语音
      const chineseVoice = voices.find(voice => voice.lang.includes('zh'));
      if (chineseVoice) {
        return chineseVoice.name;
      }
      // 查找Google语音引擎
      const googleVoice = voices.find(voice => voice.name.includes('Google') || voice.name.includes('Google语音识别'));
      if (googleVoice) {
        return googleVoice.name;
      }
      return voices[0].name;
    }
    return 'Web Speech API';
  }
  return '未知语音引擎';
};

export const stopSpeaking = async () => {
  try {
    if (useNativeTTS) {
      // 强制停止原生TTS
      await TextToSpeech.stop();
      // 增加延迟确保停止操作完成
      await new Promise(resolve => setTimeout(resolve, 200));
    } else if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  } catch (error) {
    console.error('停止朗读失败:', error);
  }
};

// 添加错误处理的speakText函数
export const speakText = async (text: string, language: string): Promise<boolean> => {
  try {
    // 每次调用前先强制停止任何正在进行的朗读
    await stopSpeaking();
    
    if (useNativeTTS) {
      await TextToSpeech.speak({
        text,
        lang: language,
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
      });
      return true;
    } else if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      
      // 尝试设置为Google语音识别引擎
      const voices = window.speechSynthesis.getVoices();
      const googleVoice = voices.find(voice => 
        (voice.name.includes('Google') || voice.name.includes('Google语音识别')) && 
        voice.lang.includes(language)
      );
      
      if (googleVoice) {
        utterance.voice = googleVoice;
      }
      
      window.speechSynthesis.speak(utterance);
      return true;
    }
  } catch (error) {
    let errorMessage = '朗读失败：';
    if (useNativeTTS) {
      errorMessage += '可能是原生TTS权限不足或设备语音引擎未安装';
    } else {
      errorMessage += '浏览器Web Speech API不支持或语音服务未启用';
      errorMessage += '\n建议检查是否已安装Google语音识别引擎';
    }
    alert(errorMessage);
  }
  return false;
};
