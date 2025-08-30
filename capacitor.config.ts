import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'infinite-wiki',
  webDir: 'dist',
  android: {
    webView: {
      overrideUserAgent: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Mobile Safari/537.36',
      allowFileAccess: true,
      javaScriptEnabled: true,
      domStorageEnabled: true,
      webContentsDebuggingEnabled: true,
      hardwareAcceleration: true,
      // 配置WebView的手势处理
      onScrollChanged: true
    },
    // 配置Android特定的导航行为
    backButtonBehavior: 'back' // 这会让返回按钮默认执行WebView的后退，而不是退出应用
  },
  // 配置全局导航行为
  navigationBar: {
    backgroundColor: '#ffffff',
    theme: 'light'
  }
};

export default config;
