const { app, Menu } = require('electron');

module.exports = function createMenu(mainWindow) {
    const template = [
        {
            label: 'File',
            submenu: [
                { label: 'Exit', click: () => {
                    app.isQuitting = true;
                    app.quit();
                } }
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
        // 更多菜单...
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
};
