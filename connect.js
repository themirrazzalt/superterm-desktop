const { ipcRenderer } = require("electron");

function ok() {
    ipcRenderer.send(
        'NewConnection',
        document.querySelector('.con-name').value,
        document.querySelector('.rtop-address').value.split(":")[0],
        Number(document.querySelector('.rtop-address').value.split(":")[1]||121)||0
    );
    setTimeout(()=>window.close(),100);
}