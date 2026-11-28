/**
 * The Windows shell for Sprout Tower (docs/tech/02, "Electron shell"; docs/tech/06, saves).
 *
 * It opens one window on the bundled game page and nothing else: no menus, no
 * navigation, no new windows and no network. Saves are files written in this
 * process with a temporary file, a read-back check and an atomic rename, so a
 * crash or power cut mid-write never leaves a half-written save as the only copy.
 *
 * Installed: saves in %APPDATA%\Sprout Tower\saves\main\
 * Portable:  saves in SproutTowerData\saves\main\ beside the .exe
 */
'use strict';

const { app, BrowserWindow, ipcMain, session, shell } = require('electron');
const fs = require('node:fs');
const path = require('node:path');

// On a PC whose graphics driver Chromium refuses, draw with the built-in software renderer
// instead of failing to start. A working GPU is always used first. Only our own page runs here.
app.commandLine.appendSwitch('enable-unsafe-swiftshader');

const portableDir = process.env.PORTABLE_EXECUTABLE_DIR;
const portable = !!portableDir;
if (portable) app.setPath('userData', path.join(portableDir, 'SproutTowerData'));

const saveDir = path.join(app.getPath('userData'), 'saves', 'main');
const SAVE = path.join(saveDir, 'save.sprout');
const BACKUP = path.join(saveDir, 'save.backup.sprout');

/** The game page: the one-file build, packed beside the app, or the repository build in development. */
function gamePage() {
  const packed = path.join(process.resourcesPath, 'game', 'index.html');
  if (app.isPackaged) return packed;
  return path.join(__dirname, '..', '..', 'packages', 'game', 'dist-single', 'index.html');
}

// ---------------------------------------------------------------- saves

function readText(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch {
    return null;
  }
}

let seq = 0;
/** Writes `text` as the save: temp file, flush, read back, keep the old save as the backup, rename over. */
function writeSaveSync(text) {
  fs.mkdirSync(saveDir, { recursive: true });
  const tmp = path.join(saveDir, `save.tmp-${process.pid}-${++seq}`);
  const fd = fs.openSync(tmp, 'w');
  try {
    fs.writeSync(fd, text, 0, 'utf8');
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
  if (fs.readFileSync(tmp, 'utf8') !== text) {
    fs.rmSync(tmp, { force: true });
    throw new Error('save read-back did not match');
  }
  if (fs.existsSync(SAVE)) fs.copyFileSync(SAVE, BACKUP);
  // Antivirus or the indexer can hold the file for a moment; try a few times.
  for (let i = 0; ; i++) {
    try {
      fs.renameSync(tmp, SAVE);
      return;
    } catch (err) {
      if (i >= 4 || !['EPERM', 'EBUSY', 'EACCES'].includes(err.code)) throw err;
      const until = Date.now() + 50 * 2 ** i;
      while (Date.now() < until) {
        /* short wait before the next try */
      }
    }
  }
}

/**
 * The newest save text not yet on disk. One write runs at a time and newer text
 * replaces older text still waiting. After a failed write it stays here, and the
 * next autosave or the way out tries again.
 */
let latest = null;
let queued = false;
function queueWrite(text) {
  latest = text;
  if (queued) return;
  queued = true;
  setImmediate(() => {
    queued = false;
    if (latest === null) return;
    try {
      writeSaveSync(latest);
      latest = null;
    } catch (err) {
      console.error('[save] write failed', err);
    }
  });
}

ipcMain.handle('save:read', () => ({ main: readText(SAVE), backup: readText(BACKUP) }));
ipcMain.on('save:write', (_e, text) => {
  if (typeof text === 'string' && text.length < 50_000_000) queueWrite(text);
});
ipcMain.on('save:writeSync', (e, text) => {
  let ok = false;
  if (typeof text === 'string' && text.length < 50_000_000) {
    try {
      writeSaveSync(text);
      latest = null;
      ok = true;
    } catch (err) {
      console.error('[save] final write failed', err);
      latest = text;
    }
  }
  e.returnValue = ok;
});
ipcMain.on('save:wipe', (e) => {
  latest = null;
  for (const f of [SAVE, BACKUP]) fs.rmSync(f, { force: true });
  e.returnValue = true;
});
ipcMain.on('shell:info', (e) => {
  e.returnValue = { portable, version: app.getVersion(), saveDir };
});
ipcMain.on('shell:fullscreen', (e) => {
  const win = BrowserWindow.fromWebContents(e.sender);
  if (win) win.setFullScreen(!win.isFullScreen());
});
ipcMain.on('shell:openSaves', () => {
  fs.mkdirSync(saveDir, { recursive: true });
  void shell.openPath(saveDir);
});

// ---------------------------------------------------------------- window

if (!app.requestSingleInstanceLock()) {
  // A second copy would write the same save; hand focus to the first and leave.
  app.quit();
} else {
  let win = null;

  app.on('second-instance', () => {
    if (!win) return;
    if (win.isMinimized()) win.restore();
    win.focus();
  });

  app.whenReady().then(() => {
    // The game makes no network requests at all; refuse anything that is not a local file or inline data.
    session.defaultSession.webRequest.onBeforeRequest((details, cb) => {
      const ok = /^(file|data|blob|devtools|chrome-extension):/.test(details.url);
      cb({ cancel: !ok });
    });
    session.defaultSession.setPermissionRequestHandler((_wc, _perm, cb) => cb(false));

    win = new BrowserWindow({
      width: 1280,
      height: 720,
      minWidth: 640,
      minHeight: 360,
      useContentSize: true,
      backgroundColor: '#2a1f3d',
      title: 'Sprout Tower',
      autoHideMenuBar: true,
      show: false,
      webPreferences: {
        preload: path.join(__dirname, 'preload.cjs'),
        contextIsolation: true,
        sandbox: true,
        nodeIntegration: false,
        // The tower keeps earning at the full rate while the window is in the background (GDD 15.1).
        backgroundThrottling: false,
        autoplayPolicy: 'no-user-gesture-required',
        spellcheck: false,
      },
    });
    win.removeMenu();
    win.once('ready-to-show', () => win.show());

    const wc = win.webContents;
    // Reloading the game page (after a reset) is the only navigation allowed.
    wc.on('will-navigate', (e, url) => {
      if (url !== wc.getURL()) e.preventDefault();
    });
    wc.setWindowOpenHandler(() => ({ action: 'deny' }));
    wc.on('before-input-event', (e, input) => {
      if (input.type !== 'keyDown') return;
      if (input.key === 'F11' || (input.alt && input.key === 'Enter')) {
        win.setFullScreen(!win.isFullScreen());
        e.preventDefault();
      }
      if (input.key === 'F12' && !app.isPackaged) wc.toggleDevTools();
    });
    // A crashed page is reloaded; the last save on disk is where it picks up.
    wc.on('render-process-gone', (_e, details) => {
      if (details.reason !== 'clean-exit' && !win.isDestroyed()) wc.reload();
    });

    void win.loadFile(gamePage());
    win.on('closed', () => {
      win = null;
    });
  });

  app.on('window-all-closed', () => app.quit());

  // A write still waiting when the app closes goes to disk before it exits.
  app.on('will-quit', () => {
    if (latest) {
      try {
        writeSaveSync(latest);
      } catch (err) {
        console.error('[save] write on quit failed', err);
      }
      latest = null;
    }
  });
}
