const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const fsAsync = require('fs').promises;
const dotenv = require('dotenv');
const { dialog } = require('electron');
const axios = require('axios');

// 加载 .env.development 文件
// Vite 的 loadEnv 只会将环境变量注入到 Vite 的构建过程和前端代码中，而不会自动注入到 Electron 的主进程（main.js）中。
dotenv.config({ path: '.env.development' });


function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'FecthImg',
    // frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // 确保路径正确
      contextIsolation: true, // 必须为 true
      nodeIntegration: false, // 必须为 false
      sandbox: false, // 禁用沙箱
    },
  });
  // 阻止网页修改标题
  mainWindow.webContents && mainWindow.webContents.on('page-title-updated', (e) => {
    e.preventDefault();
  });

  console.log('__dirname: ', __dirname);
  console.log('process.env.NODE_ENV: ', process.env.NODE_ENV);

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


  ipcMain.handle('download-img', async (event, { url, target }) => {
    const win = new BrowserWindow({
      show: false,
      webPreferences: {
        webSecurity: true, // 允许跨域资源（网页3）
        contextIsolation: true
      }
    });

    try {
      await win.loadURL(url);

      // 等待动态内容加载
      await win.webContents.executeJavaScript(`
      new Promise(resolve => {
          const observer = new MutationObserver(() => {
              if (document.querySelector('.swiper-slide > div') && 
                  document.querySelector('.product-big-img-list img')) {
                  observer.disconnect();
                  resolve();
              }
          });
          observer.observe(document.body, { 
              childList: true, 
              subtree: true 
          });
      })
  `);
      const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

      await sleep(2000);
      // 获取主图数据
      let mainImages = await win.webContents.executeJavaScript(`
      new Promise((resolve) => {
        const elements = document.querySelectorAll('.head-figure__media-view .swiper-wrapper .swiper-slide > div');
        const results = [];
        elements.forEach(div => {
          // 直接获取元素的 style 属性原始值[5,7](@ref)
          const styleString = div.getAttribute('style') || '';
          results.push({ 
            rawStyle: styleString,
            selector: '.swiper-slide > div' 
          });
        });
        resolve(results);
      })
    `, true);

      // 获取详情图数据
      let detailImages = await win.webContents.executeJavaScript(`
      new Promise((resolve) => {
          const imgs = document.querySelectorAll('.partial-detail-wrapper .product-big-img-list img');
          const results = [];
          let loadedCount = 0;
  
          imgs.forEach(img => {
              const checkSrc = () => {
                  if (img.complete && img.naturalWidth > 0) { // 图片加载验证（网页7）
                      results.push({
                          url: img.src,
                          selector: '.product-big-img-list img'
                      });
                  }
                  loadedCount++;
                  if (loadedCount === imgs.length) resolve(results);
              };
  
              if (img.src) {
                  checkSrc();
              } else {
                  img.onload = checkSrc;
                  img.onerror = () => {
                      console.warn('图片加载失败:', img);
                      loadedCount++;
                  };
              }
          });
      })
    `, true);

      function extractUrlWithoutRegex(cssString) {
        // Step1: 定位关键起始点
        const urlKeyword = 'url("';
        const startIndex = cssString.indexOf(urlKeyword);

        // Step2: 验证有效性
        if (startIndex === -1) return null;

        // Step3: 计算起始位置（起始位置为关键词长度+起始索引）
        const urlStart = startIndex + urlKeyword.length;

        // Step4: 查找闭合引号位置
        const endIndex = cssString.indexOf('")', urlStart);

        // Step5: 安全截取
        return endIndex !== -1
          ? cssString.substring(urlStart, endIndex)
          : null;
      }

      mainImages = mainImages.map(item => {
        const turl = extractUrlWithoutRegex(item.rawStyle) || '';
        return {
          url: turl
        };
      })
      detailImages = detailImages.map(item => {
        return {
          url: item.url
        };
      })
      // 获取到了所有图片的url
      const resImages = {
        main: mainImages,
        detail: detailImages
      };
      const mainDir = path.join(target, '主图')
      const detailDir = path.join(target, '详情图')

      // 创建目录
      const ensureDir = async (dirPath) => {
        if (!fs.existsSync(dirPath)) {
          await fs.mkdirSync(dirPath, { recursive: true })
        }
      }
      // 确保目录存在(网页7)
      await ensureDir(mainDir)
      await ensureDir(detailDir)

      await sleep(500);
      const downloadImage = async (targetDir, imageUrl, name) => {
        try {
          // 生成规范文件名（网页2改进版）
          const parsedUrl = new URL(imageUrl);
          const fileName = `${name}.png`; // 强制PNG后缀
          const savePath = path.join(targetDir, fileName);

          // 3. 下载图片数据（网页4）
          const response = await axios({
            method: 'GET',
            url: imageUrl,
            responseType: 'stream', // 流式下载优化内存
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Electron/'
            }
          });

          // 4. 写入文件（网页5）
          const writer = fs.createWriteStream(savePath);
          response.data.pipe(writer);

          return new Promise((resolve, reject) => {
            writer.on('finish', () => resolve(savePath));
            writer.on('error', reject);
          });
        } catch (err) {
          throw new Error(`下载失败: ${err.message}`);
        }
      }
      console.log("resImages.main: ", resImages.main);
      console.log("resImages.detail: ", resImages.detail);
      const taskList = [];
      resImages.main.forEach((item, index) => {
        const tname = `主图${((index + 1) + '').padStart(2, 0)}`;
        taskList.push(downloadImage(mainDir, item.url, tname));
      })
      resImages.detail.forEach((titem, tindex) => {
        const tname = `详情图${((tindex + 1) + '').padStart(2, 0)}`;
        taskList.push(downloadImage(detailDir, titem.url, tname));
      })
      for (let i = 0; i < taskList.length; i++) {
        await taskList[i];
        await sleep(500);
      }

      return {
        success: true,
        path: target,
      }
    } finally {
      win.destroy();
    }
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
