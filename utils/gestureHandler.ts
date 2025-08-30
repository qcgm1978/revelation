import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

if (Capacitor.isNativePlatform()) {
  App.addListener('backButton', () => {
    const canGoBack = window.history.length > 1;
    if (canGoBack) {
      window.history.back();
    } else {
      App.exitApp();
    }
  });
}

export const initializeGestureHandler = () => {
  if (Capacitor.isNativePlatform()) {
    console.log('手势处理器已初始化');
  }
};