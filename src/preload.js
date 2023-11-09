// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const electron=require('electron');
const contextBridge=electron.contextBridge;

const { ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld(
    "api", {
        loadscript: (filename) => {
            ipcRenderer.send("authenticated")
        }
    }
);

contextBridge.exposeInMainWorld(
    "create", {
        session: (fingerprint, userid, company) => {
            createSession(fingerprint, userid, company);
        }
    }
);

contextBridge.exposeInMainWorld(
    "get", {
        session: () => {
            return getSession();
        }
    }
);

function createSession(fingerprint, userid, company) {
//     var cookie = { SessionToken: fingerprint, UserId: userid, Company: company };
//     session.defaultSession.cookies.set(cookie)
//   .then(() => {
//     return;
//   }, (error) => {
//     console.error(error)
//   })

ipcRenderer.send("setCookie")
}

function getSession() {
    return ipcRenderer.send("getCookies");
}

function setCookie(name, value) {
    document.cookie = name+"="+value;
}

function getCookie(name) {
    var cookieName = name + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(cookieName) == 0) {
            return c.substring(cookieName.length, c.length);
        }
    }
    return "";
}