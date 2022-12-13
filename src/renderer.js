'use sctrict';

const button = document.getElementById('button');
const text = document.getElementById('text');

button.addEventListener('click', async () => {

    text.textContent = await window.myAPI.openDialog();
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

    text.textContent = await window.myAPI2.dragFile(file_path);

});
