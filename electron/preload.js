// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // 统一通信方法
  invokeAction: (channel, args) => ipcRenderer.invoke(channel, args),
  // 补充其他需要暴露的 API
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  saveConfigData: async (data) => {
    return ipcRenderer.invoke('save-config', data);
  },
  getConfigData: async () => {
    return ipcRenderer.invoke('get-config');
  },
  onWindowClose: (callback) => {
    ipcRenderer.on('window-close', callback);
  }
});