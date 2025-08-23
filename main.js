import { app, ipcMain, BrowserWindow } from 'electron';
import { fileURLToPath } from 'url';
import path from 'path';
import * as GleamCounter from './build/dev/javascript/counter/app.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let socket = null;

ipcMain.handle('lustre:server-component:connect', async (_event) => {
  socket = GleamCounter.init_counter_socket();

  return null;
});

ipcMain.handle('lustre:server-component:send', async (_event, msg) => {
  GleamCounter.handle_websocket_message(socket, msg);

  return null;
});

ipcMain.handle('lustre:server-component:close', async (_event) => {
  return null;
});


export function sendToClient(json) {
  BrowserWindow.getAllWindows().forEach((electron_window) => {
    electron_window.webContents.send('lustre:server-component:listen', { detail: { json } });
  });
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
