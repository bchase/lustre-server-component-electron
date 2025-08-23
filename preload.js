// import { contextBridge, ipcRenderer } from 'electron';
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('lustre', { 'server_component': {
  connect: async () => {
    return await ipcRenderer.invoke('lustre:server-component:connect');
  },

  // listen: (callback) => {
  //   return ipcRenderer.on('listen', (_event, data) => {
  //     callback(data);
  //   });
  // },
}});
