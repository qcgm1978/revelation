
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// 判断是否在非浏览器环境中
const isNonBrowserEnvironment = () => {
  try {
    // 检查是否存在Capacitor对象且是原生平台环境
    if (typeof window !== 'undefined' && 'Capacitor' in window && window.Capacitor && window.Capacitor.isNativePlatform) {
      const isNative = window.Capacitor.isNativePlatform();
      return isNative;
    }
    return false;
  } catch {
    return false;
  }
};

// 在非浏览器环境中设置特殊margin
if (isNonBrowserEnvironment()) {
  rootElement.style.margin = '3rem auto 0';
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <App />
);
