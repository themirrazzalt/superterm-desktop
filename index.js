const {BrowserWindow,app, session, Menu, dialog, MenuItem, ipcMain} = require('electron');
const fs = require('fs');
app.whenReady().then(() => {
    var ses = session.fromPartition('superterm');
    ses.protocol.registerFileProtocol(
        'superterm',
        (request, callback) => {
            if(request.url === 'superterm://newtab' || request.url === '/newtab') {
                callback(__dirname+'/superterm.html')
            } else if(request.url === 'superterm://connect' || request.url === '/connect') {
                callback(__dirname+'/new-connection.html')
            } else if(request.url === 'superterm://assets/main.js' || request.url === '/assets/main.js') {
                callback(__dirname+'/superterm.js')
            } else if(request.url === 'superterm://assets/connect.js' || request.url === '/assets/connect.js') {
                callback(__dirname+'/connect.js')
            } else if(request.url === 'superterm://assets/main.css' || request.url === '/assets/main.css') {
                callback(__dirname+'/superterm.css')
            } else {
                callback(__dirname+'/not-found.html')
            }
        }
    );
    var menu = new Menu();
    menu.append(new MenuItem({
        label: 'File',
        type: 'submenu',
        submenu: [
            {
                label: 'Create Shortcut',
                click: function () {
                    mainwnd.webContents.send('save-to-desktop');
                },
                type: 'normal'
            },
            {
                type: 'separator'
            },
            {
                label: 'Exit',
                click: function() {
                    app.exit();
                },
                type: 'normal'
            }
        ]
    }));
    menu.append(new MenuItem({
        label: 'Connection',
        type: 'submenu',
        submenu: [
            {
                type: 'normal',
                label: 'New Connection',
                click: function () {
                    var newConWin = new BrowserWindow({
                        webPreferences: {
                            session: ses,
                            nodeIntegration: true,
                            contextIsolation: false
                        },
                        maximizable: false,
                        resizable: false,
                        width: 400,
                        height: 240,
                        modal: true,
                        parent: mainwnd,
                    });
                    newConWin.setMenu(new Menu());
                    newConWin.loadURL('superterm://connect');
                }
            },
            {
                type: 'separator'
            },
            {
                type: 'normal',
                label: 'Connect/Disconnect',
                click: function () {
                    mainwnd.webContents.send('connect-disconnect')
                }
            },
            {
                type: 'normal',
                label: 'End',
                click: function () {
                    mainwnd.webContents.send('end')
                }
            }
        ]
    }));
    menu.append(new MenuItem({
        type: 'submenu',
        label: 'View',
        submenu: [
            {
                type: 'normal',
                label: 'Clear History',
                click: function () {
                    mainwnd.webContents.send('clear-history');
                }
            },
            {
                type: 'separator'
            },
            {
                type: 'submenu',
                label: 'Color Scheme',
                submenu: [
                    {
                        type: 'normal',
                        label: 'Green on black',
                        click: function () {
                            mainwnd.webContents.send(
                                'color-scheme',
                                'green-on-black'
                            )
                        }
                    },
                    {
                        type: 'normal',
                        label: 'Black on white',
                        click: function () {
                            mainwnd.webContents.send(
                                'color-scheme',
                                'black-on-white'
                            )
                        }
                    },
                    {
                        type: 'normal',
                        label: 'Light blue on gray',
                        click: function () {
                            mainwnd.webContents.send(
                                'color-scheme',
                                'light-blue-on-grey'
                            )
                        }
                    },
                ]
            }
        ]
    }));
    menu.append(new MenuItem({
        type: 'submenu',
        label: 'Help',
        submenu: [
            {
                type: 'normal',
                label: 'About',
                click: function () {
                    dialog.showMessageBox(null,{
                        title: 'About',
                        message: 'SuperTerm for Desktop\nVersion 1.0.0',
                        buttons: [
                            'OK'
                        ]
                    })
                }
            },
            {
                role: 'toggleDevTools'
            }
        ]
    }));
    var mainwnd = new BrowserWindow({
        title: 'SuperTerm',
        webPreferences: {
            session: ses,
            nodeIntegration: true,
            nodeIntegrationInSubFrames: true,
            contextIsolation: false
        },
    });
    ipcMain.on('NewConnection',(event,Name,Address,Port) => {
        setTimeout(function () {
            mainwnd.webContents.send(
                'NewConnection',Name,Address,Port
            );
        },100);
    });
    mainwnd.setMenu(menu);
    mainwnd.loadURL('superterm://newtab');
});