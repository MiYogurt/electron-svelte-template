import { app, BrowserWindow, ipcMain as ipc } from 'electron'
import util from 'electron-util'
import { fromEvent } from 'rxjs'
import download from './download'
import log from './statusLog'
import { on } from './helper'
import transform from './TTS'
import { store } from './tray'
import { resolve } from 'path'
import loadPlugins from './plugins'

let mainWindow: BrowserWindow | null
let plugins: any[]

function createMainWindow(opts?: Electron.BrowserWindowConstructorOptions) {
  const win = new BrowserWindow(opts)

  if (util.is.development) {
    win.webContents.openDevTools()
    win.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
  } else {
    util.loadFile(win, 'index.html')
  }

  fromEvent(<any>win, 'close').subscribe(() => (mainWindow = null))

  fromEvent(<any>win.webContents, 'devtools-opened').subscribe(() => {
    win.focus()
    setImmediate(() => win.focus())
  })

  return win
}

function pluginSetUp() {
  const load = () => {
    let [_, temPlugins] = loadPlugins()
    plugins = temPlugins
  }
  load()
  on('reload_local_plugins').subscribe(load)
}

function crawlSetUp() {
  on('download').subscribe(async ({ event, args }) => {
    const plugin = plugins.find((plugin: any) => plugin.regexp.test(args.url))
    if (!plugin) {
      return log({ type: 'plugin', message: 'not support' })
    }

    const { folderName, url } = args
    const savePath = resolve(
      store.get('SAVA_PATH', app.getPath('music')),
      folderName
    )
    store.set('stop', false)
    await download(url, plugin, { path: savePath })
    await transform(savePath)
    store.set('stop', false)
  })

  on('stop').subscribe(() => {
    store.set('stop', true)
  })
}

async function ready() {
  mainWindow = createMainWindow({
    width: 400,
    height: 560,
    frame: false,
    transparent: true
  })
  pluginSetUp()
  crawlSetUp()
}

function windowAllClosed(): void {
  if (util.is.macos) {
    app.quit()
  }
}

function activate(): void {
  if (!mainWindow) {
    mainWindow = createMainWindow()
  }
}

const AppEventMap: any = {
  ready,
  'window-all-closed': windowAllClosed,
  activate
}

Object.keys(AppEventMap).map(eventName =>
  fromEvent(<any>app, eventName).subscribe(AppEventMap[eventName])
)

process.on('unhandledRejection', console.log)

export { mainWindow }
