import { app, ipcMain, BrowserWindow } from 'electron';
import { fileURLToPath } from 'url';
import path from 'path';
import * as GleamCounter from './build/dev/javascript/counter/app.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let sockets = {};
let windows = {};

ipcMain.handle('lustre:server-component:connect', async (event, id) => {
  windows[id] = BrowserWindow.fromWebContents(event.sender);
  sockets[id] = GleamCounter.init_counter_socket(id);

  return null;
});

ipcMain.handle('lustre:server-component:send', async (_event, id, msg) => {
  GleamCounter.handle_websocket_message(sockets[id], msg);

  return null;
});

ipcMain.handle('lustre:server-component:close', async (_event) => {
  // TODO clean up `sockets` & `windows`

  return null;
});


export function sendToClient(id, json) {
  const win = windows[id];

  if ( win ) {
    win.webContents.send('lustre:server-component:listen', { detail: { id, json } });
  } else {
    console.error(`Unable to find Electron window for ID: ${id}`);
  }
}

function createWindow(html_file_path) {
  const win = new BrowserWindow({
    width: 800,
    height: 600,

    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadFile(html_file_path);
};

app.whenReady().then(() => {
  createWindow('index.html');
  createWindow('other.html');
});
