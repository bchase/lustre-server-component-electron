import { app, ipcMain, BrowserWindow } from 'electron';
import { fileURLToPath } from 'url';
import path from 'path';
import * as GleamCounter from './build/dev/javascript/counter/app.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// let sockets = null;
let sockets = {};
let windows = {};

function slug() {
  return btoa(`${performance.now()}${Math.random()}`.replaceAll('.', ''));
}

ipcMain.handle('lustre:server-component:connect', async (event, id) => {
  const win = BrowserWindow.fromWebContents(event.sender);

  windows[id] = win;
  sockets[id] = GleamCounter.init_counter_socket(id);

  return null;
});

ipcMain.handle('lustre:server-component:send', async (event, id, msg) => {
  GleamCounter.handle_websocket_message(sockets[id], msg);

  return null;
});

ipcMain.handle('lustre:server-component:close', async (_event) => {
  // TODO clean up `sockets` & `windows`

  return null;
});


export function sendToClient(id, json) {
  // TODO log err on none

  windows[id]
    ?.webContents
    ?.send('lustre:server-component:listen', { detail: { id, json } });
}

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,

    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadFile('index.html');
};

app.whenReady().then(() => {
  createWindow();
});
