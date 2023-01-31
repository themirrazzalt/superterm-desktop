const {ipcRenderer} = require('electron');
const P3 = require('p3cnodesdk');
var connected = false;
var state = 'ended';
var client;
var connection = {
    address: null,
    raw: null,
    port: null,
    name: null
};

setInterval(() => {
    if(connected) {
        document.title = `${connection.name} (connected) - SuperTerm`
    } else if (connection.name) {
        document.title = `${connection.name} (${
            state == 'connecting' ? 'connecting':'disconnected'
        }) - SuperTerm`
    } else {
        document.title = '(no connection) - SuperTerm'
    }
    document.querySelector('.user-input').disabled = !connected;
});

ipcRenderer.on('color-scheme', (event,scheme)=>{
    document.querySelector('.viewing-area').dataset.color=scheme;
});

ipcRenderer.on('NewConnection', function (event,Name,Adr,Port) {
    connection.name=Name;
    connection.raw=Adr+":"+Port;
    connection.address=Adr;
    connection.port=Port;
    state = 'connecting';
    startConnection();
});
async function startConnection() {
    client = P3.createClient(connection.address,connection.port);
    client.on('connect', function () {
        connected = true;
    });
    client.on('error', function () {
        connected = false;
        state = 'disconnected'
    });
    client.on('disconnect', function () {
        connected = false;
        state = 'disconnected'
    });
    client.on('message', function (data) {
        if(!data[0]) { return false; }
        if(data[0] == 'clear') {
            ClearHistory()
        } else if(data[0] == 'text') {
            document.querySelector('.viewing-area').textContent += data[1];
        }
    });
};

function ClearHistory() {
    document.querySelector('.viewing-area').textContent = "";
}

document.querySelector('.user-input').onkeyup=(event) => {
    if(event.keyCode == 13) {
        if(!connected) { return false; }
        client.emit(['input',document.querySelector('.user-input').value]);
        document.querySelector('.user-input').value = '';
    }
}