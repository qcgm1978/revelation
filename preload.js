const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的 API 到渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 获取应用信息
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getAppName: () => ipcRenderer.invoke('get-app-name'),
  
  // 监听主进程消息
  onNewDocument: (callback) => ipcRenderer.on('new-document', callback),
  onOpenDocument: (callback) => ipcRenderer.on('open-document', callback),
  onShowAbout: (callback) => ipcRenderer.on('show-about', callback),
  
  // 移除监听器
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});