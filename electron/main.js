const {
  app,
  BrowserWindow,
  Menu,
  ipcMain,
  globalShortcut,
} = require("electron");
const path = require("path");
const fs = require("fs");
const fsAsync = require("fs").promises;
const dotenv = require("dotenv");
const { dialog } = require("electron");

// 加载 .env.development 文件
// Vite 的 loadEnv 只会将环境变量注入到 Vite 的构建过程和前端代码中，而不会自动注入到 Electron 的主进程（main.js）中。
dotenv.config({ path: ".env.development" });
app.setName("PLCalc");
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1080,
    height: 960,
    title: "Profit to Loss",
    // frame: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // 确保路径正确
      contextIsolation: true, // 必须为 true
      nodeIntegration: false, // 必须为 false
      sandbox: false, // 禁用沙箱
    },
  });
  // 隐藏菜单栏
  Menu.setApplicationMenu(null);
  // 阻止网页修改标题
  mainWindow.webContents &&
    mainWindow.webContents.on("page-title-updated", (e) => {
      e.preventDefault();
    });
  // console.log('__dirname: ', __dirname);
  // console.log('process.env.NODE_ENV: ', process.env.NODE_ENV);

  if (process.env.NODE_ENV === "development") {
    console.log("Loading development server");
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    console.log("Loading production build");
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
  // 注册快捷键
  globalShortcut.register("CommandOrControl+R", () => {
    mainWindow.webContents.reload();
  });

  // 在createWindow函数内
  mainWindow.on('close', () => {
    mainWindow.webContents.send('window-close');
  });
}

app.whenReady().then(() => {
  // IPC 处理函数
  // 渲染进程通过IPC通信获取窗口ID
  ipcMain.handle("get-window-id", (event) => {
    return BrowserWindow.getFocusedWindow().id;
  });

  // main.js
  ipcMain.handle("save-config", async (event, config) => {
    const configPath = path.join(app.getPath('userData'), 'config.json');
    try {
      // 确保目录存在
      fs.mkdirSync(path.dirname(configPath), { recursive: true });
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      return true;
    } catch (error) {
      console.error('保存配置失败:', error);
      return false;
    }
  });
  ipcMain.handle("get-config", async () => {
    const configPath = path.join(app.getPath('userData'), 'config.json');
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    // 返回默认配置
    return {
      principal: "10000",
      leverage: 10,
      riskPercentage: 2,
      entryPrice: "",
      终止LossPrice: "",
      takeProfitPrice: "",
      feeRate: 0.05
    };
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", function () {
  globalShortcut.unregisterAll();
  if (process.platform !== "darwin") app.quit();
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});
