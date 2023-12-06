const { main } = require('@popperjs/core');
const { app, BrowserWindow, autoUpdater, ipcMain, dialog, session, shell } = require("electron");
const { event } = require('jquery');
const path = require('path');
const url = require("url");
const { Buffer } = require('buffer');
const fs = require('fs');

const { platform, env } = process

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow

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

  mainWindow.maximize();

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();


  ipcMain.on('speichern', (event, dateiInhalt, dateiPfad) => {

    const buffer = Buffer.from(dateiInhalt, 'base64');

    fs.writeFile(dateiPfad, buffer, { encoding: 'binary' }, (err) => {
      if (err) {
        event.reply('speichern-antwort', { success: false, error: err.message });
      } else {
        event.reply('speichern-antwort', { success: true });
      }
    });

    shell.openPath(dateiPfad);
  });

  var sessionData = {};

  ipcMain.handle("getCookies", async (event) => {
    return sessionData;
  });

  ipcMain.on("setCookie", (event, data) => {
    sessionData = data
    session.defaultSession.cookies.set(data);
  });

  ipcMain.on("unauthenticated", (event) => {
    resetValidatedLicenses()

    mainWindow.loadFile("src/login.html");
  })

  // Load our app when user is authenticated.
  ipcMain.on("authenticated", async event => {
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    // if (env.NODE_ENV === 'development') {
    //   return // Skip updates on development env
    // }

    // // Attempt to update the app after the user is authenticated
    // const { licenses } = await getLicenses()
    // if (!Object.values(licenses).some(l => Object.keys(l).length)) {
    //   return
    // }

    // // Use first available license key that's valid for updates
    // const [license] = Object.values(licenses).filter(l => l.meta && l.meta.valid)
    // if (!license) {
    //   return
    // }

    // if (lastUpdateAttemptAt != null && ((+new Date) - lastUpdateAttemptAt) < 43200000 /* every 12 hours */) {
    //   return
    // } else {
    //   lastUpdateAttemptAt = +new Date
    // }

    // const { key } = license.data.attributes
    // autoUpdater.setFeedURL(`https://dist.keygen.sh/v1/${accountId}/${productId}/update/${platform}/zip/${app.getVersion()}?key=${key}`)

    // autoUpdater.on('error', err => mainWindow.webContents.send('error', err))
    // autoUpdater.on('checking-for-update', () => mainWindow.webContents.send('log', 'checking-for-update', autoUpdater.getFeedURL()))
    // autoUpdater.on('update-available', () => mainWindow.webContents.send('log', 'update-available', autoUpdater.getFeedURL()))
    // autoUpdater.on('update-not-available', () => mainWindow.webContents.send('log', 'update-not-available', autoUpdater.getFeedURL()))
    // autoUpdater.on('update-downloaded', (...args) => {
    //   mainWindow.webContents.send('log', 'update-downloaded', autoUpdater.getFeedURL(), args)

    //   const choice = dialog.showMessageBox(mainWindow, {
    //     message: 'An update has been downloaded. Do you want to restart now to finish installing it?',
    //     title: 'Update is ready',
    //     type: 'question',
    //     buttons: [
    //       'Yes',
    //       'No'
    //     ]
    //   })

    //   if (choice === 0) {
    //     autoUpdater.quitAndInstall()
    //   }
    // })

    // autoUpdater.checkForUpdates()
  });

  const filter = {
    urls: ['http://dev.dafis-api.inoclad.corp/*', 'https://localhost:44349/*'] // Remote API URS for which you are getting CORS error
  }  

  mainWindow.webContents.session.webRequest.onBeforeSendHeaders(
    filter,
    (details, callback) => {
      details.requestHeaders.Origin = `http://dev.dafis-api.inoclad.corp/*`
      callback({ requestHeaders: details.requestHeaders })
    }
  )
  
  mainWindow.webContents.session.webRequest.onHeadersReceived(
    filter,
    (details, callback) => {
      details.responseHeaders['access-control-allow-origin'] = [
        '*'
      ]
      callback({ responseHeaders: details.responseHeaders })
    }
  )


  // Load the login page by default.
  mainWindow.loadURL(`file://${__dirname}/../../src/login.html`);
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
