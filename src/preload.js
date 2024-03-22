// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const electron=require('electron');
const contextBridge=electron.contextBridge;

const { ipcRenderer } = require("electron");

var _sessionToken = "";
var _userId = 0;
var _company = "";


document.addEventListener("DOMContentLoaded", function (){
    let button = document.getElementById("btnSortCategories");
    button.addEventListener("click", () => {
        button.innerHTML = "asdf";
    });
});

contextBridge.exposeInMainWorld(
    "api", {
        loadscript: (filename) => {
            ipcRenderer.send("authenticated")
        }
    }
);

contextBridge.exposeInMainWorld(
    "create", {
        session: (fingerprint, userid, company, name, username) => {
            createSession(fingerprint, userid, company, name, username);
        }
    }
);

// Exponieren von Funktionen an die Renderer-Seite
contextBridge.exposeInMainWorld("session", {
    get: () => {
        // Funktion zum Abrufen von Sitzungsdaten vom Hauptprozess
        return getSession();
    },
    create: (fingerprint, userid, company, name, username) => {
        // Funktion zum Erstellen einer Sitzung im Hauptprozess
        createSession(fingerprint, userid, company, name, username);
    }
});


contextBridge.exposeInMainWorld(
    "get", {
        session: () => {
            return getSession();
        }
    }
);


contextBridge.exposeInMainWorld(
    "file", {
        save: (fileContent, path, open = true) => {
            ipcRenderer.send('speichern', fileContent, path, open);

            ipcRenderer.on('speichern-antwort', (event, result) => {
                if (result.success) {
                    console.log('Datei erfolgreich gespeichert!');
                } else {
                    console.error('Fehler beim Speichern der Datei:', result.error);
                }
            });
        }
    }
);

contextBridge.exposeInMainWorld('electron', {
    startDrag: (fileName) => {
      ipcRenderer.send('ondragstart', fileName)
    }
  })


function createSession(fingerprint, userid, company, name, username) {
    _sessionToken = fingerprint;
    _userId = userid;
    _company = company;

    ipcRenderer.send("setCookie", {SessionToken: _sessionToken, UserId: _userId, Company: _company, FullName: name, UserName: username});
}

async function getSession() {
    const result = await ipcRenderer.invoke('getCookies');
    var ret = result // prints "foo"
    return ret;
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