/**
 * The only bridge between the game page and the Windows shell (docs/tech/02,
 * "The platform interface"). The page sees `window.sproutShell` and nothing else
 * of Electron or Node.
 */
'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('sproutShell', {
  info: ipcRenderer.sendSync('shell:info'),
  /** The save file and its backup, as text (null when missing). */
  readSave: () => ipcRenderer.invoke('save:read'),
  /** Queues a save write; returns at once. */
  writeSave: (text) => ipcRenderer.send('save:write', String(text)),
  /** Writes the save before returning. For the last save on the way out. */
  writeSaveNow: (text) => ipcRenderer.sendSync('save:writeSync', String(text)),
  wipeSave: () => ipcRenderer.sendSync('save:wipe'),
  toggleFullscreen: () => ipcRenderer.send('shell:fullscreen'),
  openSaveFolder: () => ipcRenderer.send('shell:openSaves'),
});
