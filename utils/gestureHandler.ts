import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

let touchStartX = 0;
let touchStartTime = 0;
const SWIPE_THRESHOLD = 60;
const TIME_THRESHOLD = 1000;
const EDGE_THRESHOLD = 50;

const initializeGestureHandler = () => {
  if (Capacitor.isNativePlatform()) {
    App.addListener('backButton', () => {
      const canGoBack = window.history.length > 1;
      if (canGoBack) {
        window.history.back();
      } else {
        App.exitApp();
      }
    });

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
  }
};

const handleTouchStart = (e: TouchEvent) => {
  touchStartX = e.touches[0].clientX;
  touchStartTime = new Date().getTime();
};

const handleTouchEnd = (e: TouchEvent) => {
  const touchEndX = e.changedTouches[0].clientX;
  const touchEndTime = new Date().getTime();
  const diffX = touchEndX - touchStartX;
  const diffTime = touchEndTime - touchStartTime;
  
  // 检测是否从左边缘开始的滑动（后退手势）
  const isLeftEdgeGesture = touchStartX < EDGE_THRESHOLD && diffX > SWIPE_THRESHOLD;
  // 检测是否从右边缘开始的滑动（前进手势）
  const isRightEdgeGesture = touchStartX > window.innerWidth - EDGE_THRESHOLD && diffX < -SWIPE_THRESHOLD;
  // 检测普通滑动
  const isRegularSwipe = Math.abs(diffX) > SWIPE_THRESHOLD && diffTime < TIME_THRESHOLD;
  
  // 后退手势：从左向右滑（diffX > 0）或从左边缘开始的滑动
  if ((diffX > 0 && isRegularSwipe) || isLeftEdgeGesture) {
    if (window.history.length > 1) {
      window.history.back();
      e.preventDefault();
    }
  }
  // 前进手势：从右向左滑（diffX < 0）或从右边缘开始的滑动
  else if ((diffX < 0 && isRegularSwipe) || isRightEdgeGesture) {
    window.history.forward();
    e.preventDefault();
  }
};

export { initializeGestureHandler };