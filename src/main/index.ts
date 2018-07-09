import { app, BrowserWindow } from "electron";
import util from "electron-util";
import { fromEvent } from "rxjs";

let mainWindow: BrowserWindow | null;

function createMainWindow(opts?: Electron.BrowserViewConstructorOptions) {
  const win = new BrowserWindow(opts);

  if (util.is.development) {
    win.webContents.openDevTools();
    win.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`);
  } else {
    util.loadFile(win, "index.html");
  }

  win.on("close", () => {
    mainWindow = null;
  });

  win.webContents.on("devtools-opened", () => {
    win.focus();
    setImmediate(() => win.focus());
  });

  return win;
}

function ready(): void {
  mainWindow = createMainWindow();
}

function windowAllClosed(): void {
  if (util.is.macos) {
    app.quit();
  }
}

function activate(): void {
  if (!mainWindow) {
    mainWindow = createMainWindow();
  }
}

const AppEventMap: { [name: string]: (e?: any) => void } = {
  ready,
  "window-all-closed": windowAllClosed,
  activate
};

Object.keys(AppEventMap).map(eventName =>
  fromEvent(<any>app, eventName).subscribe(AppEventMap[eventName])
);
