const { app, BrowserWindow, Menu, Tray, nativeImage, ipcMain, globalShortcut, clipboard  } = require('electron');
const path = require('path');

let mainWindow;
let historyWindow; // 声明一个变量用于保存历史窗口
let tray = null;

function createWindow() {
    // 创建浏览器窗口
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        },
        icon: path.join(__dirname, './public/assets/appIcon.png') // 图标路径
    });

    // 并且为你的应用加载index.html
    mainWindow.loadFile('index.html');

        // 当窗口关闭时隐藏而不是关闭
        mainWindow.on('close', function (event) {
            if (!app.isQuitting) {
                event.preventDefault();
                mainWindow.hide();
            }
        });

    // 打开开发者工具
    // mainWindow.webContents.openDevTools();


        // 创建自定义菜单
        const menu = Menu.buildFromTemplate([
            {
                label: 'File',
                submenu: [
                    { label: 'Exit', click: () => app.quit() }
                ]
            },
            {
                label: 'Setting',
                submenu: [
                    {
                        label: 'Set Max Clipboard History Length',
                        click() {
                            mainWindow.webContents.send('open-max-length-dialog');
                        }
                    }
                ]
            },
            // 更多菜单项...
        ]);
    
        // 设置窗口菜单
        Menu.setApplicationMenu(menu);
    
}

function createHistoryWindow() {
    const { screen } = require('electron');
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width } = primaryDisplay.workAreaSize;

    historyWindow = new BrowserWindow({
        width: 500, // 窗口宽度
        height: 200, // 窗口高度
        x: (width - 500) / 2, // 居中位置
        y: 0, // 窗口的纵坐标
        alwaysOnTop: true, // 窗口置顶
        frame: false, // 无边框窗口
        transparent: true,  // 设置窗口透明
        skipTaskbar: true, // 不在任务栏显示
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        show: false // 初始不显示
    });

    historyWindow.loadFile('history.html'); // 指向历史记录的 HTML 文件

    historyWindow.on('closed', () => {
        historyWindow = null;
    });
}

function createTray() {
    const pathToTheAppIcon = path.join(__dirname, './public/assets/macTray.png'); // 请确保这里的路径指向一个有效的图标文件
    const appIcon = nativeImage.createFromPath(pathToTheAppIcon);
    tray = new Tray(appIcon);
    const contextMenu = Menu.buildFromTemplate([
        { label: '显示', click: () => mainWindow.show() },
        { label: '退出', click: () => {
                app.isQuitting = true;
                app.quit();
            } }
    ]);
    tray.setToolTip('pasteOn');
    tray.setContextMenu(contextMenu);
}

ipcMain.on('show-history-window', () => {
    if (historyWindow) {
        historyWindow.show();
    }
});

ipcMain.on('hide-history-window', () => {
    if (historyWindow) {
        historyWindow.hide();
    }
});
// main.js
ipcMain.on('send-clipboard-history', (event, clipboardHistory) => {
    if (historyWindow) {
      historyWindow.webContents.send('display-clipboard-history', clipboardHistory);
    }
  });
  

  
ipcMain.on('copy-from-history', (event, text) => {
    clipboard.writeText(text);
    mainWindow.webContents.send('copy-from-history',text);
});
  

// Electron 完成初始化并准备创建浏览器窗口时，将调用此方法
app.whenReady().then(() => {
    createWindow();
    createHistoryWindow(); // 创建历史窗口但不显示
    createTray();
    
// main.js
// 注册 'CommandOrControl+Shift+C'
if (!globalShortcut.register('CommandOrControl+Shift+C', () => {
    ipcMain.emit('show-history-window');
    mainWindow.webContents.send('request-clipboard-history');
})) {
    console.log('快捷键注册失败: CommandOrControl+Shift+C');
}
  });

// 当所有窗口都关闭时退出
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
    tray.destroy();
});


app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});


app.on('will-quit', () => {
    // 注销所有快捷键
    globalShortcut.unregisterAll();
  });