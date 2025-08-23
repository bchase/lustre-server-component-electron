import { app, ipcMain, BrowserWindow } from 'electron';
import { fileURLToPath } from 'url';
import path from 'path';
import * as GleamCounter from './build/dev/javascript/counter/app.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let socket = null;

ipcMain.handle('lustre:server-component:connect', async (event) => {
  socket = GleamCounter.init_counter_socket();

  console.log(counterSocket);

  return null;
});

ipcMain.handle('lustre:server-component:message', async (event, data) => {
  // TODO
});

ipcMain.handle('lustre:server-component:close', async (event) => {
  // TODO
});


export async function setupWebSocket(server) {
  const wss = new WebSocketServer({
    server,
    path: '/ws'
  });

  wss.on('connection', (ws, req) => {
    console.log('New WebSocket connection established');

    // Initialize the counter component for this connection
    const counterSocket = GleamApp.init_counter_socket(ws);
    console.log(counterSocket);
    connections.set(ws, counterSocket);
    console.log("SET");
    currentSocket = ws; // Set current socket for sending messages

    ws.on('message', (data) => {
      try {
        const message = data.toString();
        console.log('Received WebSocket message:', message);

        const socket = connections.get(ws);
        if (socket) {
          const updatedSocket = GleamApp.handle_websocket_message(socket, message);
          connections.set(ws, updatedSocket);
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
      const socket = connections.get(ws);
      if (socket) {
        GleamApp.close_counter_socket(socket);
        connections.delete(ws);
      }
      if (currentSocket === ws) {
        currentSocket = null;
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      const socket = connections.get(ws);
      if (socket) {
        GleamApp.close_counter_socket(socket);
        connections.delete(ws);
      }
    });

    // Send initial message to establish connection
    ws.send(JSON.stringify({ type: 'connected' }));
  });

  console.log('WebSocket server setup complete on /ws');
}

// Function called from Gleam to send messages to the client
export function sendToClient(message) {
  throw "IMPLEMENT `sendToClient`";
  // if (ws && ws.readyState === 1) { // WebSocket.OPEN
  //   ws.send(message);
  //   console.log('Sent message to client:', message);
  // } else {
  //   console.warn('No active WebSocket connection to send message to');
  // }
}

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,

    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // win.loadURL('http://localhost:1234/');
  // win.loadURL('http://localhost:3000/');
  win.loadFile('index.html');
};

app.whenReady().then(() => {
  createWindow();
});
