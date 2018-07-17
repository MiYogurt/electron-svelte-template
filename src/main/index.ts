import { app, BrowserWindow, ipcMain as ipc, Tray, Menu } from 'electron'
import util from 'electron-util'
import { fromEvent } from 'rxjs'
import download from './download'
import log from './statusLog'
import { on } from './helper'
import transform from './TTS'
import { store } from './tray'
import { resolve } from 'path'
import loadPlugins from './plugins'
import Positioner from 'electron-positioner'
import { opensetting } from './tray'

let mainWindow: BrowserWindow | null
let plugins: any[]
let tray: Tray
let positioner: any

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
    const plugin = plugins.find((plugin: any) => args.url.match(plugin.regexp))
    if (typeof plugin == 'undefined') {
      log({ type: 'error', message: '没有找到处理该页面的规则' })
      return
    }
    const { folderName, url } = args
    const savePath = resolve(
      store.get('SAVA_PATH', app.getPath('music')),
      folderName
    )
    store.set('stop', false)
    // await download(url, plugin, { path: savePath })
    await transform(savePath)
    store.set('stop', false)
  })

  on('stop').subscribe(() => {
    store.set('stop', true)
  })
}

function setPostion(win: BrowserWindow) {
  positioner = new Positioner(win)
  positioner.move('trayCenter', tray.getBounds())
  win.show()
}

function createTray() {
  tray = new Tray(resolve(__dirname, 'tray_w24h24.png'))
  const contextMenu = Menu.buildFromTemplate([
    { label: '设置', click: opensetting },
    {
      label: '退出',
      role: 'quit'
    }
  ])
  const toggle = () => {
    if (!mainWindow) {
      return
    }
    if (mainWindow.isVisible()) {
      return mainWindow.hide()
    }
    positioner.move('trayCenter', tray.getBounds())
    mainWindow.show()
  }
  tray.on('click', toggle)
  tray.on('double-click', toggle)
  tray.on('right-click', () => {
    tray.popUpContextMenu(contextMenu)
  })
}

async function ready() {
  mainWindow = createMainWindow({
    width: 400,
    height: 560,
    frame: false,
    transparent: true,
    show: false
  })
  createTray()
  setPostion(mainWindow)
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
process.on('uncaughtException', console.log)

export { mainWindow }
