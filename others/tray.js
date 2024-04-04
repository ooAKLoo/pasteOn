const { Tray, Menu, app,nativeImage } = require('electron');
const path = require('path');

module.exports = function createTrayIcon(mainWindow) {
    // 根据应用是否打包，设置不同的图标路径
    const iconPath = app.isPackaged
        ? path.join(process.resourcesPath, 'assets', 'macTray.png') // 打包后的路径
        : path.join(__dirname, '../public/assets', 'macTray.png'); // 开发时的路径
        
    console.log("iconPath=",iconPath)
    const appIcon = nativeImage.createFromPath(iconPath);
    tray = new Tray(appIcon);
    const contextMenu = Menu.buildFromTemplate([
        { label: '显示', click: () => mainWindow.show() },
        {
            label: '退出', click: () => {
                app.isQuitting = true;
                app.quit();
            }
        }
    ]);
    tray.setToolTip('pasteOn');
    tray.setContextMenu(contextMenu);
    // 清理
    app.on('before-quit', () => {
        tray.destroy();
    });
};
