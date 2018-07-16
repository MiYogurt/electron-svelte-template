import create, { init, store } from 'electron-auto-setting'
import { app, Tray, Menu } from 'electron'
import { resolve } from 'path'
import { fromEvent } from 'rxjs'

let win = null
let tray = null

let setting = [
  {
    icon: 'icon-setting',
    label: '普通设置',
    configs: {
      SAVA_PATH: {
        type: 'path',
        label: ' 输出路径',
        defaultValue: resolve(app.getPath('home'), 'xiaoshuo')
      },
      PLUGIN_PATH: {
        type: 'path',
        label: ' 插件路径',
        defaultValue: resolve(app.getPath('home'), '.reader-app-scripts')
      },
      CONCURRENCE: {
        type: 'string',
        label: '下载并发量',
        defaultValue: 5
      }
    }
  },
  {
    icon: 'icon-download',
    label: 'API 设置',
    configs: {
      APP_ID: {
        type: 'string',
        label: '应用 ID',
        defaultValue: ''
      },
      API_KEY: {
        type: 'string',
        label: '应用秘钥',
        defaultValue: ''
      },
      SECRET_KEY: {
        type: 'string',
        label: '加密秘钥',
        defaultValue: ''
      }
    }
  }
]

init(setting)

function opensetting() {
  win = create({}, true)
}

fromEvent(<any>app, 'ready').subscribe(() => {
  tray = new Tray(resolve(__dirname, 'tray_w24h24.png'))
  const contextMenu = Menu.buildFromTemplate([
    { label: '设置', click: opensetting }
  ])
  tray.setContextMenu(contextMenu)
})

export { store, tray, win }
