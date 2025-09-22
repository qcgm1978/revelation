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
  }
  
  document.addEventListener('touchstart', handleTouchStart, { passive: false });
  document.addEventListener('touchend', handleTouchEnd, { passive: false });
  document.addEventListener('click', handleDocumentClick, { passive: false });
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
  
 
  const isLeftEdgeGesture = touchStartX < EDGE_THRESHOLD && diffX > SWIPE_THRESHOLD;
 
  const isRightEdgeGesture = touchStartX > window.innerWidth - EDGE_THRESHOLD && diffX < -SWIPE_THRESHOLD;
 
  const isRegularSwipe = Math.abs(diffX) > SWIPE_THRESHOLD && diffTime < TIME_THRESHOLD;
  
  // 检查是否在目录页（通过是否存在nav-div元素判断）
  const navDiv = document.getElementById('nav-div');
  const isDirectoryPage = !!navDiv;
  
  if (isDirectoryPage) {
    // 在目录页，处理按钮切换
    const buttons = navDiv.querySelectorAll('button');
    if (buttons.length > 1) {
      // 找到当前激活的按钮
      const activeButtonIndex = Array.from(buttons).findIndex(button => {
        return button.classList.contains('active');
      });
      
      // 左滑（diffX < 0）切换到下一个按钮
      if (diffX < 0 && isRegularSwipe) {
        if (activeButtonIndex < buttons.length - 1) {
          buttons[activeButtonIndex + 1].click();
          e.preventDefault();
        }
      }
      // 右滑（diffX > 0）切换到上一个按钮
      else if (diffX > 0 && isRegularSwipe) {
        if (activeButtonIndex > 0) {
          buttons[activeButtonIndex - 1].click();
          e.preventDefault();
        }
      }
      return; // 目录页已处理，不执行默认导航
    }
  }
  
  // 非目录页，执行默认导航逻辑
  if ((diffX > 0 && isRegularSwipe) || isLeftEdgeGesture) {
    if (window.history.length > 1) {
      window.history.back();
      e.preventDefault();
    }
  }
 
  else if ((diffX < 0 && isRegularSwipe) || isRightEdgeGesture) {
    window.history.forward();
    e.preventDefault();
  }
};

const handleDocumentClick = (e: MouseEvent) => {
  const menuButton = document.getElementById('menu');
  const settingMenu = document.getElementById('setting');
  
 
  if (settingMenu && settingMenu.style.display !== 'none' && 
      menuButton && !menuButton.contains(e.target as Node) && 
      !settingMenu.contains(e.target as Node)) {
   
    const event = new CustomEvent('closeOverflowMenu');
    window.dispatchEvent(event);
  }
};

export { initializeGestureHandler };