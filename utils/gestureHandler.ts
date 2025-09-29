import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

let touchStartX = 0;
let touchStartTime = 0;
const SWIPE_THRESHOLD = 60;
const TIME_THRESHOLD = 1000;
const EDGE_THRESHOLD = 50;

// 新增变量用于处理音频弹窗的手势
let popupStartY = 0;
let popupCurrentY = 0;
const POPUP_SWIPE_THRESHOLD = 50;
let isPopupOpen = false;

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
  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  document.addEventListener('mousedown', handleMouseDown, { passive: false });
  document.addEventListener('click', handleDocumentClick, { passive: false });
};

const handleTouchStart = (e: TouchEvent) => {
  touchStartX = e.touches[0].clientX;
  touchStartTime = new Date().getTime();
  
  // 处理弹窗的触摸开始
  if (isPopupOpen) {
    popupStartY = e.touches[0].clientY;
  }
};

const handleTouchMove = (e: TouchEvent) => {
  // 处理弹窗的触摸移动
  if (isPopupOpen) {
    popupCurrentY = e.touches[0].clientY;
  }
};

const handleTouchEnd = (e: TouchEvent) => {
  const touchEndX = e.changedTouches[0].clientX;
  const touchEndTime = new Date().getTime();
  const diffX = touchEndX - touchStartX;
  const diffTime = touchEndTime - touchStartTime;
  
  // 检查弹窗是否打开，优先处理弹窗手势
  if (isPopupOpen) {
    const diffY = popupStartY - popupCurrentY;
    if (diffY > POPUP_SWIPE_THRESHOLD) {
      const existingPopup = document.getElementById('trackInfoPopup');
      if (existingPopup) {
        existingPopup.style.transition = 'opacity 0.3s ease-out';
        existingPopup.style.opacity = '0';
        setTimeout(() => {
          existingPopup.remove();
          isPopupOpen = false;
        }, 300);
      }
    }
    popupStartY = 0;
    popupCurrentY = 0;
    return; // 弹窗手势已处理，不执行其他手势逻辑
  }
  
  // 左边缘手势
  const isLeftEdgeGesture = touchStartX < EDGE_THRESHOLD && diffX > SWIPE_THRESHOLD;
  
  // 右边缘手势
  const isRightEdgeGesture = touchStartX > window.innerWidth - EDGE_THRESHOLD && diffX < -SWIPE_THRESHOLD;
  
  // 正常滑动手势
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

const handleMouseDown = (e: MouseEvent) => {
  if (isPopupOpen) {
    popupStartY = e.clientY;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }
};

const handleMouseMove = (e: MouseEvent) => {
  if (isPopupOpen) {
    popupCurrentY = e.clientY;
  }
};

const handleMouseUp = () => {
  if (isPopupOpen) {
    const diffY = popupStartY - popupCurrentY;
    if (diffY > POPUP_SWIPE_THRESHOLD) {
      const existingPopup = document.getElementById('trackInfoPopup');
      if (existingPopup) {
        existingPopup.remove();
        isPopupOpen = false;
      }
    }
    popupStartY = 0;
    popupCurrentY = 0;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }
};

const handleDocumentClick = (e: MouseEvent) => {
  const menuButton = document.getElementById('menu');
  const settingMenu = document.getElementById('setting');
  
  // 关闭设置菜单的逻辑
  if (settingMenu && settingMenu.style.display !== 'none' && 
      menuButton && !menuButton.contains(e.target as Node) && 
      !settingMenu.contains(e.target as Node)) {
    
    const event = new CustomEvent('closeOverflowMenu');
    window.dispatchEvent(event);
  }
};

// 导出控制弹窗状态的函数
export const setPopupOpen = (open: boolean) => {
  isPopupOpen = open;
};

export { initializeGestureHandler };