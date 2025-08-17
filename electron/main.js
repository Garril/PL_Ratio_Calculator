const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const fsAsync = require('fs').promises;
const dotenv = require('dotenv');
const { dialog } = require('electron');

// 加载 .env.development 文件
// Vite 的 loadEnv 只会将环境变量注入到 Vite 的构建过程和前端代码中，而不会自动注入到 Electron 的主进程（main.js）中。
dotenv.config({ path: '.env.development' });
app.setName('PLCalc');
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1080,
    height: 960,
    title: 'Profit to Loss',
    // frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // 确保路径正确
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
  });
  // 隐藏菜单栏
  Menu.setApplicationMenu(null);
  // 阻止网页修改标题
  mainWindow.webContents && mainWindow.webContents.on('page-title-updated', (e) => {
    e.preventDefault();
  });
  // console.log('__dirname: ', __dirname);
  // console.log('process.env.NODE_ENV: ', process.env.NODE_ENV);

  if (process.env.NODE_ENV === 'development') {
    console.log('Loading development server');
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    console.log('Loading production build');
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  // IPC 处理函数
  // 渲染进程通过IPC通信获取窗口ID
  ipcMain.handle('get-window-id', (event) => {
    return BrowserWindow.getFocusedWindow().id
  })

  // main.js
  ipcMain.handle('open-directory-dialog', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: '选择保存目录', // 添加对话框标题
      buttonLabel: '选择'    // 自定义按钮文字
    });
    return canceled ? '' : filePaths[0];
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
