const { app, BrowserWindow, Menu,globalShortcut } = require('electron');
let mainWindow;

function createWindow() {
    // 创建浏览器窗口
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    });

    // 并且为你的应用加载index.html
    mainWindow.loadFile('index.html');

    // 打开开发者工具
    mainWindow.webContents.openDevTools();


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

// Electron 完成初始化并准备创建浏览器窗口时，将调用此方法
app.whenReady().then(() => {
    createWindow();
  
    // 注册 'CommandOrControl+Shift+C'
    if (!globalShortcut.register('CommandOrControl+Shift+C', () => {
      console.log('CommandOrControl+Shift+C is pressed');
      // TODO: 显示复制历史记录界面
    })) {
      console.log('快捷键注册失败: CommandOrControl+Shift+C');
    }
  
    // 注册 'CommandOrControl+Shift+V'
    if (!globalShortcut.register('CommandOrControl+Shift+V', () => {
      console.log('CommandOrControl+Shift+V is pressed');
      // TODO: 显示粘贴历史记录界面
    })) {
      console.log('快捷键注册失败: CommandOrControl+Shift+V');
    }
  
    // 检查快捷键是否注册成功
    console.log("快捷键 'CommandOrControl+Shift+C' 注册", globalShortcut.isRegistered('CommandOrControl+Shift+C'));
    console.log("快捷键 'CommandOrControl+Shift+V' 注册", globalShortcut.isRegistered('CommandOrControl+Shift+V'));
  });

// 当所有窗口都关闭时退出
app.on('window-all-closed', () => {
    // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，否则绝大部分应用及其菜单栏会保持激活。
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // 在macOS上，当点击dock图标并且没有其他窗口打开时，通常在应用程序中重新创建一个窗口。
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});


app.on('will-quit', () => {
    // 注销所有快捷键
    globalShortcut.unregisterAll();
  });