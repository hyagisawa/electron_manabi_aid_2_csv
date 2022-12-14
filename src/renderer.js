'use strict';

const button = document.getElementById('button');
const text = document.getElementById('text');
const options = {
    types: [
        {
            description: 'html ファイル',
            accept: {
                'text/html': ['.html'],
            },
        },
    ],
};


button.addEventListener('click', async () => {
    try {
        const [handle] = await window.showOpenFilePicker(options);
        const file = await handle.getFile();
        const fileContents = await file.text();
        window.myAPI.dragFile(dom2CSV(fileContents))
            .then(result => {

                text.textContent = result; // 結果を表示
                async function r() {
                    let message = new Promise((resolve, reject) => {
                        setTimeout(() => resolve('ファイルの選択、またはドラッグ...'), 2000) // 2秒経ったら表示を戻す
                    });

                    text.textContent = await message;
                }
                r(); // メッセージをもとに戻す
            });
    } catch (error) {
        console.error(error); // ファイル取得を途中でキャンセルした場合
    }
});


button.addEventListener('dragover', function (e) {
    e.preventDefault();
    e.stopPropagation();
    button.style.backgroundColor = '#5499d9';
    button.style.transform = 'translateY(4px)';
})

button.addEventListener('dragleave', function (e) {
    e.preventDefault();
    e.stopPropagation();
    button.style.backgroundColor = '#6bb6ff';
    button.style.transform = 'translateY(0)';
})

button.addEventListener('drop', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    let file_path = e.dataTransfer.files[0].path;
    button.style.backgroundColor = '#6bb6ff';
    button.style.transform = 'translateY(0)';

    fetch(file_path) // (1) リクエスト送信
        .then(response => response.text()) // (2) レスポンスデータを取得
        .then(data => { // (3)レスポンスデータを処理
            window.myAPI.dragFile(dom2CSV(data))
                .then(result => {
                    text.textContent = result; // 結果を表示
                    async function r() {
                        let message = new Promise((resolve) => {
                            setTimeout(() => resolve('ファイルの選択、またはドラッグ...'), 2000) // 2秒経ったら表示を戻す
                        });
                        text.textContent = await message;
                    }
                    r(); // メッセージをもとに戻す
                })
        });
});



/* 学びエイド スクレーピング */
function dom2CSV(text) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    const table = doc.getElementsByTagName('table');
    let csv_data = [];

    for (let i = 0, l = table.length; i < l; ++i) {
        const tables = table[i].children;
        for (let j = 0, l = tables.length; j < l; ++j) {
            const table_row = tables[j].getElementsByTagName('tr');
            for (let k = 0, l = table_row.length; k < l; ++k) {
                const table_data = table_row[k].getElementsByTagName('td');
                let row_data = [];
                for (let m = 0, l = table_data.length; m < l; ++m) {
                    if (table_data[m].children.length <= 1) {
                        row_data.push(table_data[m].textContent);
                    } else {
                        for (let n = 0, l = table_data[m].children.length; n < l; ++n) {
                            let contents = table_data[m].children[n].textContent;
                            if (!/OK|対象外|v\d|p\d{1,}/.test(contents)) {
                                row_data.push(table_data[m].children[n].textContent);
                            }
                        }
                    }
                    csv_data.push(row_data);
                }
            }
        }
    }
    return csv_data;
}
