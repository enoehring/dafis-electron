const {main} = require('@popperjs/core');
const {app, BrowserWindow, autoUpdater, ipcMain, dialog, session, shell, Notification, clipboard} = require("electron");
const {event} = require('jquery');
const path = require('path');
const url = require("url");
const {Buffer} = require('buffer');
const fs = require('fs');
const https = require('node:https');
const os = require('os');

const {platform, env} = process

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

let mainWindow
const downloadPath = app.getPath('downloads');
const localTempPath = path.join(os.tmpdir(), "Dafis", "Elektron");
let pathObj = {downloadPath: downloadPath}

const createWindow = () => {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        nodeIntegration: true,
        contextIsolation: false,
        webPreferences: {
            webSecurity: false,
            preload: path.join(__dirname, "/../../src/preload.js"),
        },
        icon: "./src/images/logo.png"
    });

    app.setName('Dafis Elektron');
    app.setAppUserModelId('Dafis Elektron');

    mainWindow.maximize();

    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    const localFilesFolder = path.join(__dirname, "../../localFiles")

    ipcMain.on('speichern', (event, dateiInhalt, dateiPfad, open = true) => {

        const buffer = Buffer.from(dateiInhalt, 'base64');
        //var savePath = path.join(localFilesFolder, dateiPfad);
        var savePath = path.join(downloadPath, dateiPfad);

        fs.writeFile(savePath, buffer, {encoding: 'binary'}, (err) => {
            if (err) {
                event.reply('speichern-antwort', {success: false, error: err.message});
            } else {
                if (open) {
                    shell.openPath(savePath);
                }
                else {
                    let notification = new Notification({
                        title: 'Datei erfolgreich Heruntergeladen',
                        body: 'Dateiname: ' + dateiPfad,
                        icon: savePath,
                        timeoutType: 5000
                    });

                    notification.on('click', () => {
                        shell.openPath(savePath);
                    })

                    notification.show();
                }

                event.reply('speichern-antwort', {success: true});
            }
        });
    });

    var sessionData = {};

    ipcMain.handle("getCookies", async (event) => {
        return {sessionData, pathObj};
    });

    ipcMain.on("setCookie", (event, data) => {
        sessionData = data

        //Create the localTempPath folder if it doesn't exist
        if (!fs.existsSync(localTempPath)) {
            fs.mkdirSync(localTempPath, {recursive: true});
        }

        //Write the sessionData into a file in the localTempPath folder
        fs.writeFileSync(path.join(localTempPath, "sessionData.json"), JSON.stringify(data));
        session.defaultSession.cookies.set(data);
    });

    ipcMain.on("unauthenticated", (event) => {
        resetValidatedLicenses()

        mainWindow.loadFile("src/login.html");
    });

    const iconName = path.join(localFilesFolder, 'dnd.png')

    ipcMain.on('ondragstart', (event, filePath) => {
        event.sender.startDrag({
            file: path.join(downloadPath, filePath),
            icon: iconName
        });
    })

    // Load our app when user is authenticated.
    ipcMain.on("authenticated", async event => {
        mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
    });

    const filter = {
        urls: ['https://dafis-api.int.ino.group/*', 'https://localhost:44349/*'] // Remote API URS for which you are getting CORS error
    }

    mainWindow.webContents.session.webRequest.onBeforeSendHeaders(
        filter,
        (details, callback) => {
            details.requestHeaders.Origin = `https://dafis-api.int.ino.group/*`
            callback({requestHeaders: details.requestHeaders})
        }
    )

    mainWindow.webContents.session.webRequest.onHeadersReceived(
        filter,
        (details, callback) => {
            details.responseHeaders['access-control-allow-origin'] = [
                '*'
            ]
            callback({responseHeaders: details.responseHeaders})
        }
    )

    if (fs.existsSync(path.join(localTempPath, "sessionData.json"))) {
        // Read the file asynchronusly
        fs.readFile(path.join(localTempPath, "sessionData.json"), 'utf8', (err, data) => {
            if (err) {
                console.error(err)
                return
            }
            sessionData = JSON.parse(data);
            session.defaultSession.cookies.set(sessionData);
        });
    }
    else {
        // Load the login page by default.
        mainWindow.loadURL(`file://${__dirname}/../../src/login.html`);
    }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
