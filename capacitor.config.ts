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
    backButtonBehavior: 'back'
  }
};

export default config;
