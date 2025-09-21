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