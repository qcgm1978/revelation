import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.revelationreader.app',
  appName: '启示路',
  webDir: 'dist',
  android: {
    webView: {
      allowFileAccess: true,
      javaScriptEnabled: true,
      domStorageEnabled: true,
      webContentsDebuggingEnabled: true,
      hardwareAcceleration: true,
      useHybridComposition: true,
      setOnTouchListener: true,
      // 添加Web Speech API支持相关配置
      defaultWebSettings: {
        mediaPlaybackRequiresUserGesture: false
      }
    },
    backButtonBehavior: 'back',
    iconPath: {
      ldpi: 'assets/android/icon_36x36.png',
      mdpi: 'assets/android/icon_48x48.png',
      hdpi: 'assets/android/icon_72x72.png',
      xhdpi: 'assets/android/icon_96x96.png',
      xxhdpi: 'assets/android/icon_144x144.png',
      xxxhdpi: 'assets/android/icon_192x192.png'
    },
    roundIconPath: {
      ldpi: 'assets/android/icon_36x36.png',
      mdpi: 'assets/android/icon_48x48.png',
      hdpi: 'assets/android/icon_72x72.png',
      xhdpi: 'assets/android/icon_96x96.png',
      xxhdpi: 'assets/android/icon_144x144.png',
      xxxhdpi: 'assets/android/icon_192x192.png'
    }
  }
};


export default config;
