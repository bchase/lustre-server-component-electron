# Lustre Server Components via Electron IPC Transport

## Run

```
$ npm install && gleam build && npm run start
```

# Explanation

Note: based on 088c1375af94ee576665f69e466ddb61d7917f91

## Motivation

[Electron](https://www.electronjs.org/) lets you write a Node JS application which can create native OS windows, inside of which you can render webviews for your UI.

You simply point Electron at a `.html` filepath, and it happily renders that HTML inside your window.

If you're building with Electron, you're necessarily running a Node JS process, which is capable of executing Gleam code (when targeted to JavaScript, of course).

So, with Node JS process already in hand, I then wanted to use [Lustre server components](https://hexdocs.pm/lustre/lustre/server_component.html), but I didn't want to bother with finding an open port, starting a server on it, and making sure that nothing happens to that server process while my `main.js` process is still running.

And that brought me  here.

## Implemenation

### Electron

`main.js` is the Node entrypoint, responsible for launching the Electron windows.

It also defines [the IPC and FFI functions](https://github.com/bchase/lustre-server-component-electron/blob/088c1375af94ee576665f69e466ddb61d7917f91/main.js#L9-L40) needed to act as transport for Lustre server components. The `ipcMain.handle` calls respond to calls to connect & incoming messages, and `sendToClient` is used for JS FFI in `src/app.gleam`.

`preload.js` [finishes the wiring](https://github.com/bchase/lustre-server-component-electron/blob/088c1375af94ee576665f69e466ddb61d7917f91/preload.js), by providing a means of calling the IPC functions via e.g. `window.lustre.server_component.connect(id)`.

### Modified Lustre Server Components Client

`bchase-lustre-server-component.mjs` adds [`ElectronTransport`](https://github.com/bchase/lustre-server-component-electron/blob/088c1375af94ee576665f69e466ddb61d7917f91/bchase-lustre-server-component.mjs#L844-L899), which it [initializes on `method="electron"`](https://github.com/bchase/lustre-server-component-electron/blob/088c1375af94ee576665f69e466ddb61d7917f91/bchase-lustre-server-component.mjs#L820-L823). It makes use of the `window.lustre.server_component` functions exposed via `preload.js` to call into the IPC hooks in `main.js`, which act as "the server", conceptually.

### Gleam APP

`counter.gleam` is a simple counter program, and `app.gleam` makes use of `main.js`'s `sendToClient` function [via JS FFI](https://github.com/bchase/lustre-server-component-electron/blob/088c1375af94ee576665f69e466ddb61d7917f91/src/app.gleam#L6-L7) to [initialize the server component](https://github.com/bchase/lustre-server-component-electron/blob/088c1375af94ee576665f69e466ddb61d7917f91/src/app.gleam#L16-L31) and [handle messages](https://github.com/bchase/lustre-server-component-electron/blob/088c1375af94ee576665f69e466ddb61d7917f91/src/app.gleam#L33-L44).
