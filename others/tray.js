const { Tray, Menu, app,nativeImage } = require('electron');
const path = require('path');

module.exports = function createTrayIcon(mainWindow) {
    const pathToTheAppIcon = path.join(__dirname, '../public/assets/macTray.png'); // 请确保这里的路径指向一个有效的图标文件
    const appIcon = nativeImage.createFromPath(pathToTheAppIcon);
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
