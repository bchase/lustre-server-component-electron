import { app, ipcMain, BrowserWindow } from 'electron';
import { fileURLToPath } from 'url';
import path from 'path';
import * as GleamCounter from './build/dev/javascript/counter/app.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let sockets = {};
let windows = {};

function makeId() {
  return btoa(`${performance.now()}${Math.random()}`.replaceAll('.', ''));
}

function getId(event) {
  const win = BrowserWindow.fromWebContents(event.sender);
  return win.lustre.server_component.socket_id;
}

ipcMain.handle('lustre:server-component:connect', async (event) => {
  const id = makeId();
  const win = BrowserWindow.fromWebContents(event.sender);

  win['lustre'] = { server_component: { socket_id: id }};

  windows[id] = win;
  sockets[id] = GleamCounter.init_counter_socket(id);

  return null;
});

ipcMain.handle('lustre:server-component:send', async (event, msg) => {
  const id = getId(event);

  GleamCounter.handle_websocket_message(sockets[id], msg);

  return null;
});

ipcMain.handle('lustre:server-component:close', async (event) => {
  const id = getId(event);

  delete sockets[id];
  delete windows[id];

  // TODO ?

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
