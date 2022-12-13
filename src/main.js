// Modules to control application life and create native browser window
'use sctrict';

const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

/* csv 書き出し用モジュール */
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { JSDOM } = require('jsdom');

const template = Menu.buildFromTemplate([
    {
        label: "ファイル",
        submenu: [
            { role: 'close', label: 'ウィンドウを閉じる' }
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
        tittle: '学びエイド CSV 書き出しアプリ',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    ipcMain.handle('open-dialog', async (_e, _arg) => {
        return dialog
            .showOpenDialog(mainWindow, {
                properties: ['openFile'],
            })
            .then(async (result) => {
                let massage = await extractCSV(result.filePaths[0]);
                return massage;
            });
    });


    ipcMain.handle('drag-file', async (_e, _arg) => {
        return extractCSV(_arg);
    });
    /* デベロッパーツールを表示を表示 */
    // mainWindow.webContents.openDevTools();

    // mainWindow.loadFile('index.html');
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
function extractCSV(file_path) {

    if (path.extname(file_path) !== '.html') throw console.error('有効なファイルタイプではない');
    const doc = fs.readFileSync(file_path);
    const dom = new JSDOM(doc);
    const tables = dom.window.document.querySelectorAll('table');

    let table_extract = [];

    for (let i = 0, len = tables.item.length; i < len; ++i) {
        let table_row = tables.item(i).querySelectorAll('tr');
        for (let j = 0, len = table_row.length; j < len; ++j) {
            let table_data = table_row[j].children;
            let cell_data = [];
            for (let k = 0; k < table_data.length; ++k) {
                cell_data.push(table_data[k].textContent);
            }
            table_extract.push(cell_data);
        }
    }

    let csv = []; // ROW データを入れる配列

    for (let i = 0, l = table_extract.length; i < l; ++i) {
        let r_1 = table_extract[i][0].replace(/(^.+)\s$/, '$1');
        let r_2 = table_extract[i][1].split(' : ')[0];
        // let txt = table_extract[i][2].replace(/^\sOK\s|^\s対象外\s(.+$)/, '$1');
        let r_3 = table_extract[i][2].replace(/^\sOK\s|^\s対象外\s(.+$)/, '$1').replace(/(^.+)\sp\d+$/, '$1');
        csv.push({ course: r_1, id: r_2, koma: r_3 });
    }

    const csvWriter = createCsvWriter({
        path: `${path.dirname(file_path)}/${path.parse(file_path).name}.csv`, // 保存する先のパス(すでにファイルがある場合は上書き保存)
        header: ['course', 'id', 'koma']  // 出力する項目(ここにない項目はスキップ)
    });

    csvWriter.writeRecords(csv).then(function () {
        console.log('done');
    });
    return '処理完了';
}
