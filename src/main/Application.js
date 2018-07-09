import electron from 'electron'
import util from 'electron-util'
import camelcase from 'camelcase'
import events from './events'

class Application {
  constructor() {
    electron.app.on('ready', this.ready.bind(this))
  }

  initEvent() {
    events.forEach(name => {
      if (this[camelcase(name)]) {
        this.app.on(name, this[camelcase(name)].bind(this))
      }
    })
  }

  createMainWindow(opts) {
    const win = new electron.BrowserWindow(opts)

    if (util.is.development) {
      win.webContents.openDevTools()
      win.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
    } else {
      util.loadFile(win, 'index.html')
    }

    win.on('close', () => {
      this.mainWindow = null
    })

    win.webContents.on('devtools-opened', () => {
      win.focus()
      setImmediate(() => win.focus())
    })

    return win
  }

  windowAllClosed() {
    if (util.is.macos) {
      electron.app.quit()
    }
  }

  activate() {
    if (!this.mainWindow) {
      this.mainWindow = this.createMainWindow()
    }
  }

  async ready() {
    Object.assign(this, electron)
    this.mainWindow = this.createMainWindow()
    this.initEvent()
  }
}

export default Application
