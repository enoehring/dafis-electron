// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const electron=require('electron');
const { getSession, createSession } = require("./keygen");
const contextBridge=electron.contextBridge;

const { ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld(
    "api", {
        loadscript: (filename) => {
            ipcRenderer.send("authenticated")
        }
    }
);

// contextBridge.exposeInMainWorld("sess", {   
    
//     get_Session: () => {
//         getSession();
//     },


//     create_Session: (username, password) => {
//         createSession(username, password);
//     }
// });