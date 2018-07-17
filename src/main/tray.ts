import create, { init, store } from 'electron-auto-setting'
import { app, Tray, Menu } from 'electron'
import { resolve } from 'path'

let win

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
      },
      TTS_WAIT: {
        type: 'string',
        label: 'TTS 等待时长（毫秒）',
        defaultValue: 1500
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

export { store, opensetting }
