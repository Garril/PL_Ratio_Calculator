// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // 统一通信方法
  invokeAction: (channel, args) => ipcRenderer.invoke(channel, args),
  // 补充其他需要暴露的 API
  getAppVersion: () => ipcRenderer.invoke('get-app-version')
});