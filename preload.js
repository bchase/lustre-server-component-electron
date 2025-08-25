const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('lustre', { 'server_component': {
  connect: async () => {
    return await ipcRenderer.invoke('lustre:server-component:connect');
  },

  send: async (msg) => {
    return await ipcRenderer.invoke('lustre:server-component:send', msg);
  },

  listen: (callback) => {
    return ipcRenderer.on('lustre:server-component:listen', (_event, { detail: { json } }) => {
      callback(json);
    });
  },

  close: async () => {
    return await ipcRenderer.invoke('lustre:server-component:close');
  },
}});
