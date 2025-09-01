import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
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
      setOnTouchListener: true
    },
    backButtonBehavior: 'back',
    iconPath: {
      ldpi: 'assets/android/icon_48x48.png',
      mdpi: 'assets/android/icon_72x72.png',
      hdpi: 'assets/android/icon_96x96.png',
      xhdpi: 'assets/android/icon_144x144.png',
      xxhdpi: 'assets/android/icon_192x192.png',
      xxxhdpi: 'assets/android/icon_512x512.png'
    }
  }
};

export default config;
