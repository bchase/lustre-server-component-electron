const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('lustre', { 'server_component': {
  connect: async (id) => {
    return await ipcRenderer.invoke('lustre:server-component:connect', id);
  },

  send: async (id, msg) => {
    return await ipcRenderer.invoke('lustre:server-component:send', id, msg);
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
