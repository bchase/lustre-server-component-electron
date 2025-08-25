const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('lustre_sc_connect', async () => {
  return await ipcRenderer.invoke('lustre:server-component:connect');
});

contextBridge.exposeInMainWorld('lustre_sc_send', async (msg) => {
  return await ipcRenderer.invoke('lustre:server-component:send', msg);
});

contextBridge.exposeInMainWorld('lustre_sc_listen', (callback) => {
  return ipcRenderer.on('lustre:server-component:listen', (_event, { detail: { json } }) => {
    callback(json);
  });
});

contextBridge.exposeInMainWorld('lustre_sc_close', async () => {
  return await ipcRenderer.invoke('lustre:server-component:close');
});
