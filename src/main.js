'use strict';

const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const userHome = process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"];

const template = Menu.buildFromTemplate([
    {
        label: "ファイル",
        submenu: [
            {
                role: 'quit', label: `${app.name}を終了`, accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Alt+Shift+Q'
            }
        ]
    }
]);

Menu.setApplicationMenu(template);

function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 400,
        height: 300,
        minWidth: 400,
        minHeight: 300,
        maxWidth: 400,
        maxHeight: 300,
        tittle: '学びエイド CSV 書き出しアプリ',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    ipcMain.handle('data-transfer', async (_e, _arg) => {
        let massage = await extractCSV(_arg);
        return massage;
    });
    /* デベロッパーツールを表示を表示 */
    // mainWindow.webContents.openDevTools();
    mainWindow.loadURL('file://' + __dirname + '/index.html');
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
})

/*  csv 書き出しファンクション  */
function extractCSV(csv_data) {
    const csv = '\ufeff講座,id,コマ\n' + csv_data.join('\n');
    fs.writeFile(`${userHome}/Desktop/extract.csv`, csv, (er) => {
        if (er) throw console.error(er);  // ERRORの場合
        console.log('done');
    });
    return '処理完了';
}
